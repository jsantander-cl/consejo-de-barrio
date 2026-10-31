Consejo de Barrio — App

Plataforma web (PWA) para la gestión de consejos y reuniones de liderazgo de una organización eclesiástica: agendas, actas confidenciales, seguimiento de compromisos y control de asignaciones, con acceso restringido por roles.

Demo: consejo-de-barrio-jet.vercel.app

El problema

La coordinación de un consejo de barrio y de las reuniones de obispado se hacía con documentos sueltos y mensajes: actas dispersas, compromisos sin seguimiento y discursos repetidos en fechas cercanas. Esta app centraliza todo en un solo lugar y protege la información sensible según el rol de cada usuario.

Funcionalidades
Tablero general del consejo con el resumen de reuniones y compromisos.
Agendas estructuradas: 7 secciones para el Consejo de Barrio y 8 para la reunión de Obispado.
Actas confidenciales: acceso exclusivo para obispado y secretarios.
Kanban de compromisos ministeriales con estados y responsables.
Senda de Convenios: checklist flexible para el seguimiento de nuevos conversos y miembros reactivados.
Control de discursos sacramentales con alertas automáticas de repetición.
Planificador de actividades y calendario general.
Informes ejecutivos en PDF generados desde las actas.
Instalable como PWA en el celular y diseño responsive.

Stack tecnológico
Área	Tecnología
Frontend	React (Vite)
Estilos	Tailwind CSS v4
Backend como servicio	Supabase (Auth + PostgreSQL)
Seguridad	Row Level Security (RLS)
Íconos	Lucide Icons
PDF	[librería usada para generar los PDF]
Gestor de paquetes	pnpm
Despliegue	Vercel

Seguridad y control de acceso

El acceso se controla en dos capas:

Interfaz: RutaProtegidaObispado oculta las rutas que el rol no puede ver.
Base de datos: las políticas RLS de Supabase impiden que un usuario sin permisos lea información restringida, incluso consultando la API directamente.

Autenticación con Supabase Auth y sesión persistente.

Ruta	Página	Acceso
/login	Inicio de sesión	Público
/	Dashboard	Autenticado
/reuniones	Lista de reuniones	Autenticado
/reuniones/:id	Agenda Consejo de Barrio	Autenticado
/reuniones/obispado/:id?	Agenda de Obispado	Solo obispado y secretarios
/compromisos	Kanban de asignaciones	Autenticado
/senda-convenios	Seguimiento de miembros	Autenticado
/actividades	Planificación de actividades	Autenticado
/calendario	Calendario general	Autenticado

Modelo de datos

11 tablas relacionales en PostgreSQL: usuarios, reuniones, reunion_participantes, agenda_items, asignaciones, miembros_seguimiento, checklist_senda_convenios, miembro_checklist_progreso, actividades, organizaciones y calendario_eventos.

Estructura del proyecto
src/
  components/        Componentes compartidos (Sidebar, TopBar, BottomNav, ui.jsx)
  layouts/
    AppLayout.jsx    Layout con sidebar + topbar + bottomnav
  lib/
    AuthContext.jsx  Sesión y rol del usuario (Supabase Auth)
    navigation.js    Fuente única de verdad del menú
    supabaseClient.js Cliente de Supabase
  pages/
    Login.jsx
    Dashboard.jsx
    Reuniones.jsx
    ReunionDetalle.jsx
    ReunionObispado.jsx
    Compromisos.jsx
    SendaConvenios.jsx
    Actividades.jsx
    Calendario.jsx

Estructura del proyecto

    ├── eslint.config.js
├── index.html
├── node_modules
|  ├── @supabase
|  ├── @tailwindcss
|  ├── @vitejs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── public
|  ├── favicon.svg
|  └── icons.svg
├── README.md
├── src
|  ├── App.jsx
|  ├── assets
|  |  ├── hero.png
|  |  ├── react.svg
|  |  └── vite.svg
|  ├── components
|  |  ├── BottomNav.jsx
|  |  ├── MobileDrawer.jsx
|  |  ├── Modal.jsx
|  |  ├── modals
|  |  |  ├── AgendarReunionCalendarioModal.jsx
|  |  |  ├── DetalleAsignacionModal.jsx
|  |  |  ├── EditarHitoModal.jsx
|  |  |  ├── NuevaActividadModal.jsx
|  |  |  ├── NuevaAsignacionModal.jsx
|  |  |  ├── NuevaReunionModal.jsx
|  |  |  ├── NuevoMiembroModal.jsx
|  |  |  └── ReasignarModal.jsx
|  |  ├── ProtectedRoute.jsx
|  |  ├── RutaProtegidaObispado.jsx
|  |  ├── Sidebar.jsx
|  |  ├── TopBar.jsx
|  |  └── ui.jsx
|  ├── index.css
|  ├── layouts
|  |  └── AppLayout.jsx
|  ├── lib
|  |  ├── AsignacionesContext.jsx
|  |  ├── AuthContext.jsx
|  |  ├── navigation.js
|  |  ├── supabaseClient.js
|  |  └── useUsuarios.js
|  ├── main.jsx
|  └── pages
|     ├── Actividades.jsx
|     ├── Calendario.jsx
|     ├── Compromisos.jsx
|     ├── Dashboard.jsx
|     ├── Discursantes.jsx
|     ├── Login.jsx
|     ├── Organizaciones.jsx
|     ├── Perfil.jsx
|     ├── ReunionDetalle.jsx
|     ├── Reuniones.jsx
|     ├── ReunionObispado.jsx
|     └── SendaConvenios.jsx
└── vite.config.js

Cómo ejecutarlo en local

Requisitos: Node.js v24.18.0 y pnpm.
git clone https://github.com/jsantander-cl/consejo-de-barrio.git
cd consejo-de-barrio
pnpm install
cp .env.example .env      # completa con las credenciales de tu proyecto Supabase
pnpm dev

Abre http://localhost:5173

Las variables de entorno necesarias están listadas en .env.example. Nunca subas tu archivo .env al repositorio.

Acceso de prueba

[Si dejas un usuario de demostración, escríbelo aquí: correo y contraseña de una cuenta sin datos reales. Si no, elimina esta sección y apóyate en las capturas.]

Decisiones técnicas
Supabase para tener autenticación y base de datos relacional sin mantener un servidor propio.
RLS en la base de datos para que la seguridad no dependa solo del frontend.
Una única fuente de verdad para la navegación (navigation.js), de modo que menú y rutas no se desincronicen.
Mobile-first, ya que los líderes la usan principalmente desde el celular.
Autor

Jordan Santander — Frontend Developer Junior LinkedIn · GitHub
