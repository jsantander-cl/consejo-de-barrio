import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, User, FileText } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import NuevaReunionModal from '../components/modals/NuevaReunionModal.jsx'

export default function Reuniones() {
  const navigate = useNavigate()
  const [reuniones, setReuniones] = useState([])
  const [tipoFiltro, setTipoFiltro] = useState('todas')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  async function cargarReuniones() {
    setCargando(true)
    const { data, error } = await supabase
      .from('reuniones')
      .select('*, presidida:usuarios!reuniones_presidida_por_fkey(nombre)')
      .order('fecha', { ascending: false })

    if (!error && data) {
      setReuniones(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarReunion()
  }, [])

  function cargarReunion() {
    cargarReuniones()
  }

  // Generación e impresión de informe PDF con disposición VERTICAL completa por organización
  async function descargarInformePDF(reunion) {
    const { data: notasData } = await supabase
      .from('reunion_agenda_notas')
      .select('*')
      .eq('reunion_id', reunion.id)
      .order('seccion_id')

    const esObispado = reunion.tipo === 'obispado'
    const tituloReunion = esObispado ? 'Reunión Ordinaria de Obispado' : 'Consejo Ordinario de Barrio'
    const fechaFormateada = new Date(reunion.fecha).toLocaleDateString('es-ES', { dateStyle: 'full' })
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

    // Procesar los registros decodificando la estructura JSON
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
        <title>Informe - ${tituloReunion} (${reunion.fecha.slice(0, 10)})</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { font-size: 20px; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase; }
          .header p { font-size: 12px; color: #475569; margin: 3px 0; }
          .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: bold; background: #e2e8f0; border-radius: 4px; text-transform: uppercase; margin-top: 5px; }
          .confidencial { color: #b91c1c; font-weight: bold; }
          .seccion { margin-bottom: 24px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; page-break-inside: avoid; background: #ffffff; }
          .seccion-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; }
          .seccion-titulo { font-size: 15px; font-weight: bold; color: #0f172a; }
          .seccion-estado { font-size: 11px; font-weight: bold; color: #475569; background: #f1f5f9; padding: 3px 10px; border-radius: 6px; }
          
          /* Disposición estrictamente VERTICAL (apilada hacia abajo) */
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
          ${esObispado ? '<p class="confidencial">⚠️ REGISTRO DE CARÁCTER SAGRADO Y RESERVADO</p>' : ''}
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
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `

    ventanaImpresion.document.write(htmlContenido)
    ventanaImpresion.document.close()
  }

  const reunionesFiltradas = reuniones.filter(r => {
    if (tipoFiltro === 'consejo_barrio') return r.tipo === 'consejo_barrio'
    if (tipoFiltro === 'obispado') return r.tipo === 'obispado'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar size={14} /> Deliberación & Mayordomía
          </span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mt-0.5">Calendario de Consejos</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Plus size={20} /> Nueva reunión
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => setTipoFiltro('todas')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tipoFiltro === 'todas' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setTipoFiltro('consejo_barrio')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tipoFiltro === 'consejo_barrio' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
        >
          Consejo de Barrio
        </button>
        <button
          onClick={() => setTipoFiltro('obispado')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${tipoFiltro === 'obispado' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
        >
          Obispado
        </button>
      </div>

      {cargando && <p className="text-sm text-on-surface-variant">Cargando reuniones...</p>}
      {!cargando && reunionesFiltradas.length === 0 && (
        <p className="text-sm text-on-surface-variant italic">No hay reuniones registradas en esta categoría.</p>
      )}

      <div className="space-y-4">
        {reunionesFiltradas.map((r) => {
          const esObispado = r.tipo === 'obispado'
          const rutaAgenda = esObispado ? `/reuniones/obispado/${r.id}` : `/reuniones/${r.id}`

          return (
            <Card key={r.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={esObispado ? 'danger' : 'success'}>
                      {esObispado ? 'Obispado' : 'Consejo de Barrio'}
                    </StatusBadge>
                    <StatusBadge status="neutral">{r.estado}</StatusBadge>
                  </div>
                  <h3 className="text-lg font-bold text-primary">
                    {esObispado ? 'Obispado' : 'Consejo de Barrio'} - {r.fecha.slice(0, 10)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-primary" /> {r.fecha.slice(0, 10)}
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

      <NuevaReunionModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onCreada={cargarReuniones}
      />
    </div>
  )
}