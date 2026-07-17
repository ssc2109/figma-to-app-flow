import { useState } from 'react';
import {
  Building2, ShieldCheck, HeartPulse, Rocket,
  Building, FileText, CheckCircle2,
  X, HelpCircle, ArrowUpRight, Scale, Briefcase,
} from 'lucide-react';

type TipoPersona = 'natural' | 'juridica' | null;
type TerminoKey = 'minuta' | 'domicilio' | 'clavesol';
type Termino = { titulo: string; texto: string };

const Formalizacion = () => {
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>(null);
  const [glosario, setGlosario] = useState<Termino | null>(null);

  const terminosGlosario: Record<TerminoKey, Termino> = {
    minuta: {
      titulo: 'La Minuta',
      texto:
        'Es como la partida de nacimiento de tu empresa. Es un documento donde dice quiénes son los dueños, qué van a vender y cuánto dinero o máquinas están aportando para empezar.',
    },
    domicilio: {
      titulo: 'Domicilio Fiscal',
      texto:
        'Es la dirección oficial de tu negocio. Es el lugar donde la SUNAT irá a buscarte si necesita entregarte un documento importante. Puede ser tu casa o el local que alquilas.',
    },
    clavesol: {
      titulo: 'Clave SOL',
      texto:
        'Es como el PIN de tu tarjeta del banco, pero para la SUNAT. Con esta contraseña secreta podrás entrar a su sistema por internet para emitir boletas o pagar tus impuestos.',
    },
  };

  const abrirGlosario = (termino: TerminoKey) => setGlosario(terminosGlosario[termino]);
  const cerrarGlosario = () => setGlosario(null);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative pb-20">
      {/* Header Principal */}
      <header className="bg-blue-900 text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-7 h-7 text-blue-300" />
          Ruta de Crecimiento
        </h1>
        <p className="text-blue-100 mt-2 text-sm leading-relaxed">
          Construye tu negocio paso a paso. Formalizarte es ganar beneficios, no problemas.
        </p>
      </header>

      <main className="p-4 space-y-6">
        {/* PISO 1: Beneficios */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            El Despegue (Tus Beneficios)
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900 text-sm">Chau miedos a la SUNAT</h3>
                <p className="text-xs text-emerald-700 mt-1">Con el Nuevo RUS (NRUS) pagas una cuota súper pequeña al mes (S/20). Nadie tocará tus ganancias.</p>
              </div>
            </div>
            <div className="flex gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <HeartPulse className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">SIS Emprendedor</h3>
                <p className="text-xs text-blue-700 mt-1">Por estar en el RUS, el Estado te da un seguro de salud completo para ti y tu familia.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PISO 2: Decisión (Ruta) */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            ¿Cómo vas a trabajar?
          </h2>
          <div className="grid gap-3">
            <button
              onClick={() => setTipoPersona('natural')}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                tipoPersona === 'natural' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-500" /> Ruta Rápida (RUC 10)
                </h3>
                {tipoPersona === 'natural' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-xs text-slate-600 mt-2">Usas tu propio DNI. Es más barato y al instante, pero respondes con tus bienes personales si algo sale mal.</p>
            </button>

            <button
              onClick={() => setTipoPersona('juridica')}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                tipoPersona === 'juridica' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" /> Ruta Segura (RUC 20)
                </h3>
                {tipoPersona === 'juridica' && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
              </div>
              <p className="text-xs text-slate-600 mt-2">Creas una "Empresa". Protege tu casa y tus ahorros porque el negocio responde por sí mismo.</p>
            </button>
          </div>
        </section>

        {/* PISO 3: Creación (SOLO si es Persona Jurídica) */}
        {tipoPersona === 'juridica' && (
          <section className="bg-indigo-900 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-indigo-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Creando tu Empresa
            </h2>
            <p className="text-indigo-200 text-xs mb-4">Como elegiste la Ruta Segura, necesitas registrar a tu empresa oficialmente en la SUNARP antes de ir a SUNAT.</p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-indigo-300 mt-0.5" />
                <span>
                  Redactar la{' '}
                  <span
                    onClick={() => abrirGlosario('minuta')}
                    className="underline decoration-dashed decoration-indigo-400 font-bold cursor-pointer text-indigo-200 hover:text-white"
                  >
                    Minuta <HelpCircle className="inline w-3 h-3" />
                  </span>{' '}
                  del negocio.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-indigo-300 mt-0.5" />
                <span>Llevarla a una Notaría para la firma oficial.</span>
              </li>
              <li className="flex items-start gap-3">
                <Building className="w-5 h-5 text-indigo-300 mt-0.5" />
                <span>La notaría la inscribe en la SUNARP automáticamente.</span>
              </li>
            </ul>
          </section>
        )}

        {/* PISO 4: SUNAT */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">
              {tipoPersona === 'juridica' ? '4' : '3'}
            </span>
            Inscripción del RUC
          </h2>
          <p className="text-xs text-slate-500 mb-4">Descarga la "App Personas" de SUNAT o entra a su web y sigue estos 4 pasos rápidos:</p>
          <div className="space-y-4 pl-2 border-l-2 border-blue-100 ml-2">
            <div className="relative pl-4">
              <div className="absolute -left-3 top-1 bg-white border-2 border-blue-400 w-4 h-4 rounded-full"></div>
              <p className="text-sm font-semibold text-slate-700">1. Identificación y Motivo</p>
              <p className="text-xs text-slate-500">Ingresa tu DNI e indica que vas a "Iniciar un negocio".</p>
            </div>
            <div className="relative pl-4">
              <div className="absolute -left-3 top-1 bg-white border-2 border-blue-400 w-4 h-4 rounded-full"></div>
              <p className="text-sm font-semibold text-slate-700">2. Verificación de Identidad</p>
              <p className="text-xs text-slate-500">La app te pedirá escanear tu huella dactilar con la cámara.</p>
            </div>
            <div className="relative pl-4">
              <div className="absolute -left-3 top-1 bg-white border-2 border-blue-400 w-4 h-4 rounded-full"></div>
              <p className="text-sm font-semibold text-slate-700">3. Datos del Negocio</p>
              <p className="text-xs text-slate-500">
                Ingresa tu{' '}
                <span
                  onClick={() => abrirGlosario('domicilio')}
                  className="underline decoration-dashed decoration-blue-500 font-bold cursor-pointer text-blue-700"
                >
                  Domicilio Fiscal <HelpCircle className="inline w-3 h-3" />
                </span>{' '}
                y a qué te dedicas.
              </p>
            </div>
            <div className="relative pl-4">
              <div className="absolute -left-3 top-1 bg-white border-2 border-blue-400 w-4 h-4 rounded-full"></div>
              <p className="text-sm font-semibold text-slate-700">4. Contacto y Clave</p>
              <p className="text-xs text-slate-500">
                Pon tu celular, correo y crea tu{' '}
                <span
                  onClick={() => abrirGlosario('clavesol')}
                  className="underline decoration-dashed decoration-blue-500 font-bold cursor-pointer text-blue-700"
                >
                  Clave SOL <HelpCircle className="inline w-3 h-3" />
                </span>
                .
              </p>
            </div>
          </div>
          <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
            Ir a la web de SUNAT <ArrowUpRight className="w-5 h-5" />
          </button>
        </section>

        {/* Pisos Adicionales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <Building className="w-5 h-5 text-slate-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-600">Licencia y Local</h3>
          </div>
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <Briefcase className="w-5 h-5 text-slate-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-600">Crecer con Equipo</h3>
          </div>
        </div>
      </main>

      {/* BOTTOM SHEET (GLOSARIO INTERACTIVO) */}
      {glosario && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center max-w-md mx-auto">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={cerrarGlosario}
          ></div>
          <div className="bg-white w-full sm:w-[95%] rounded-t-3xl sm:rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-10 shadow-2xl">
            <button
              onClick={cerrarGlosario}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-7 h-7 text-blue-500" />
              <h3 className="text-xl font-bold text-slate-800">{glosario.titulo}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">{glosario.texto}</p>
            <button
              onClick={cerrarGlosario}
              className="w-full mt-6 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formalizacion;
