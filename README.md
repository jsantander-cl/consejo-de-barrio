# Consejo de Barrio — App

App para el Consejo de Barrio y Reuniones de Obispado (La Iglesia de Jesucristo
de los Santos de los Últimos Días), basada en el modelo de datos y las 9
pantallas diseñadas en Google Stitch.

## Arranque rápido

```bash
pnpm install
cp .env.example .env      # completa tus credenciales de Supabase
pnpm dev
```

Abre http://localhost:5173

## Estructura

```
src/
  components/        Componentes compartidos (Sidebar, TopBar, BottomNav, ui.jsx)
  layouts/
    AppLayout.jsx     Layout con sidebar + topbar + bottomnav, envuelve todas las páginas
  lib/
    AuthContext.jsx   Sesión y rol del usuario (placeholder, listo para Supabase Auth)
    navigation.js     Fuente única de verdad de los items del menú
    supabaseClient.js Cliente de Supabase (usa las vars de .env)
  pages/
    Login.jsx
    Dashboard.jsx
    Reuniones.jsx           Lista de reuniones (Consejo de Barrio + Obispado)
    ReunionDetalle.jsx      Agenda de 7 secciones del Consejo de Barrio
    ReunionObispado.jsx     Agenda de 8 secciones — RUTA PROTEGIDA por rol
    Compromisos.jsx         Kanban de asignaciones
    SendaConvenios.jsx      Checklist flexible de nuevos conversos / reactivados
    Actividades.jsx
    Calendario.jsx
```

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | Login | Público |
| `/` | Dashboard | Autenticado |
| `/reuniones` | Lista de reuniones | Autenticado |
| `/reuniones/:id` | Agenda Consejo de Barrio | Autenticado |
| `/reuniones/obispado/:id?` | Agenda de Obispado | **Solo obispado + secretarios** |
| `/compromisos` | Kanban de asignaciones | Autenticado |
| `/senda-convenios` | Seguimiento de miembros | Autenticado |
| `/actividades` | Planificación de actividades | Autenticado |
| `/calendario` | Calendario general | Autenticado |

## Pendientes antes de producción

1. **Conectar Supabase real**: todas las páginas tienen arrays de datos de
   ejemplo marcados con `// TODO:` indicando la consulta que los debe
   reemplazar (usa el modelo de 11 tablas que ya definimos: `usuarios`,
   `reuniones`, `reunion_participantes`, `agenda_items`, `asignaciones`,
   `miembros_seguimiento`, `checklist_senda_convenios`,
   `miembro_checklist_progreso`, `actividades`, `organizaciones`,
   `calendario_eventos`).
2. **Row Level Security (RLS)**: `RutaProtegidaObispado` solo oculta la UI.
   La protección real debe vivir en políticas RLS de Supabase para que un
   líder de organización no pueda leer reuniones tipo `obispado` ni por API
   directa.
3. **Autenticación real**: reemplazar el `useState` de `AuthContext.jsx` por
   `supabase.auth` (login, sesión persistente, `onAuthStateChange`).
4. **PWA**: agregar `vite-plugin-pwa` + manifest cuando el resto esté
   funcionando, para poder instalar la app desde el navegador móvil.
