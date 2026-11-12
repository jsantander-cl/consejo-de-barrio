import { useState, useEffect, useMemo, useRef } from "react";
import {
  Mic,
  Calendar as CalendarIcon,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Save,
  X,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { Card, StatusBadge } from "../components/ui.jsx";
import { supabase } from "../lib/supabaseClient.js";

// --- UTILIDADES DE FECHA ---
function getProximoDomingo() {
  const hoy = new Date();
  const diasHastaDomingo = (7 - hoy.getDay()) % 7;
  hoy.setDate(hoy.getDate() + diasHastaDomingo);
  
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function Discursantes() {
  const [domingoSeleccionado, setDomingoSeleccionado] = useState(() =>
    getProximoDomingo(),
  );

  const [todosDiscursantes, setTodosDiscursantes] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pestañaModal, setPestañaModal] = useState("candidatos");
  const [nuevoCandidato, setNuevoCandidato] = useState("");

  // Calendario Custom
  const [modalCalendario, setModalCalendario] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  // Slots del formulario
  const [slot1, setSlot1] = useState({
    nombre: "",
    tema: "",
    organizacion: "Juventud / Converso",
    confirmado: false,
  });
  const [slot2, setSlot2] = useState({
    nombre: "",
    tema: "",
    organizacion: "Quórum / SocSoc",
    confirmado: false,
  });
  const [slot3, setSlot3] = useState({
    nombre: "",
    tema: "",
    organizacion: "Discurso Principal",
    confirmado: false,
  });

  const cargarDatos = async () => {
    setCargando(true);
    const [resDiscursantes, resCandidatos] = await Promise.all([
      supabase
        .from("discursantes")
        .select("*")
        .order("fecha", { ascending: false }),
      supabase
        .from("candidatos_discursantes")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (!resDiscursantes.error)
      setTodosDiscursantes(resDiscursantes.data || []);
    if (!resCandidatos.error) setCandidatos(resCandidatos.data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const historialNombres = useMemo(() => {
    const mapa = new Map();
    todosDiscursantes.forEach((d) => {
      const nombreNorm = d.nombre.trim().toLowerCase();
      if (!mapa.has(nombreNorm)) mapa.set(nombreNorm, []);
      mapa.get(nombreNorm).push({ fecha: d.fecha, tema: d.tema });
    });
    return mapa;
  }, [todosDiscursantes]);

  useEffect(() => {
    const delDomingo = todosDiscursantes.filter(
      (d) => d.fecha === domingoSeleccionado,
    );
    const d1 = delDomingo.find((d) => d.orden === 1);
    const d2 = delDomingo.find((d) => d.orden === 2);
    const d3 = delDomingo.find((d) => d.orden === 3);

    setSlot1({
      nombre: d1?.nombre || "",
      tema: d1?.tema || "",
      organizacion: d1?.organizacion || "Juventud / Converso",
      confirmado: d1?.confirmado || false,
    });
    setSlot2({
      nombre: d2?.nombre || "",
      tema: d2?.tema || "",
      organizacion: d2?.organizacion || "Quórum / SocSoc",
      confirmado: d2?.confirmado || false,
    });
    setSlot3({
      nombre: d3?.nombre || "",
      tema: d3?.tema || "",
      organizacion: d3?.organizacion || "Discurso Principal",
      confirmado: d3?.confirmado || false,
    });
  }, [domingoSeleccionado, todosDiscursantes]);

// Genera 6 domingos visibles adaptados
const domingosVisibles = useMemo(() => {
  const domingos = [];
  const [anioStr, mesStr, diaStr] = domingoSeleccionado.split('-');
  let fechaBase = new Date(Number(anioStr), Number(mesStr) - 1, Number(diaStr));
  fechaBase.setDate(fechaBase.getDate() - 7);

  for (let i = 0; i < 6; i++) {
    const y = fechaBase.getFullYear();
    const m = String(fechaBase.getMonth() + 1).padStart(2, '0');
    const d = String(fechaBase.getDate()).padStart(2, '0');
    domingos.push(`${y}-${m}-${d}`);
    
    fechaBase.setDate(fechaBase.getDate() + 7);
  }
  return domingos;
}, [domingoSeleccionado]);

  const verificarRepeticion = (nombreInput) => {
    if (!nombreInput || nombreInput.trim().length < 3) return null;
    const registro = historialNombres.get(nombreInput.trim().toLowerCase());
    if (registro) {
      const previos = registro.filter((r) => r.fecha !== domingoSeleccionado);
      if (previos.length > 0) return previos[0];
    }
    return null;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito(false);

    const slots = [
      { orden: 1, ...slot1 },
      { orden: 2, ...slot2 },
      { orden: 3, ...slot3 },
    ];
    const registrosAGuardar = slots
      .filter((s) => s.nombre.trim() !== "")
      .map((s) => ({ fecha: domingoSeleccionado, ...s }));

    await supabase
      .from("discursantes")
      .delete()
      .eq("fecha", domingoSeleccionado);

    if (registrosAGuardar.length > 0) {
      await supabase.from("discursantes").insert(registrosAGuardar);
    }

    await cargarDatos();
    setGuardando(false);
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 3000);
  };

  const handleAgregarCandidato = async (e) => {
    e.preventDefault();
    if (!nuevoCandidato.trim()) return;
    await supabase
      .from("candidatos_discursantes")
      .insert([{ nombre: nuevoCandidato.trim() }]);
    setNuevoCandidato("");
    cargarDatos();
  };

  const handleEliminarCandidato = async (id) => {
    await supabase.from("candidatos_discursantes").delete().eq("id", id);
    cargarDatos();
  };

  const usarCandidato = (nombre) => {
    if (!slot1.nombre) setSlot1({ ...slot1, nombre });
    else if (!slot2.nombre) setSlot2({ ...slot2, nombre });
    else if (!slot3.nombre) setSlot3({ ...slot3, nombre });
    setModalAbierto(false);
  };

  const abrirCalendario = () => {
    const actual = new Date(`${domingoSeleccionado}T12:00:00`);
    setCalMonth(actual.getMonth());
    setCalYear(actual.getFullYear());
    setModalCalendario(true);
  };

  const obtenerDomingosDelMes = (year, month) => {
    const domingos = [];
    const fecha = new Date(year, month, 1);

    while (fecha.getDay() !== 0) {
      fecha.setDate(fecha.getDate() + 1);
    }

    while (fecha.getMonth() === month) {
      domingos.push(new Date(fecha));
      fecha.setDate(fecha.getDate() + 7);
    }
    return domingos;
  };

  const seleccionarDomingoCalendario = (fechaObj) => {
    setDomingoSeleccionado(fechaObj.toISOString().slice(0, 10));
    setModalCalendario(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5 uppercase tracking-wider">
            <Mic size={14} /> Asignación de Discursos de Sacramental
          </span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mt-0.5">
            Planificación de Discursantes
          </h1>
        </div>
        {mensajeExito && (
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-sm font-medium animate-pulse">
            <CheckCircle2 size={18} /> Asignaciones guardadas
          </div>
        )}
      </div>

      {/* TIRA DE FECHAS */}
      <div className="bg-surface-container-low p-3 md:p-4 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Seleccionar Reunion Sacramental:
          </label>
          <button
            type="button"
            onClick={abrirCalendario}
            className="flex items-center gap-1.5 bg-primary-container text-on-tertiary px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-container/80 transition-colors"
          >
            <CalendarIcon size={14} /> Mostrar
          </button>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {domingosVisibles.map((fecha, idx) => {
            const esSeleccionado = fecha === domingoSeleccionado;
            const tieneDiscursantes = todosDiscursantes.some(
              (d) => d.fecha === fecha,
            );
            const fechaObj = new Date(`${fecha}T12:00:00`);
            const diaNum = fechaObj.getDate();
            const mesNombre = fechaObj
              .toLocaleDateString("es-ES", { month: "short" })
              .toUpperCase();

            const visibilidadResponsive = idx >= 4 ? "hidden lg:flex" : "flex";

            return (
              <button
                key={fecha}
                type="button"
                onClick={() => setDomingoSeleccionado(fecha)}
                className={`${visibilidadResponsive} flex-col items-center justify-center p-3 rounded-xl border transition-all aspect-[4/3] relative ${
                  esSeleccionado
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container"
                }`}
              >
                <span
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${esSeleccionado ? "opacity-90" : "text-primary"}`}
                >
                  {mesNombre}
                </span>
                <span className="text-xl md:text-2xl leading-none font-extrabold mt-1">
                  {diaNum}
                </span>
                {tieneDiscursantes && !esSeleccionado && (
                  <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario Principal de Asignación */}
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleGuardar} className="space-y-4">
            <Card
              title={`Asignaciones del ${new Date(`${domingoSeleccionado}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`}
              subtitle="Asigna hasta 3 discursantes para la reunión sacramental"
            >
              <div className="space-y-5">
                <RenderInputDiscursante
                  num={1}
                  label="1er Discursante (Joven / Nuevo Converso)"
                  data={slot1}
                  setData={setSlot1}
                  repeticion={verificarRepeticion(slot1.nombre)}
                />
                <RenderInputDiscursante
                  num={2}
                  label="2do Discursante (Sacerdocio / Auxiliares)"
                  data={slot2}
                  setData={setSlot2}
                  repeticion={verificarRepeticion(slot2.nombre)}
                />
                <RenderInputDiscursante
                  num={3}
                  label="3er Discursante (Discurso Principal / Retorno)"
                  data={slot3}
                  setData={setSlot3}
                  repeticion={verificarRepeticion(slot3.nombre)}
                />

                <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    <Save size={18} />{" "}
                    {guardando ? "Guardando..." : "Guardar Asignaciones"}
                  </button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Historial Lateral con Botón + */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-bold text-primary">
                  Historial Reciente
                </span>
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="p-1.5 bg-primary-container text-white hover:bg-primary hover:text-white rounded-lg transition-colors"
                  title="Gestionar candidatos e historial"
                >
                  <Plus size={18} />
                </button>
              </div>
            }
            subtitle="Miembros que han discursado anteriormente"
          >
            {cargando && (
              <p className="text-xs text-on-surface-variant">
                Cargando registro...
              </p>
            )}
            {!cargando && todosDiscursantes.length === 0 && (
              <p className="text-xs text-on-surface-variant italic">
                No hay discursos registrados.
              </p>
            )}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 hide-scrollbar">
              {todosDiscursantes.slice(0, 10).map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {d.nombre}
                    </span>
                    <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full font-semibold text-on-surface-variant">
                      {d.fecha ? d.fecha.split("-").reverse().join("-") : ""}
                    </span>
                  </div>
                  {d.tema && (
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      <strong className="font-medium">Tema:</strong> "{d.tema}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL: CALENDARIO */}
      {modalCalendario && (
        <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl transition-all">
          <div className="bg-surface rounded-3xl shadow-xl w-full max-w-[320px] overflow-hidden border border-outline-variant/20">
            <div className="flex items-center justify-between p-5 bg-surface-container-lowest border-b border-outline-variant/30">
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear((y) => y - 1);
                  } else {
                    setCalMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="font-bold text-primary capitalize text-[15px]">
                {MESES[calMonth]} {calYear}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear((y) => y + 1);
                  } else {
                    setCalMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="p-5 bg-surface-container-lowest space-y-2">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center mb-3">
                Domingos del Mes
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {obtenerDomingosDelMes(calYear, calMonth).map((domingoObj) => {
                  const fechaStr = domingoObj.toISOString().slice(0, 10);
                  const esSeleccionado = fechaStr === domingoSeleccionado;
                  const formatoTexto = domingoObj.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <button
                      key={fechaStr}
                      type="button"
                      onClick={() => seleccionarDomingoCalendario(domingoObj)}
                      className={`w-full py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${
                        esSeleccionado
                          ? "bg-primary text-white shadow-md"
                          : "bg-surface-container-low text-primary hover:bg-surface-container"
                      }`}
                    >
                      <span>{formatoTexto}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${esSeleccionado ? "bg-white" : "bg-secondary"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/30 flex justify-end">
              <button
                type="button"
                onClick={() => setModalCalendario(false)}
                className="text-xs font-bold text-primary hover:text-primary-container px-3 py-1.5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GESTIÓN DE CANDIDATOS E HISTORIAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-outline-variant/20">
            <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
              <h2 className="text-xl font-bold text-primary tracking-tight">
                Gestión de Discursantes
              </h2>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest px-2 md:px-4">
              <button
                type="button"
                onClick={() => setPestañaModal("candidatos")}
                className={`px-4 py-3 text-sm font-bold border-b-[3px] transition-colors ${pestañaModal === "candidatos" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
              >
                Candidatos Sugeridos
              </button>
              <button
                type="button"
                onClick={() => setPestañaModal("historial")}
                className={`px-4 py-3 text-sm font-bold border-b-[3px] transition-colors ${pestañaModal === "historial" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
              >
                Historial General
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-surface-container-low/30">
              {pestañaModal === "candidatos" && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAgregarCandidato}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Nombre del posible candidato..."
                      value={nuevoCandidato}
                      onChange={(e) => setNuevoCandidato(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={!nuevoCandidato.trim()}
                      className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary-container disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <UserPlus size={16} /> Agregar
                    </button>
                  </form>
                  <div className="space-y-2">
                    {candidatos.length === 0 ? (
                      <p className="text-sm text-on-surface-variant text-center py-8 italic border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest/50">
                        No hay candidatos registrados en la lista de espera.
                      </p>
                    ) : (
                      candidatos.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm"
                        >
                          <span className="font-semibold text-primary text-sm">
                            {c.nombre}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => usarCandidato(c.nombre)}
                              className="text-xs bg-secondary/10 text-secondary-container-on px-4 py-2 rounded-lg font-bold hover:bg-secondary/20 transition-colors"
                            >
                              Asignar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarCandidato(c.id)}
                              className="p-2 text-outline hover:text-error hover:bg-error-container/50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {pestañaModal === "historial" && (
                <div className="space-y-3">
                  {Array.from(historialNombres.entries()).map(
                    ([nombreNorm, registros]) => (
                      <div
                        key={nombreNorm}
                        className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary capitalize">
                            {nombreNorm}
                          </span>
                          <span className="text-xs bg-surface-container-highest px-2.5 py-1 rounded-md text-on-surface-variant font-bold">
                            {registros.length}{" "}
                            {registros.length === 1 ? "discurso" : "veces"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-outline-variant/20">
                          {registros.map((r, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/30 font-medium"
                            >
                              <span className="font-bold text-secondary">
                                {r.fecha}
                              </span>
                              {r.tema && (
                                <span className="text-on-surface-variant ml-1">
                                  - {r.tema}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente de validación e inclusión del botón "Crear invitación"
function RenderInputDiscursante({ num, label, data, setData, repeticion }) {
  const [modalInvitacionAbierto, setModalInvitacionAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const copiarTextoInvitacion = () => {
    const texto = `REUNIÓN SACRAMENTAL\nEstimado(a) hermano(a):\n\n${data.nombre || "[NOMBRE DEL MIEMBRO]"}\nEl Obispado del Barrio Cerro Moreno tiene el agrado de invitarle a participar como discursante en nuestra reunión sacramental.\nTEMA ASIGNADO:\n\n${data.tema || "[TEMA DEL DISCURSO]"}\n\nSerá una bendición contar con su participación y testimonio, los cuales contribuirán a fortalecer la fe y edificar espiritualmente a los miembros de nuestra congregación.\nAgradecemos su disposición y servicio al Señor.\n\nCon aprecio fraternal,\nObispado Barrio Cerro Moreno\nEstaca La Portada`;

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div
      className={`p-5 rounded-3xl border transition-all space-y-4 relative ${repeticion ? "bg-rose-50/70 border-rose-300/80 shadow-sm" : "bg-surface-container-lowest border-outline-variant/40 shadow-xs"}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white text-[12px] flex items-center justify-center font-extrabold shrink-0 shadow-sm">
            {num}
          </span>
          {label}
        </label>
        {repeticion && (
          <StatusBadge status="danger">⚠️ Ya dio discurso antes</StatusBadge>
        )}
      </div>

      {repeticion && (
        <div className="p-3 rounded-2xl bg-rose-100/90 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-0.5">
              ¡Alerta! {data.nombre} ya discursó el {repeticion.fecha}.
            </p>
            {repeticion.tema && (
              <p className="text-xs opacity-90">
                Tema anterior:{" "}
                <span className="italic font-medium">"{repeticion.tema}"</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <input
          type="text"
          placeholder="Nombre completo del discursante"
          value={data.nombre}
          onChange={(e) => setData({ ...data, nombre: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 shadow-xs transition-shadow ${repeticion ? "border-rose-400 focus:ring-rose-500 font-semibold text-rose-950" : "border-outline-variant/60 focus:ring-primary"}`}
        />
        <input
          type="text"
          placeholder="Tema del discurso (opcional)"
          value={data.tema}
          onChange={(e) => setData({ ...data, tema: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl text-sm border border-outline-variant/60 bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs transition-shadow"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-sm border-t border-outline-variant/20">
        <label className="flex items-center gap-2.5 cursor-pointer text-on-surface-variant font-medium group">
          <input
            type="checkbox"
            checked={data.confirmado}
            onChange={(e) => setData({ ...data, confirmado: e.target.checked })}
            className="rounded border-outline-variant/80 text-primary focus:ring-primary w-4 h-4 transition-colors cursor-pointer"
          />
          <span className="group-hover:text-primary transition-colors">
            Confirmado / Notificado
          </span>
        </label>

        {/* Botón Crear Invitación en la esquina inferior derecha de la card */}
        <button
          type="button"
          onClick={() => setModalInvitacionAbierto(true)}
          className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs self-end sm:self-auto"
        >
          <Sparkles size={14} /> Crear invitación
        </button>
      </div>

      {/* MODAL: VENTANA EMERGENTE DE LA INVITACIÓN MINIMALISTA */}
      {modalInvitacionAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 flex flex-col gap-6 relative">
            {/* Tarjeta de invitación minimalista */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50/30 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-inner text-slate-800 space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <p className="text-[10px] tracking-widest font-bold text-sky-700 uppercase">
                  Barrio Cerro Moreno · Estaca La Portada
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Reunión Sacramental
                </h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <p className="font-medium text-slate-900">
                  Estimado(a) hermano(a):
                </p>

                <p className="text-sm font-extrabold text-sky-900 bg-sky-50/80 px-3 py-2 rounded-xl border border-sky-100 text-center">
                  {data.nombre || "[NOMBRE DEL MIEMBRO]"}
                </p>

                <p className="text-slate-600">
                  El Obispado del Barrio Cerro Moreno tiene el agrado de
                  invitarle a participar como discursante en nuestra reunión
                  sacramental.
                </p>

                <div className="bg-slate-100/80 p-3.5 rounded-xl border border-slate-200/60 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tema Asignado
                  </span>
                  <p className="text-sm font-semibold text-slate-900 italic">
                    "{data.tema || "[TEMA DEL DISCURSO]"}"
                  </p>
                </div>

                <p className="text-slate-600 text-[11px]">
                  Será una bendición contar con su participación y testimonio,
                  los cuales contribuirán a fortalecer la fe y edificar
                  espiritualmente a los miembros de nuestra congregación.
                  Agradecemos su disposición y servicio al Señor.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 text-center space-y-0.5">
                <p className="text-[11px] font-bold text-slate-800">
                  Con aprecio fraternal,
                </p>
                <p className="text-xs font-extrabold text-sky-900">
                  Obispado Barrio Cerro Moreno
                </p>
                <p className="text-[10px] text-slate-500">Estaca La Portada</p>
              </div>
            </div>

            {/* Acciones del modal */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalInvitacionAbierto(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={copiarTextoInvitacion}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {copiado ? (
                  <Check size={16} className="text-emerald-300" />
                ) : (
                  <Copy size={16} />
                )}
                {copiado ? "¡Copiado al portapapeles!" : "Copiar invitación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
