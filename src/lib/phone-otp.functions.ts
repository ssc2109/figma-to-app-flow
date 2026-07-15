import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomInt } from "node:crypto";

// Normaliza a formato E.164. Si no empieza con +, asume Perú (+51).
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("51")) return `+${cleaned}`;
  return `+51${cleaned}`;
}

function hashCode(phone: string, code: string): string {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

async function sendTwilioSms(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const keySid = process.env.TWILIO_API_KEY_SID;
  const keySecret = process.env.TWILIO_API_KEY_SECRET;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !keySid || !keySecret || !from) {
    throw new Error("Twilio no está configurado");
  }
  const auth = Buffer.from(`${keySid}:${keySecret}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    console.error("Twilio error", res.status, text);

    let twilioCode: number | undefined;
    try {
      twilioCode = JSON.parse(text)?.code;
    } catch {
      // Twilio sometimes returns non-JSON errors; keep the generic handling below.
    }

    if (res.status === 401 || twilioCode === 70051 || twilioCode === 20003) {
      throw new Error(
        "La configuración de SMS no está autorizada. Revisa que la API Key de Twilio sea Main/Standard o que tenga Messages: Create, y que el SID/Secret pertenezcan a la misma cuenta.",
      );
    }

    if (twilioCode === 21408) {
      throw new Error("Twilio no tiene habilitado el envío de SMS hacia este país.");
    }

    throw new Error("No pudimos enviar el SMS. Revisa el número e intenta de nuevo.");
  }
}

export const sendPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ phone: z.string().min(6).max(20) }).parse(input),
  )
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Rate limit: no más de 1 envío por 45s
    const { data: recent } = await supabaseAdmin
      .from("phone_otps")
      .select("created_at")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent) {
      const ageMs = Date.now() - new Date(recent.created_at).getTime();
      if (ageMs < 45_000) {
        throw new Error(`Espera ${Math.ceil((45_000 - ageMs) / 1000)}s antes de pedir otro código`);
      }
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expires = new Date(Date.now() + 5 * 60_000).toISOString();

    const { data: otpRow, error } = await supabaseAdmin
      .from("phone_otps")
      .insert({
      phone,
      code_hash: hashCode(phone, code),
      expires_at: expires,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    try {
      await sendTwilioSms(phone, `Trax: tu código es ${code}. Vence en 5 min.`);
    } catch (err) {
      if (otpRow?.id) {
        await supabaseAdmin.from("phone_otps").delete().eq("id", otpRow.id);
      }
      throw err;
    }
    return { ok: true, phone };
  });

export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        phone: z.string().min(6).max(20),
        code: z.string().regex(/^\d{6}$/, "Debe ser 6 dígitos"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("phone_otps")
      .select("id, code_hash, expires_at, attempts, verified")
      .eq("phone", phone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!row) throw new Error("Solicita un nuevo código");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new Error("El código expiró. Pide uno nuevo.");
    }
    if (row.attempts >= 5) {
      throw new Error("Demasiados intentos. Pide un nuevo código.");
    }

    const expected = row.code_hash;
    const got = hashCode(phone, data.code);
    if (expected !== got) {
      await supabaseAdmin
        .from("phone_otps")
        .update({ attempts: row.attempts + 1 })
        .eq("id", row.id);
      throw new Error("Código incorrecto");
    }

    await supabaseAdmin.from("phone_otps").update({ verified: true }).eq("id", row.id);

    // Creamos/recuperamos el usuario con un email sintético basado en el teléfono
    // y devolvemos un magic link hashed_token para que el cliente establezca sesión.
    const digits = phone.replace(/\D/g, "");
    const syntheticEmail = `phone-${digits}@trax.auth`;

    // Intenta crear; si ya existe, sigue.
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { auth_via: "phone_otp", phone },
    });
    if (createErr && !/already been registered|already registered|exists/i.test(createErr.message)) {
      throw new Error(createErr.message);
    }

    const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: syntheticEmail,
    });
    if (linkErr || !link?.properties?.hashed_token) {
      throw new Error(linkErr?.message ?? "No pudimos iniciar la sesión");
    }

    return {
      ok: true,
      token_hash: link.properties.hashed_token,
      email: syntheticEmail,
    };
  });
