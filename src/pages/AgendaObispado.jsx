import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, User, FileText, Loader2, ShieldAlert } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function AgendaObispado() {
  const navigate = useNavigate()
  const [reuniones, setReuniones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Estados para el formulario del modal
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [presididaPor, setPresididaPor] = useState('')
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      // Ordenadas de más reciente a más antigua usando created_at o id descendente
      const { data: dataReuniones, error: errReuniones } = await supabase
        .from('reuniones')
        .select('*, presidida:usuarios!reuniones_presidida_por_fkey(nombre)')
        .eq('tipo', 'obispado')
        .order('created_at', { ascending: false }) // Del más reciente al más antiguo

      if (errReuniones) throw errReuniones
      setReuniones(dataReuniones || [])

      // Cargar lista de usuarios para el selector de "Preside"
      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre')
        .order('nombre')

      if (errUsuarios) throw errUsuarios
      setUsuarios(dataUsuarios || [])
    } catch (err) {
      console.error('Error al cargar datos de obispado:', err.message)
    } finally {
      setCargando(false)
    }
  }

  // Convertir fecha AAAA-MM-DD a DD-MM-AAAA
  function formatearFecha(fechaStr) {
    if (!fechaStr) return ''
    const soloFecha = fechaStr.split('T')[0]
    const [anio, mes, dia] = soloFecha.split('-')
    if (!anio || !mes || !dia) return fechaStr
    return `${dia}-${mes}-${anio}`
  }

  async function handleCrearReunion(e) {
    e.preventDefault()
    if (!nuevaFecha) return
    setCreando(true)

    try {
      const { data, error } = await supabase
        .from('reuniones')
        .insert([
          { 
            fecha: nuevaFecha, 
            tipo: 'obispado',
            estado: 'planificada',
            presidida_por: presididaPor ? presididaPor : null,
            created_at: new Date()
          }
        ])
        .select()

      if (error) throw error

      setModalAbierto(false)
      setNuevaFecha('')
      setPresididaPor('')
      cargarDatos()

      if (data && data[0]) {
        navigate(`/reuniones/obispado/${data[0].id}`)
      }
    } catch (err) {
      console.error('Error al crear la reunión de obispado:', err.message)
    } finally {
      setCreando(false)
    }
  }

  async function descargarInformePDF(reunion) {
    const { data: notasData } = await supabase
      .from('reunion_agenda_notas')
      .select('*')
      .eq('reunion_id', reunion.id)
      .order('seccion_id')

    const tituloReunion = 'Reunión Ordinaria de Obispado'
    const fechaFormateada = formatearFecha(reunion.fecha)
    const presideNombre = reunion.presidida?.nombre || 'No asignado'

    const ventanaImpresion = window.open('', '_blank')
    if (!ventanaImpresion) {
      alert('Por favor, permite las ventanas emergentes (pop-ups) para descargar el informe PDF.')
      return
    }

    const htmlContenido = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Informe - ${tituloReunion} (${fechaFormateada})</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { font-size: 20px; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase; }
          .header p { font-size: 12px; color: #475569; margin: 3px 0; }
          .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: bold; background: #e2e8f0; border-radius: 4px; text-transform: uppercase; margin-top: 5px; }
          .confidencial { color: #b91c1c; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Consejo de Barrio · Barrio Cerro Moreno</h1>
          <p><strong>${tituloReunion}</strong></p>
          <p>Fecha: ${fechaFormateada} | Preside: ${presideNombre}</p>
          <p class="confidencial">⚠️ REGISTRO DE CARÁCTER SAGRADO Y RESERVADO</p>
          <span class="badge">Estado: ${reunion.estado}</span>
        </div>
        <p>Informe generado para el registro de obispado.</p>
        <div class="footer">Generado por Consejo de Barrio · ${new Date().toLocaleDateString('es-ES')}</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `
    ventanaImpresion.document.write(htmlContenido)
    ventanaImpresion.document.close()
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert size={14} /> Carácter Sagrado y Reservado
          </span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mt-0.5">Reunión de Obispado</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus size={20} /> Nueva reunión de obispado
        </button>
      </div>

      {reuniones.length === 0 && (
        <p className="text-sm text-on-surface-variant italic">No hay reuniones de obispado registradas.</p>
      )}

      <div className="space-y-4">
        {reuniones.map((r) => {
          const rutaVerAgenda = `/reuniones/obispado/${r.id}`
          const fechaFormateada = formatearFecha(r.fecha)

          return (
            <Card key={r.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {/* Etiqueta superior con tono azul/celeste armónico en lugar de rojo */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      Obispado
                    </span>
                    <StatusBadge status="neutral">{r.estado}</StatusBadge>
                  </div>
                  {/* Título limpio sin guiones ni fechas repetidas */}
                  <h3 className="text-lg font-bold text-primary">
                    Reunión de Obispado
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-primary" /> {fechaFormateada}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} className="text-primary" /> Preside: {r.presidida?.nombre || 'No asignado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => descargarInformePDF(r)}
                    className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold px-3.5 py-2 rounded-xl border border-outline-variant/40 shadow-2xs transition-all cursor-pointer"
                    title="Descargar informe en PDF"
                  >
                    <FileText size={15} /> Descargar informe
                  </button>

                  <button
                    onClick={() => navigate(rutaVerAgenda)}
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Calendar size={15} /> Ver agenda
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-lg border border-outline-variant/30">
            <h2 className="text-lg font-bold text-primary mb-4">Nueva Reunión de Obispado</h2>
            <form onSubmit={handleCrearReunion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Tipo de reunión</label>
                <input
                  type="text"
                  disabled
                  value="Reunión de Obispado"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm text-on-surface-variant cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Fecha de la reunión</label>
                <input
                  type="date"
                  required
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">¿Quién preside?</label>
                <select
                  value={presididaPor}
                  onChange={(e) => setPresididaPor(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar líder que preside...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creando}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {creando ? 'Creando...' : 'Crear reunión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}