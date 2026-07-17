/**
 * ============================================================
 *  Trax · Facturación Electrónica SUNAT — Estructura preparada
 * ============================================================
 *
 * Este archivo define la INTERFAZ que Trax expondrá para emitir,
 * consultar y anular comprobantes electrónicos (factura, boleta,
 * nota de crédito y nota de débito) ante SUNAT.
 *
 *  IMPORTANTE — LEER ANTES DE ENLAZAR EN PRODUCCIÓN
 *  -------------------------------------------------
 *  SUNAT NO recibe XML directamente desde una app: la normativa
 *  peruana obliga a que el emisor firme cada comprobante con un
 *  Certificado Digital Tributario y lo envíe a través de un
 *  OSE (Operador de Servicios Electrónicos) o un PSE (Proveedor
 *  de Servicios Electrónicos) autorizados por SUNAT.
 *
 *  Antes de que Trax pueda emitir CPE reales el dueño del
 *  negocio necesita:
 *    1) RUC habido y afecto a IGV (régimen general, MYPE, RER, NRUS).
 *    2) Contratar un OSE/PSE autorizado — por ejemplo:
 *          · Nubefact           (https://www.nubefact.com)
 *          · Facturactiva       (https://facturactiva.pe)
 *          · Efact / The Factory HKA / Sunat SEE-OSE certificado
 *    3) Un Certificado Digital Tributario vigente (.pfx) emitido
 *       por una entidad autorizada por INDECOPI.
 *    4) Series y numeración autorizadas por SUNAT (F001, B001…).
 *    5) Credenciales del ambiente de PRUEBA del OSE para QA y,
 *       luego, credenciales de PRODUCCIÓN una vez homologado.
 *
 *  Todo eso se guarda como Secrets del proyecto (nunca en código):
 *    SUNAT_OSE_PROVIDER          "nubefact" | "facturactiva" | ...
 *    SUNAT_OSE_API_URL           URL base del ambiente (test/prod)
 *    SUNAT_OSE_API_TOKEN         token del OSE (por RUC emisor)
 *    SUNAT_EMISOR_RUC            RUC del emisor
 *    SUNAT_EMISOR_RAZON_SOCIAL   razón social exacta
 *    SUNAT_CERT_PFX_BASE64       .pfx del certificado en base64
 *    SUNAT_CERT_PFX_PASSWORD     contraseña del .pfx
 *
 *  Este archivo intencionalmente NO implementa las llamadas HTTP
 *  reales — solo define tipos, entradas y salidas — para que la
 *  UI de "Datos fiscales" pueda tiparse y probarse contra stubs
 *  mientras el dueño completa los trámites anteriores.
 * ============================================================
 */

// ---------- Tipos base ----------

export type SunatDocType =
  | "01" // Factura
  | "03" // Boleta de venta
  | "07" // Nota de crédito
  | "08"; // Nota de débito

export type SunatCurrency = "PEN" | "USD";

export type SunatCustomerDocType =
  | "1" // DNI
  | "6" // RUC
  | "4" // Carnet de extranjería
  | "7"; // Pasaporte

export interface SunatCustomer {
  docType: SunatCustomerDocType;
  docNumber: string;
  legalName: string; // razón social o nombre completo
  address?: string;
  email?: string;
}

export interface SunatLineItem {
  productCode?: string;
  description: string;
  quantity: number;
  unitPrice: number; // sin IGV
  igvRate?: number; // 0.18 por defecto
  unitMeasure?: string; // "NIU" (unidades) por defecto
}

export interface EmitInput {
  docType: SunatDocType;
  series: string; // p.ej. "F001" (factura) o "B001" (boleta)
  correlative?: number; // si el OSE lo asigna, dejar undefined
  issueDate: string; // ISO
  currency: SunatCurrency;
  customer: SunatCustomer;
  items: SunatLineItem[];
  notes?: string;
  /** Sólo notas de crédito/débito */
  reference?: {
    referredDocType: SunatDocType;
    referredSeries: string;
    referredCorrelative: number;
    reason: string; // catálogo SUNAT 09/10
  };
}

export interface EmitResult {
  ok: boolean;
  /** Identificador interno del OSE (para consultar / anular después) */
  providerId?: string;
  /** F001-000123 */
  serialized?: string;
  /** URL pública del PDF (representación impresa) */
  pdfUrl?: string;
  /** URL pública del XML firmado */
  xmlUrl?: string;
  /** Hash de la CDR de SUNAT (constancia de recepción) */
  cdrHash?: string;
  error?: string;
}

export interface QueryInput {
  providerId?: string;
  docType?: SunatDocType;
  series?: string;
  correlative?: number;
}

export interface QueryResult {
  ok: boolean;
  status?: "PENDIENTE" | "ACEPTADO" | "RECHAZADO" | "ANULADO";
  sunatResponseCode?: string;
  sunatResponseDescription?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  cdrHash?: string;
  error?: string;
}

export interface VoidInput {
  providerId: string;
  reason: string; // motivo de la comunicación de baja
}

export interface VoidResult {
  ok: boolean;
  ticket?: string; // SUNAT devuelve un ticket para consultar la baja
  error?: string;
}

// ---------- Interfaz pública (implementar cuando exista OSE contratado) ----------

/**
 * Emite un comprobante electrónico ante el OSE contratado.
 * Debe:
 *   1. Construir el XML UBL 2.1 según catálogos SUNAT.
 *   2. Firmarlo con SUNAT_CERT_PFX_BASE64 + SUNAT_CERT_PFX_PASSWORD.
 *   3. Enviarlo al OSE (SUNAT_OSE_API_URL) con SUNAT_OSE_API_TOKEN.
 *   4. Persistir providerId, serialized, pdfUrl, xmlUrl en la tabla
 *      `invoices` (a crear cuando corresponda).
 */
export async function emitirComprobante(_input: EmitInput): Promise<EmitResult> {
  return {
    ok: false,
    error:
      "SUNAT no configurado. Contrata un OSE/PSE (ej. Nubefact) y carga el certificado digital antes de emitir comprobantes.",
  };
}

/** Consulta el estado de un comprobante ya emitido en el OSE. */
export async function consultarComprobante(_input: QueryInput): Promise<QueryResult> {
  return {
    ok: false,
    error: "SUNAT no configurado.",
  };
}

/** Anula (comunicación de baja) un comprobante emitido. */
export async function anularComprobante(_input: VoidInput): Promise<VoidResult> {
  return {
    ok: false,
    error: "SUNAT no configurado.",
  };
}

/**
 * Helper de estado: la UI puede llamarlo para saber si mostrar el
 * banner "Habilita facturación electrónica" o si ya está operativo.
 */
export function isSunatConfigured(): boolean {
  // Cuando se implemente el envío real, esto verificará que existan
  // las variables SUNAT_OSE_API_URL, SUNAT_OSE_API_TOKEN, SUNAT_EMISOR_RUC
  // y el certificado. Por ahora siempre false.
  return false;
}
