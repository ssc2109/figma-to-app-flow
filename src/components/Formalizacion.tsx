import { useEffect, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  HeartPulse,
  Landmark,
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  X,
  HelpCircle,
  CheckCircle2,
  FileText,
  Scale,
  Building,
  Fingerprint,
  KeyRound,
  MapPin,
  Store,
  Users,
  Sparkles,
  Lock,
  Receipt,
  Briefcase,
} from 'lucide-react';

type View = 'entry' | 'learning' | 'building';
type TipoPersona = 'natural' | 'juridica';
type TerminoKey = 'minuta' | 'domicilio' | 'clavesol' | 'ruc10' | 'ruc20' | 'nrus' | 'gratificacion' | 'cts';
type Termino = { titulo: string; texto: string };

const terminos: Record<TerminoKey, Termino> = {
  minuta: {
    titulo: 'La Minuta',
    texto:
      'Es la partida de nacimiento de tu empresa. Un documento donde se declara quiénes son los dueños, qué van a vender y cuánto capital aportan para empezar.',
  },
  domicilio: {
    titulo: 'Domicilio Fiscal',
    texto:
      'La dirección oficial de tu negocio. Es el lugar donde SUNAT te ubica para entregarte notificaciones. Puede ser tu casa o tu local.',
  },
  clavesol: {
    titulo: 'Clave SOL',
    texto:
      'Es como el PIN de tu tarjeta bancaria, pero para SUNAT. Con ella entras a su sistema para emitir boletas o pagar impuestos por internet.',
  },
  ruc10: {
    titulo: 'RUC 10 · Persona Natural',
    texto:
      'Trabajas con tu propio DNI. Es rápido y barato, pero respondes con tus bienes personales (casa, ahorros) ante cualquier deuda del negocio.',
  },
  ruc20: {
    titulo: 'RUC 20 · Persona Jurídica',
    texto:
      'Creas una empresa separada de ti. Protege tu patrimonio personal porque el negocio responde por sí mismo ante deudas o problemas legales.',
  },
  nrus: {
    titulo: 'Nuevo RUS (NRUS)',
    texto:
      'Régimen simplificado para pequeños negocios. Pagas una cuota fija mensual (desde S/20) según tus ingresos. No llevas contabilidad compleja.',
  },
};

/* ============================================================
   Root
   ============================================================ */
const Formalizacion = () => {
  const [currentView, setCurrentView] = useState<View>('entry');
  const [glosario, setGlosario] = useState<Termino | null>(null);

  const abrirGlosario = (k: TerminoKey) => setGlosario(terminos[k]);
  const cerrarGlosario = () => setGlosario(null);

  return (
    <div className="w-full bg-black text-white/90">
      {currentView === 'entry' && <EntryView onStart={() => setCurrentView('learning')} />}
      {currentView === 'learning' && (
        <LearningView
          onFinish={() => setCurrentView('building')}
          onBack={() => setCurrentView('entry')}
        />
      )}
      {currentView === 'building' && (
        <BuildingView onBack={() => setCurrentView('learning')} openGlossary={abrirGlosario} />
      )}

      {/* Glossary bottom sheet */}
      {glosario && <GlossarySheet term={glosario} onClose={cerrarGlosario} />}
    </div>
  );
};

/* ============================================================
   ENTRY
   ============================================================ */
function EntryView({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full px-4 pt-10">
      <div className="mb-8">
        <p className="font-['Geist'] text-[11px] uppercase tracking-[1.6px] text-white/40">
          Crecer · Formalización
        </p>
        <h1 className="mt-2 font-['Bai_Jamjuree'] text-[30px] font-semibold tracking-[-0.6px] leading-[1.1]">
          Construye tu negocio,
          <br />
          piso por piso.
        </h1>
      </div>

      <div
        className="w-full rounded-[24px] p-6 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(160deg, rgba(59,130,246,0.14) 0%, rgba(24,24,27,0.6) 45%, rgba(9,9,11,1) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* soft blue glow */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40"
          style={{ background: '#3b82f6' }}
        />

        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
            }}
          >
            <Building2 className="w-7 h-7 text-[#3b82f6]" strokeWidth={1.6} />
          </div>

          <h2 className="font-['Bai_Jamjuree'] text-[22px] font-semibold tracking-[-0.3px] text-white">
            Ruta de Formalización
          </h2>
          <p className="mt-2 font-['Geist'] text-[14px] leading-[1.55] text-white/55">
            Un camino guiado en 7 pisos. Aprende los beneficios, elige tu ruta y obtén tu RUC sin
            miedo a la SUNAT.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <MetaChip icon={<ShieldCheck className="w-3.5 h-3.5" />} label="SIS gratis" />
            <MetaChip icon={<Landmark className="w-3.5 h-3.5" />} label="Créditos" />
            <MetaChip icon={<Sparkles className="w-3.5 h-3.5" />} label="Sin miedo" />
          </div>

          <button
            onClick={onStart}
            className="mt-7 w-full h-[52px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[15px] font-semibold text-white"
          >
            Comenzar
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <p className="mt-6 text-center font-['Geist'] text-[12px] text-white/30">
        Toma unos 15 minutos · 100% en línea
      </p>
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-['Geist'] text-[11px] text-white/70"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/* ============================================================
   LEARNING · Carousel
   ============================================================ */
const slides = [
  {
    icon: Building2,
    tone: '#3b82f6',
    eyebrow: 'Primero lo básico',
    title: '¿Qué es la formalización?',
    body: 'Es registrar tu negocio ante el Estado para que exista oficialmente. No es un castigo ni te va a robar la SUNAT o el Gobierno; es proteger tu esfuerzo, tu negocio y abrirle las puertas al crecimiento real, con ventajas que antes no tenías.',
  },
  {
    icon: HeartPulse,
    tone: '#22c55e',
    eyebrow: 'Beneficio 01',
    title: 'Salud para tu familia',
    body: 'Con el SIS Emprendedor tú y tu familia acceden a atención médica gratuita en toda la red pública. Solo por estar en el NRUS.',
  },
  {
    icon: Landmark,
    tone: '#3b82f6',
    eyebrow: 'Beneficio 02',
    title: 'Créditos bancarios',
    body: 'Un RUC activo abre las puertas a tasas más bajas, líneas de capital de trabajo y financiamiento para crecer sin depender de prestamistas.',
  },
  {
    icon: ShieldCheck,
    tone: '#a78bfa',
    eyebrow: 'Beneficio 03',
    title: 'Protección de bienes',
    body: 'Al operar como empresa (RUC 20) separas tu patrimonio del negocio. Tu casa y ahorros quedan protegidos si algo sale mal.',
  },
];

function LearningView({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  const [i, setI] = useState(0);
  const slide = slides[i];
  const Icon = slide.icon;
  const isLast = i === slides.length - 1;

  return (
    <div className="w-full px-4 pt-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => (i === 0 ? onBack() : setI(i - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/[0.04] transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-white/70" strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className="h-1 rounded-full transition-all"
              style={{
                width: idx === i ? 22 : 6,
                background: idx === i ? '#3b82f6' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        <button
          onClick={onFinish}
          className="font-['Geist'] text-[12px] text-white/40 hover:text-white/70 transition-colors"
        >
          Saltar
        </button>
      </div>

      <div
        className="w-full rounded-[24px] p-7 min-h-[440px] flex flex-col relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${slide.tone}18 0%, rgba(15,15,17,0.9) 55%, rgba(9,9,11,1) 100%)`,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30"
          style={{ background: slide.tone }}
        />

        <div className="relative flex-1 flex flex-col">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
            style={{
              background: `${slide.tone}1a`,
              border: `1px solid ${slide.tone}40`,
            }}
          >
            <Icon className="w-8 h-8" style={{ color: slide.tone }} strokeWidth={1.6} />
          </div>

          <p
            className="font-['Geist'] text-[11px] uppercase tracking-[1.6px]"
            style={{ color: slide.tone }}
          >
            {slide.eyebrow}
          </p>
          <h2 className="mt-2 font-['Bai_Jamjuree'] text-[28px] font-semibold tracking-[-0.5px] text-white leading-[1.15]">
            {slide.title}
          </h2>
          <p className="mt-4 font-['Geist'] text-[15px] leading-[1.6] text-white/60">
            {slide.body}
          </p>
        </div>
      </div>

      <button
        onClick={() => (isLast ? onFinish() : setI(i + 1))}
        className="mt-6 w-full h-[52px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[15px] font-semibold text-white"
      >
        {isLast ? 'Empezar a construir' : 'Siguiente'}
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

/* ============================================================
   BUILDING · Vertical floors
   ============================================================ */
type Floor = { n: number; label: string; short: string };
const floors: Floor[] = [
  { n: 1, label: 'Beneficios', short: 'P1' },
  { n: 2, label: 'Tu ruta', short: 'P2' },
  { n: 3, label: 'Crear empresa', short: 'P3' },
  { n: 4, label: 'RUC · SUNAT', short: 'P4' },
  { n: 5, label: 'Tu Local Oficial', short: 'P5' },
  { n: 6, label: 'Facturación Electrónica', short: 'P6' },
  { n: 7, label: 'Crecer con Equipo', short: 'P7' },
];

function BuildingView({
  onBack,
  openGlossary,
}: {
  onBack: () => void;
  openGlossary: (k: TerminoKey) => void;
}) {
  const [floor, setFloor] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = Number(window.localStorage.getItem('trax.activeFloor'));
    return Number.isFinite(v) && v >= 1 && v <= 7 ? v : 1;
  });
  const [tipoPersona, setTipoPersona] = useState<TipoPersona | null>(null);
  const [unlockedFloor, setUnlockedFloor] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = Number(window.localStorage.getItem('trax.unlockedFloor'));
    return Number.isFinite(v) && v >= 1 && v <= 7 ? v : 1;
  });
  const [nombreNegocioTrax, setNombreNegocioTrax] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('trax.nombreNegocioTrax') ?? '';
  });

  useEffect(() => {
    window.localStorage.setItem('trax.activeFloor', String(floor));
  }, [floor]);
  useEffect(() => {
    window.localStorage.setItem('trax.unlockedFloor', String(unlockedFloor));
  }, [unlockedFloor]);
  useEffect(() => {
    window.localStorage.setItem('trax.nombreNegocioTrax', nombreNegocioTrax);
  }, [nombreNegocioTrax]);

  // Se llamará SOLO desde validaciones específicas de cada piso (Parte 2+).
  const advanceFloor = (target?: number) => {
    setUnlockedFloor((prev) => {
      const next = Math.min(Math.max(prev, target ?? prev + 1), floors.length);
      if (next > floor) setFloor(next);
      return next;
    });
  };
  // Retro-compat: alias usado por props existentes.
  const handleCompleteFloor = () => advanceFloor();
  void nombreNegocioTrax; void setNombreNegocioTrax;


  return (
    <div className="w-full px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/[0.04] transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-white/70" strokeWidth={1.8} />
        </button>
        <div>
          <p className="font-['Geist'] text-[11px] uppercase tracking-[1.6px] text-white/40">
            Edificio · Formalización
          </p>
          <h1 className="font-['Bai_Jamjuree'] text-[20px] font-semibold tracking-[-0.3px]">
            Piso {floor} · {floors[floor - 1].label}
          </h1>
        </div>
      </div>

      <div className="flex gap-3 w-full h-[550px]">
        {/* Vertical floor selector (static) */}
        <div
          className="shrink-0 w-[62px] rounded-[20px] p-2 flex flex-col-reverse gap-1.5 self-start"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {floors.map((f) => {
            const active = floor === f.n;
            const locked = f.n > unlockedFloor;
            return (
              <button
                key={f.n}
                {...(locked ? {} : { onClick: () => setFloor(f.n) })}
                disabled={locked}
                aria-disabled={locked}
                className="w-full h-[52px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 transition-all relative disabled:cursor-not-allowed"
                style={{
                  background: active
                    ? '#3b82f6'
                    : locked
                      ? 'rgba(255,255,255,0.015)'
                      : 'rgba(255,255,255,0.025)',
                  border: active
                    ? '1px solid #3b82f6'
                    : locked
                      ? '1px solid rgba(255,255,255,0.03)'
                      : '1px solid rgba(255,255,255,0.05)',
                  opacity: locked ? 0.5 : 1,
                }}
              >
                {locked ? (
                  <Lock className="w-3.5 h-3.5 text-white/40" strokeWidth={2} />
                ) : (
                  <span
                    className="font-['Bai_Jamjuree'] text-[13px] font-semibold"
                    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.65)' }}
                  >
                    {f.short}
                  </span>
                )}
                <span
                  className="font-['Geist'] text-[8.5px] uppercase tracking-[0.6px] leading-none"
                  style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}
                >
                  {f.n === 1 ? 'Inicio' : f.n === 7 ? 'Top' : `·`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Floor content (scrollable) */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto pr-1">
          <FloorContent
            floor={floor}
            tipoPersona={tipoPersona}
            setTipoPersona={setTipoPersona}
            openGlossary={openGlossary}
            isLastUnlocked={floor === unlockedFloor}
            onCompleteFloor={handleCompleteFloor}
            unlockedFloor={unlockedFloor}
            advanceFloor={advanceFloor}
            nombreNegocioTrax={nombreNegocioTrax}
            setNombreNegocioTrax={setNombreNegocioTrax}
          />
        </div>
      </div>

    </div>
  );
}

/* ============================================================
   Floor contents
   ============================================================ */
function FloorContent({
  floor,
  tipoPersona,
  setTipoPersona,
  openGlossary,
  unlockedFloor,
  advanceFloor,
  nombreNegocioTrax,
  setNombreNegocioTrax,
  isLastUnlocked,
}: {
  floor: number;
  tipoPersona: TipoPersona | null;
  setTipoPersona: (t: TipoPersona) => void;
  openGlossary: (k: TerminoKey) => void;
  isLastUnlocked: boolean;
  onCompleteFloor: () => void;
  unlockedFloor: number;
  advanceFloor: (target?: number) => void;
  nombreNegocioTrax: string;
  setNombreNegocioTrax: (v: string) => void;
}) {
  if (floor === 1) return <FloorOne unlockedFloor={unlockedFloor} advanceFloor={advanceFloor} openGlossary={openGlossary} />;
  if (floor === 2) return (
    <FloorTwo
      unlockedFloor={unlockedFloor}
      advanceFloor={advanceFloor}
      tipoPersona={tipoPersona}
      setTipoPersona={setTipoPersona}
      openGlossary={openGlossary}
    />
  );
  if (floor === 3) return (
    <FloorThree
      unlockedFloor={unlockedFloor}
      advanceFloor={advanceFloor}
      nombreNegocioTrax={nombreNegocioTrax}
      setNombreNegocioTrax={setNombreNegocioTrax}
    />
  );
  if (floor === 4) return (
    <FloorFour
      unlockedFloor={unlockedFloor}
      advanceFloor={advanceFloor}
      openGlossary={openGlossary}
    />
  );

  if (floor === 5) {
    return (
      <Panel>
        <FloorEyebrow>Piso 05</FloorEyebrow>
        <FloorTitle>Tu Local Oficial</FloorTitle>
        <IconBubble icon={<Store className="w-6 h-6" />} tone="#3b82f6" />
        <p className="mt-4 font-['Geist'] text-[14px] text-white/55 leading-[1.55]">
          Para vender productos físicos en un local, necesitas el permiso municipal para evitar
          multas o clausuras sorpresivas.
        </p>

        <div className="mt-5 space-y-2.5">
          <BenefitRow
            icon={<ShieldCheck className="w-5 h-5" />}
            tone="#3b82f6"
            title="Paso A - Defensa Civil (ITSE)"
            body="Asegura que tu local no sea un peligro. Te pedirán cosas básicas como extintores, botiquín y pozo a tierra."
          />
          <BenefitRow
            icon={<CheckCircle2 className="w-5 h-5" />}
            tone="#22c55e"
            title="Paso B - Licencia de Funcionamiento"
            body="El permiso definitivo que te da la municipalidad de tu distrito para abrir tus puertas legalmente."
          />
        </div>

      </Panel>
    );
  }

  if (floor === 6) {
    return (
      <Panel>
        <FloorEyebrow>Piso 06</FloorEyebrow>
        <FloorTitle>Facturación Electrónica</FloorTitle>
        <IconBubble icon={<Receipt className="w-6 h-6" />} tone="#a78bfa" />
        <p className="mt-4 font-['Geist'] text-[14px] text-white/55 leading-[1.55]">
          ¡Es hora de vender en grande! Aquí es donde nuestra app Trax se conecta para ayudarte a
          emitir comprobantes en segundos.
        </p>

        <div className="mt-5 space-y-2.5">
          <BenefitRow
            icon={<Users className="w-5 h-5" />}
            tone="#3b82f6"
            title="Paso A - Boletas"
            body="Para venderle al público en general de manera rápida."
          />
          <BenefitRow
            icon={<Landmark className="w-5 h-5" />}
            tone="#a78bfa"
            title="Paso B - Facturas"
            body="La clave para crecer. Te permite venderle a empresas más grandes, ya que ellas necesitan facturas para sustentar sus gastos."
          />
        </div>

      </Panel>
    );
  }

  return (
    <Panel>
      <FloorEyebrow>Piso 07 · Top</FloorEyebrow>
      <FloorTitle>Crecer con Equipo</FloorTitle>
      <IconBubble icon={<Briefcase className="w-6 h-6" />} tone="#22c55e" />
      <p className="mt-4 font-['Geist'] text-[14px] text-white/55 leading-[1.55]">
        Tu negocio ya tiene éxito y necesitas ayuda o vender tus propios productos empacados. Hazlo
        de forma inteligente.
      </p>

      <div className="mt-5 space-y-2.5">
        <BenefitRow
          icon={<HeartPulse className="w-5 h-5" />}
          tone="#22c55e"
          title="Paso A - Permisos Especiales (Registro Sanitario)"
          body="Obligatorio (con DIGESA o DIGEMID) si fabricas alimentos, bebidas o cosméticos para asegurar que son seguros para el público."
        />
        <BenefitRow
          icon={<Users className="w-5 h-5" />}
          tone="#3b82f6"
          title="Paso B - Régimen Laboral MYPE (REMYPE)"
          body="El secreto legal para contratar ayudantes sin quebrar. Te permite pagar menos beneficios sociales (la mitad de CTS, gratificaciones y vacaciones) estando 100% en regla."
        />
      </div>

      {isLastUnlocked && (
        <div className="mt-6 rounded-2xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <Sparkles className="w-6 h-6 mx-auto text-[#22c55e] mb-2" strokeWidth={1.8} />
          <p className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white">
            ¡Edificio completado!
          </p>
          <p className="mt-1 font-['Geist'] text-[12.5px] text-white/55">
            Tu negocio está listo para crecer de forma formal y segura.
          </p>
        </div>
      )}
    </Panel>
  );
}

/* ============================================================
   Floor 1 · Derribando Mitos
   ============================================================ */
function FloorOne({
  unlockedFloor,
  advanceFloor,
  openGlossary,
}: {
  unlockedFloor: number;
  advanceFloor: (n?: number) => void;
  openGlossary: (k: TerminoKey) => void;
}) {
  return (
    <Panel>
      <FloorEyebrow>Piso 01 · Mitos</FloorEyebrow>
      <FloorTitle>Derribando mitos</FloorTitle>
      <p className="mt-2 font-['Geist'] text-[13px] text-white/55 leading-[1.55]">
        Antes de subir, entiende dos cosas clave que cambian todo.
      </p>

      <div className="mt-5 space-y-2.5">
        <BenefitRow
          icon={<ShieldCheck className="w-5 h-5" />}
          tone="#3b82f6"
          title="El Nuevo RUS no es un castigo"
          body={
            <>
              El <TermLink onClick={() => openGlossary('nrus')}>NRUS</TermLink> es un régimen
              simplificado: pagas una cuota fija desde <span className="text-white">S/20 al mes</span>{' '}
              según tus ingresos. Sin contabilidad complicada, sin sustos.
            </>
          }
        />
        <BenefitRow
          icon={<HeartPulse className="w-5 h-5" />}
          tone="#22c55e"
          title="SIS Emprendedor gratis"
          body="Solo por estar en NRUS, tú y tu familia acceden a atención médica gratuita en toda la red pública. Sin pagar aparte."
        />
      </div>

      <button
        onClick={() => {
          if (unlockedFloor === 1) advanceFloor(2);
          else advanceFloor(2);
        }}
        className="mt-6 w-full h-[50px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[14.5px] font-semibold text-white"
      >
        Entendido, subir al Piso 2
        <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </Panel>
  );
}

/* ============================================================
   Floor 2 · Mini-Test de Orientación
   ============================================================ */
function FloorTwo({
  unlockedFloor,
  advanceFloor,
  tipoPersona,
  setTipoPersona,
  openGlossary,
}: {
  unlockedFloor: number;
  advanceFloor: (n?: number) => void;
  tipoPersona: TipoPersona | null;
  setTipoPersona: (t: TipoPersona) => void;
  openGlossary: (k: TerminoKey) => void;
}) {
  const [testOpen, setTestOpen] = useState(false);
  const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null]);
  const preguntas = [
    '¿Vas a tener socios en tu negocio?',
    '¿Tu negocio requiere una inversión inicial alta en máquinas o mercadería?',
    '¿Quieres proteger tus ahorros, casa o bienes personales si el negocio tiene deudas?',
  ];
  const answered = answers.every((a) => a !== null);
  const yesCount = answers.filter((a) => a === true).length;
  const sugerencia: TipoPersona | null = answered ? (yesCount >= 2 ? 'juridica' : 'natural') : null;

  return (
    <Panel>
      <FloorEyebrow>Piso 02 · Ruta</FloorEyebrow>
      <FloorTitle>¿Cómo vas a trabajar?</FloorTitle>
      <p className="mt-2 font-['Geist'] text-[13px] text-white/55 leading-[1.55]">
        Un test corto te ayuda a elegir la ruta correcta.
      </p>

      {!testOpen && (
        <button
          onClick={() => setTestOpen(true)}
          className="mt-5 w-full h-[52px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[15px] font-semibold text-white"
        >
          Hacer Mini-Test de Orientación
          <Sparkles className="w-4 h-4" strokeWidth={2} />
        </button>
      )}

      {testOpen && (
        <div className="mt-5 space-y-3">
          {preguntas.map((q, i) => (
            <div
              key={i}
              className="rounded-[14px] p-3.5"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <p className="font-['Geist'] text-[13px] text-white/80 leading-[1.4]">
                {i + 1}. {q}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {[
                  { v: true, label: 'Sí' },
                  { v: false, label: 'No' },
                ].map((opt) => {
                  const active = answers[i] === opt.v;
                  return (
                    <button
                      key={opt.label}
                      onClick={() =>
                        setAnswers((prev) => prev.map((a, idx) => (idx === i ? opt.v : a)))
                      }
                      className="h-10 rounded-xl font-['Geist'] text-[13px] font-medium transition-all"
                      style={{
                        background: active ? '#3b82f6' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? '#3b82f6' : 'rgba(255,255,255,0.06)'}`,
                        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {answered && (
            <div
              className="rounded-[14px] p-3.5 animate-pulse"
              style={{
                background: 'rgba(34,197,94,0.10)',
                border: '1px solid rgba(34,197,94,0.35)',
              }}
            >
              <p className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-[#22c55e]">
                Sugerencia Trax
              </p>
              <p className="mt-1 font-['Geist'] text-[13.5px] text-white leading-[1.45]">
                {sugerencia === 'juridica'
                  ? 'Te conviene la Ruta Segura (Persona Jurídica - RUC 20)'
                  : 'Te conviene la Ruta Rápida (Persona Natural - RUC 10)'}
              </p>
            </div>
          )}

          {answered && (
            <div className="pt-1 space-y-2.5">
              <RouteChoice
                active={tipoPersona === 'natural'}
                accent="#3b82f6"
                title="Ruta Rápida"
                tag="RUC 10 · Persona Natural"
                body="Usas tu propio DNI. Más barato e instantáneo, pero respondes con tus bienes personales."
                onClick={() => setTipoPersona('natural')}
                onGlossary={() => openGlossary('ruc10')}
              />
              <RouteChoice
                active={tipoPersona === 'juridica'}
                accent="#a78bfa"
                title="Ruta Segura"
                tag="RUC 20 · Persona Jurídica"
                body="Creas una empresa. Protege tu casa y ahorros porque el negocio responde por sí mismo."
                onClick={() => setTipoPersona('juridica')}
                onGlossary={() => openGlossary('ruc20')}
              />
            </div>
          )}

          {tipoPersona !== null && (
            <button
              onClick={() => {
                if (unlockedFloor === 2) advanceFloor(3);
                else advanceFloor(3);
              }}
              className="mt-2 w-full h-[50px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[14.5px] font-semibold text-white"
            >
              Confirmar Ruta y Subir
              <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ============================================================
   Floor 3 · Nombre en SUNARP
   ============================================================ */
function FloorThree({
  unlockedFloor,
  advanceFloor,
  nombreNegocioTrax,
  setNombreNegocioTrax,
}: {
  unlockedFloor: number;
  advanceFloor: (n?: number) => void;
  nombreNegocioTrax: string;
  setNombreNegocioTrax: (v: string) => void;
}) {
  const [sunarpAbierto, setSunarpAbierto] = useState(false);
  const [sesionOk, setSesionOk] = useState(false);
  const [verificadoOk, setVerificadoOk] = useState(false);
  const [nombre, setNombre] = useState(nombreNegocioTrax ?? '');

  const puedeAvanzar = sunarpAbierto && sesionOk && verificadoOk && nombre.trim().length > 0;

  return (
    <Panel>
      <FloorEyebrow>Piso 03 · SUNARP</FloorEyebrow>
      <FloorTitle>Reserva tu nombre en SUNARP</FloorTitle>
      <p className="mt-2 font-['Geist'] text-[13px] text-white/55 leading-[1.55]">
        Sigue los 4 pasos en orden. Cada uno habilita al siguiente.
      </p>

      <div className="mt-5 space-y-3">
        {/* Sub-paso 1 */}
        <SubStepBlock n={1} title="Registrar cuenta en SUNARP" done={sunarpAbierto}>
          <a
            href="https://sidciudadano.sunarp.gob.pe/sid/ciudadano.htm?method=registro"
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setSunarpAbierto(true)}
            className="mt-2 inline-flex w-full h-11 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all items-center justify-center gap-2 font-['Geist'] text-[13.5px] font-semibold text-white"
          >
            1. Registrar Cuenta en SUNARP
            <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
          </a>
        </SubStepBlock>

        {/* Sub-paso 2 */}
        <SubStepBlock
          n={2}
          title="Inicié sesión en SID-SUNARP"
          done={sesionOk}
          disabled={!sunarpAbierto}
        >
          <CheckboxRow
            checked={sesionOk}
            disabled={!sunarpAbierto}
            onChange={setSesionOk}
            label="Ya inicié sesión con mi cuenta en el SID-SUNARP."
          />
        </SubStepBlock>

        {/* Sub-paso 3 */}
        <SubStepBlock
          n={3}
          title="Verifiqué que el nombre está libre"
          done={verificadoOk}
          disabled={!sesionOk}
        >
          <CheckboxRow
            checked={verificadoOk}
            disabled={!sesionOk}
            onChange={setVerificadoOk}
            label="Ya verifiqué en su buscador que mi nombre está libre."
          />
        </SubStepBlock>

        {/* Sub-paso 4 */}
        <SubStepBlock
          n={4}
          title="Nombre definitivo del negocio"
          done={nombre.trim().length > 0}
          disabled={!verificadoOk}
        >
          <input
            type="text"
            value={nombre}
            disabled={!verificadoOk}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Escribe aquí el nombre definitivo…"
            className="mt-2 w-full h-11 rounded-xl px-3 font-['Geist'] text-[14px] text-white placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-[#3b82f6]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </SubStepBlock>
      </div>

      <button
        onClick={() => {
          setNombreNegocioTrax(nombre.trim());
          if (unlockedFloor === 3) advanceFloor(4);
          else advanceFloor(4);
        }}
        disabled={!puedeAvanzar}
        className="mt-6 w-full h-[50px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[14.5px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3b82f6]"
      >
        Guardar Nombre y Subir al P4
        <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </Panel>
  );
}

function SubStepBlock({
  n,
  title,
  done,
  disabled,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] p-3.5 transition-opacity"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${done ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.05)'}`,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-['Bai_Jamjuree'] text-[12px] font-semibold"
          style={{
            background: done ? '#3b82f6' : 'rgba(255,255,255,0.06)',
            color: done ? '#fff' : 'rgba(255,255,255,0.6)',
          }}
        >
          {done ? <CheckCircle2 className="w-4 h-4" /> : n}
        </div>
        <p className="font-['Geist'] text-[13px] font-medium text-white/85">{title}</p>
      </div>
      {children}
    </div>
  );
}

function CheckboxRow({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={`mt-2 flex items-start gap-2.5 rounded-xl p-2.5 transition-colors ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.03]'
      }`}
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#3b82f6] cursor-pointer disabled:cursor-not-allowed"
      />
      <span className="font-['Geist'] text-[12.5px] text-white/70 leading-[1.5]">{label}</span>
    </label>
  );
}

/* ============================================================
   Floor 4 · Simulador RUC (SUNAT)
   ============================================================ */
function FloorFour({
  unlockedFloor,
  advanceFloor,
  openGlossary,
}: {
  unlockedFloor: number;
  advanceFloor: (n?: number) => void;
  openGlossary: (k: TerminoKey) => void;
}) {
  const [dni, setDni] = useState('');
  const [motivo, setMotivo] = useState('Iniciar negocio');
  const [direccion, setDireccion] = useState('');
  const [clave, setClave] = useState('');
  const [focused, setFocused] = useState<null | 'dni' | 'motivo' | 'direccion' | 'clave'>(null);
  const [terminado, setTerminado] = useState(false);

  const tips: Record<'dni' | 'motivo' | 'direccion' | 'clave', string> = {
    dni: 'Trax Tip: Escribe los 8 dígitos de tu DNI. SUNAT lo cruza con RENIEC en segundos.',
    motivo: 'Trax Tip: Deja "Iniciar negocio" para que SUNAT genere tu RUC como emprendedor.',
    direccion: 'Trax Tip: Aquí pon la dirección exacta de tu local o almacén físico.',
    clave: 'Trax Tip: Crea una contraseña que combine letras y números.',
  };

  const lleno =
    dni.trim().length > 0 &&
    motivo.trim().length > 0 &&
    direccion.trim().length > 0 &&
    clave.trim().length > 0;

  return (
    <Panel>
      <FloorEyebrow>Piso 04 · SUNAT</FloorEyebrow>
      <FloorTitle>Simulador: Inscripción del RUC</FloorTitle>
      <p className="mt-2 font-['Geist'] text-[13px] text-white/55 leading-[1.55]">
        Practica aquí primero. Cuando termines, te llevamos al portal real.
      </p>

      <div className="mt-5 space-y-3">
        <SimField
          label="Número de DNI"
          icon={<Fingerprint className="w-4 h-4" />}
          value={dni}
          onChange={(v) => setDni(v.replace(/\D/g, '').slice(0, 8))}
          onFocus={() => setFocused('dni')}
          onBlur={() => setFocused((f) => (f === 'dni' ? null : f))}
          placeholder="12345678"
          inputMode="numeric"
          tip={focused === 'dni' ? tips.dni : null}
        />
        <SimField
          label="Motivo del trámite"
          icon={<Briefcase className="w-4 h-4" />}
          value={motivo}
          onChange={setMotivo}
          onFocus={() => setFocused('motivo')}
          onBlur={() => setFocused((f) => (f === 'motivo' ? null : f))}
          placeholder="Iniciar negocio"
          tip={focused === 'motivo' ? tips.motivo : null}
        />
        <SimField
          label="Domicilio Fiscal"
          icon={<MapPin className="w-4 h-4" />}
          value={direccion}
          onChange={setDireccion}
          onFocus={() => setFocused('direccion')}
          onBlur={() => setFocused((f) => (f === 'direccion' ? null : f))}
          placeholder="Av. Los Olivos 123, Lima"
          tip={focused === 'direccion' ? tips.direccion : null}
          hintNode={
            <>
              ¿Dudas? Revisa qué es un{' '}
              <TermLink onClick={() => openGlossary('domicilio')}>Domicilio Fiscal</TermLink>.
            </>
          }
        />
        <SimField
          label="Clave SOL"
          icon={<KeyRound className="w-4 h-4" />}
          value={clave}
          onChange={setClave}
          onFocus={() => setFocused('clave')}
          onBlur={() => setFocused((f) => (f === 'clave' ? null : f))}
          placeholder="Ej: Trax2026#"
          type="password"
          tip={focused === 'clave' ? tips.clave : null}
          hintNode={
            <>
              La <TermLink onClick={() => openGlossary('clavesol')}>Clave SOL</TermLink> es tu llave
              a SUNAT.
            </>
          }
        />
      </div>

      {lleno && !terminado && (
        <button
          onClick={() => {
            setTerminado(true);
            if (unlockedFloor === 4) advanceFloor(5);
            else advanceFloor(5);
          }}
          className="mt-6 w-full h-[50px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[14.5px] font-semibold text-white"
        >
          Finalizar Práctica de RUC
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
        </button>
      )}

      {terminado && (
        <a
          href="https://www.sunat.gob.pe/"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 w-full h-[50px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[14.5px] font-semibold text-white"
        >
          Ir a la Web Oficial de la SUNAT
          <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
        </a>
      )}
    </Panel>
  );
}

function SimField({
  label,
  icon,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  tip,
  hintNode,
  inputMode,
  type,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder?: string;
  tip: string | null;
  hintNode?: React.ReactNode;
  inputMode?: 'numeric' | 'text';
  type?: string;
}) {
  return (
    <div
      className="rounded-[14px] p-3.5"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#3b82f6]">{icon}</span>
        <label className="font-['Geist'] text-[12px] uppercase tracking-[1.2px] text-white/60">
          {label}
        </label>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        type={type}
        className="w-full h-11 rounded-xl px-3 font-['Geist'] text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#3b82f6]"
        style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      {tip && (
        <div
          className="mt-2 rounded-xl px-3 py-2 font-['Geist'] text-[12px] leading-[1.45] text-white/85 relative"
          style={{
            background: 'rgba(59,130,246,0.14)',
            border: '1px solid rgba(59,130,246,0.35)',
          }}
        >
          <span className="absolute -top-1.5 left-4 w-2.5 h-2.5 rotate-45"
            style={{ background: 'rgba(59,130,246,0.35)' }} />
          {tip}
        </div>
      )}
      {hintNode && !tip && (
        <p className="mt-2 font-['Geist'] text-[11.5px] text-white/40 leading-[1.4]">{hintNode}</p>
      )}
    </div>
  );
}


/* ============================================================
   Building UI primitives
   ============================================================ */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-[20px] p-5 min-h-[440px]"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </div>
  );
}

function FloorEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-['Geist'] text-[10.5px] uppercase tracking-[1.6px] text-white/40">
      {children}
    </p>
  );
}

function FloorTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-1 font-['Bai_Jamjuree'] text-[22px] font-semibold tracking-[-0.3px] text-white leading-[1.15]">
      {children}
    </h2>
  );
}

function CompleteFloorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 w-full h-[50px] rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-['Geist'] text-[14.5px] font-semibold text-white"
    >
      Completar Piso y Subir
      <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
    </button>
  );
}

function BenefitRow({
  icon,
  tone,
  title,
  body,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] p-3.5 flex gap-3"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center"
        style={{ background: `${tone}1a`, color: tone, border: `1px solid ${tone}33` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-['Geist'] text-[13.5px] font-medium text-white leading-[1.3]">
          {title}
        </p>
        <p className="mt-1 font-['Geist'] text-[12.5px] text-white/50 leading-[1.5]">{body}</p>
      </div>
    </div>
  );
}

function RouteChoice({
  active,
  accent,
  title,
  tag,
  body,
  onClick,
  onGlossary,
}: {
  active: boolean;
  accent: string;
  title: string;
  tag: string;
  body: string;
  onClick: () => void;
  onGlossary: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[14px] p-4 transition-all"
      style={{
        background: active ? `${accent}12` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${active ? `${accent}66` : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p
            className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px]"
            style={{ color: accent }}
          >
            {tag}
          </p>
          <h3 className="mt-1 font-['Bai_Jamjuree'] text-[16px] font-semibold text-white">
            {title}
          </h3>
        </div>
        {active && <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: accent }} />}
      </div>
      <p className="mt-2 font-['Geist'] text-[12.5px] text-white/55 leading-[1.5]">{body}</p>
      <span
        onClick={(e) => {
          e.stopPropagation();
          onGlossary();
        }}
        className="mt-2 inline-flex items-center gap-1 font-['Geist'] text-[11.5px] text-white/45 hover:text-white/70 transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3 h-3" />
        ¿Qué significa?
      </span>
    </button>
  );
}

function StepLine({ icon, text }: { icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[#3b82f6]"
        style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)' }}
      >
        {icon}
      </div>
      <p className="pt-1.5 font-['Geist'] text-[13.5px] text-white/70 leading-[1.5]">{text}</p>
    </li>
  );
}

function SunatStep({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] p-3.5 flex gap-3"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-['Bai_Jamjuree'] text-[13px] font-semibold text-white"
          style={{ background: '#3b82f6' }}
        >
          {n}
        </div>
        <div className="text-white/40">{icon}</div>
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="font-['Geist'] text-[13.5px] font-medium text-white leading-[1.3]">
          {title}
        </p>
        <p className="mt-1 font-['Geist'] text-[12.5px] text-white/50 leading-[1.5]">{body}</p>
      </div>
    </div>
  );
}

function IconBubble({ icon, tone }: { icon: React.ReactNode; tone: string }) {
  return (
    <div
      className="mt-5 w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{
        background: `${tone}18`,
        border: `1px solid ${tone}40`,
        color: tone,
      }}
    >
      {icon}
    </div>
  );
}

function TermLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <span
      onClick={onClick}
      className="underline decoration-dashed decoration-[#3b82f6]/60 underline-offset-2 cursor-pointer text-[#93c5fd] hover:text-white transition-colors"
    >
      {children}
      <HelpCircle className="inline w-3 h-3 ml-0.5 -mt-0.5" />
    </span>
  );
}

/* ============================================================
   Glossary sheet (dark)
   ============================================================ */
function GlossarySheet({ term, onClose }: { term: Termino; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center max-w-[430px] mx-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full rounded-t-[24px] p-6 animate-in slide-in-from-bottom-4"
        style={{
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/[0.06] transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(59,130,246,0.14)',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <HelpCircle className="w-5 h-5 text-[#3b82f6]" strokeWidth={1.8} />
          </div>
          <h3 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white">
            {term.titulo}
          </h3>
        </div>
        <p className="font-['Geist'] text-[14px] leading-[1.6] text-white/65">{term.texto}</p>
        <button
          onClick={onClose}
          className="w-full mt-6 h-[48px] rounded-2xl font-['Geist'] text-[14px] font-semibold text-white"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

export default Formalizacion;
