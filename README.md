🛡️ Consejo de Barrio | Barrio Cerro Moreno
Plataforma web de deliberación, ministración, control de entrevistas y gestión unificada para el liderazgo del Barrio Cerro Moreno (Estaca La Portada).

🚀 Arquitectura y Tecnologías
El proyecto está desarrollado bajo una arquitectura moderna de SPA (Single Page Application) optimizada para alto rendimiento, seguridad y responsividad:

Frontend: React 18, Vite, Tailwind CSS (v4) y Lucide React (iconos vectoriales).

Enrutamiento: React Router DOM (con control de rutas protegidas y guardianes de rol).

Backend y Base de Datos: Supabase (Autenticación por roles y base de datos relacional PostgreSQL con políticas RLS).

Despliegue y Hosting: Vercel (con redirección forzada a HTTPS y certificados SSL automáticos).

📂 Estructura del Proyecto

Consejo-de-Barrio/
├── public/
│   ├── favicon.svg
│   ├── og-cover.png
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── modals/         # Modales de reasignación y detalle de tareas
│   │   ├── BottomNav.jsx   # Barra de navegación inferior móvil
│   │   ├── MobileDrawer.jsx# Menú de hamburguesa y cajón lateral móvil
│   │   ├── ProtectedRoute.jsx # Guardián de sesión activa
│   │   ├── RutaProtegidaObispado.jsx # Guardián de roles de obispado
│   │   ├── Sidebar.jsx     # Barra lateral de escritorio con submenús
│   │   └── TopBar.jsx      # Barra superior con notificaciones y perfil
│   ├── layouts/
│   │   └── AppLayout.jsx   # Layout principal unificado
│   ├── lib/
│   │   ├── AuthContext.jsx # Proveedor de contexto y autenticación Supabase
│   │   ├── AsignacionesContext.jsx # Proveedor de tareas y compromisos
│   │   ├── navigation.js   # Configuración central de rutas y permisos
│   │   └── supabaseClient.js # Cliente de conexión a Supabase
│   ├── pages/
│   │   ├── Actividades.jsx
│   │   ├── Calendario.jsx
│   │   ├── Compromisos.jsx
│   │   ├── Dashboard.jsx   # Tablero general con KPIs y gráficos de progreso
│   │   ├── Discursantes.jsx
│   │   ├── EntrevistasObispado.jsx # Control de entrevistas y recomendación de templo
│   │   ├── Login.jsx       # Vista de acceso seguro institucional
│   │   ├── NotFound.jsx    # Página 404 personalizada
│   │   ├── Organizaciones.jsx
│   │   ├── Perfil.jsx
│   │   ├── ReunionDetalle.jsx
│   │   ├── ReunionObispado.jsx
│   │   └── Reuniones.jsx   # Gestión de actas e informes en PDF
│   ├── App.jsx             # Enrutador principal de la aplicación
│   ├── index.css           # Estilos globales y directivas de Tailwind
│   └── main.jsx            # Punto de entrada de React
├── index.html              # Metadatos SEO y Open Graph
├── package.json
└── vite.config.js

⚙️ Configuración y Variables de Entorno
Para levantar el proyecto en un entorno de desarrollo local, sigue estos pasos:

1 Clona el repositorio e instala las dependencias:
npm install

2 Crea un archivo .env en la raíz del proyecto y configura tus credenciales de Supabase:
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon_publica_de_supabase

3 Ejecuta el servidor de desarrollo local con Vite:
npm run dev

🔒 Seguridad y Control de Acceso
Autenticación: Gestionada íntegramente mediante Supabase Auth con manejo seguro de sesiones por token almacenado en caché cifrada.

Control por Roles (ROLES_ACCESO_OBISPADO): Los accesos a secciones confidenciales como el Obispado, Agenda de Reuniones de Obispado y Control de Entrevistas están restringidos de forma estricta a los roles autorizados (obispo, consejero, sec_ejecutivo, sec_barrio).

Privacidad de Indexación: Configurado con un archivo robots.txt restrictivo (Disallow: /) y metatiquetas noindex, nofollow para proteger los datos eclesiásticos y el padrón de miembros frente a motores de búsqueda públicos.

📱 Características Destacadas
Interfaz Responsiva Completa: Adaptación fluida entre escritorio y dispositivos móviles mediante un cajón lateral (MobileDrawer) que replica la estructura del menú del obispado.

Indicadores de Carga Asíncrona: Implementación de componentes visuales con spinners (Loader2) optimizados para evitar saltos de contenido durante las consultas a Supabase.

Gestión de Padrón y Senda de Convenios: Seguimiento estructurado del progreso de los miembros y compromisos asignados por organización auxiliar.