import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, User, FileText, Loader2, Users, AlertCircle } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Reuniones() {
  const navigate = useNavigate()
  const [reuniones, setReuniones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Estados para el formulario del modal
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [presididaPor, setPresididaPor] = useState('')
  const [creando, setCreando] = useState(false)
  const [errorModal, setErrorModal] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const { data: dataReuniones, error: errReuniones } = await supabase
        .from('reuniones')
        .select('*, presidida:usuarios!reuniones_presidida_por_fkey(nombre)')
        .in('tipo', ['Consejo de Barrio', 'consejo_barrio'])
        .order('created_at', { ascending: false })

      if (errReuniones) throw errReuniones
      setReuniones(dataReuniones || [])

      const { data: dataUsuarios, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre')
        .order('nombre')

      if (errUsuarios) throw errUsuarios
      setUsuarios(dataUsuarios || [])
    } catch (err) {
      console.error('Error al cargar datos de Consejo de Barrio:', err.message)
    } finally {
      setCargando(false)
    }
  }

  function formatearFecha(fechaStr) {
    if (!fechaStr) return ''
    const soloFecha = fechaStr.split('T')[0]
    const [anio, mes, dia] = soloFecha.split('-')
    if (!anio || !mes || !dia) return fechaStr
    return `${dia}-${mes}-${anio}`
  }

  async function handleCrearReunion(e) {
    e.preventDefault()
    setErrorModal('')

    if (!nuevaFecha) {
      setErrorModal('Por favor selecciona una fecha válida.')
      return
    }

    setCreando(true)

    try {
      const payload = { 
        fecha: nuevaFecha, 
        tipo: 'consejo_barrio', // Ajustado exactamente al formato que exige la base de datos
        estado: 'planificada'
      }

      if (presididaPor) {
        payload.presidida_por = presididaPor
      }

      const { data, error } = await supabase
        .from('reuniones')
        .insert([payload])
        .select()

      if (error) throw error

      setModalAbierto(false)
      setNuevaFecha('')
      setPresididaPor('')
      setErrorModal('')
      await cargarDatos()

      if (data && data[0]) {
        navigate(`/reuniones/${data[0].id}`)
      }
    } catch (err) {
      console.error('Error al crear la reunión de Consejo de Barrio:', err)
      setErrorModal(err.message || 'Ocurrió un error al crear la reunión en la base de datos.')
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

    const tituloReunion = 'Consejo Ordinario de Barrio'
    const fechaFormateada = formatearFecha(reunion.fecha)
    const presideNombre = reunion.presidida?.nombre || 'No asignado'

    const ventanaImpresion = window.open('', '_blank')
    if (!ventanaImpresion) {
      alert('Por favor, permite las ventanas emergentes (pop-ups) para descargar el informe PDF.')
      return
    }

    const TITULOS_SECCIONES = {
      '1': 'Apertura y Espíritu de Consejo',
      '2': 'Obra de Salvación y Exaltación (Ministración)',
      '3': 'Fortalecimiento de Jóvenes y Niños',
      '4': 'Obra Misional e Historia Familiar / Templo',
      '5': 'Coordinación de Actividades y Calendario',
      '6': 'Asuntos Adicionales y Cierre'
    }

    const listaSecciones = []

    if (notasData) {
      notasData.forEach(item => {
        let generalTexto = ''
        let subObj = {}

        if (item.notas) {
          try {
            const parsed = JSON.parse(item.notas)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              generalTexto = parsed.general || ''
              subObj = parsed.sub || {}
            } else {
              generalTexto = item.notas
            }
          } catch {
            generalTexto = item.notas
          }
        }

        const orgsConNotas = []
        Object.entries(subObj).forEach(([orgNombre, contenido]) => {
          if (contenido && contenido.trim() !== '') {
            orgsConNotas.push({ org: orgNombre, texto: contenido })
          }
        })

        if ((generalTexto && generalTexto.trim() !== '') || orgsConNotas.length > 0) {
          listaSecciones.push({
            seccionId: String(item.seccion_id),
            estado: item.estado || 'Pendiente',
            general: generalTexto,
            orgs: orgsConNotas
          })
        }
      })
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
          .seccion { margin-bottom: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; page-break-inside: avoid; background: #ffffff; }
          .seccion-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; }
          .seccion-titulo { font-size: 15px; font-weight: bold; color: #0f172a; }
          .seccion-estado { font-size: 11px; font-weight: bold; color: #475569; background: #f1f5f9; padding: 3px 10px; border-radius: 6px; }
          .org-lista { display: block; width: 100%; margin-top: 12px; }
          .org-card { width: 100%; box-sizing: border-box; display: block; clear: both; background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 6px; margin-bottom: 12px; }
          .org-nombre { font-size: 13px; font-weight: bold; color: #0369a1; margin-bottom: 6px; }
          .texto-nota { font-size: 12px; color: #334155; white-space: pre-wrap; line-height: 1.5; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Consejo de Barrio · Barrio Cerro Moreno</h1>
          <p><strong>${tituloReunion}</strong></p>
          <p>Fecha: ${fechaFormateada} | Preside: ${presideNombre}</p>
          <span class="badge">Estado: ${reunion.estado}</span>
        </div>
        <h3 style="font-size: 16px; margin-bottom: 16px; color: #0f172a;">Resumen Ejecutivo de la Sesión</h3>
        ${
          listaSecciones.length === 0
            ? '<p style="font-size: 12px; color: #64748b; font-style: italic;">No hay notas ni informes registrados para esta sesión.</p>'
            : listaSecciones.map(sec => {
                const tituloNombre = TITULOS_SECCIONES[sec.seccionId] || `Punto #${sec.seccionId}`
                return `
                  <div class="seccion">
                    <div class="seccion-header">
                      <span class="seccion-titulo">${sec.seccionId}.${tituloNombre}</span>
                      <span class="seccion-estado">${sec.estado}</span>
                    </div>
                    ${sec.general ? `
                      <div style="margin-bottom: 14px;">
                        <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Notas Generales:</span>
                        <div class="texto-nota" style="margin-top: 4px;">${sec.general}</div>
                      </div>
                    ` : ''}
                    ${sec.orgs.length > 0 ? `
                      <div class="org-lista">
                        ${sec.orgs.map(o => `
                          <div class="org-card">
                            <div class="org-nombre">📌 ${o.org}</div>
                            <div class="texto-nota">${o.texto}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `
              }).join('')
        }
        <div class="footer">
          Generado automáticamente por la plataforma Consejo de Barrio · ${new Date().toLocaleDateString('es-ES')}
        </div>
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
            <Users size={14} /> Deliberación y Mayordomía
          </span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mt-0.5">Consejo de Barrio</h1>
        </div>
        <button
          onClick={() => {
            setErrorModal('')
            setModalAbierto(true)
          }}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus size={20} /> Nueva reunión
        </button>
      </div>

      {reuniones.length === 0 && (
        <p className="text-sm text-on-surface-variant italic">No hay reuniones de Consejo de Barrio registradas.</p>
      )}

      <div className="space-y-4">
        {reuniones.map((r) => {
          const rutaAgenda = `/reuniones/${r.id}`
          const fechaFormateada = formatearFecha(r.fecha)

          return (
            <Card key={r.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="success">Consejo de Barrio</StatusBadge>
                    <StatusBadge status="neutral">{r.estado}</StatusBadge>
                  </div>
                  <h3 className="text-lg font-bold text-primary">
                    Consejo de Barrio
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
                    onClick={() => navigate(rutaAgenda)}
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
            <h2 className="text-lg font-bold text-primary mb-4">Nueva reunión</h2>
            
            {errorModal && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCrearReunion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Tipo de reunión</label>
                <input
                  type="text"
                  disabled
                  value="Consejo de Barrio"
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