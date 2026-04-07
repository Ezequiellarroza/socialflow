# CLAUDE.md - SocialFlow

## Descripcion del Proyecto

SocialFlow es una plataforma SaaS white-label para agencias de marketing digital. Permite gestionar la aprobacion de contenidos para redes sociales centralizando feedback, versiones y decisiones del cliente en un portal visual personalizable con la marca de cada agencia.

**Problema que resuelve:** Elimina la gestion dispersa de aprobaciones por email, WhatsApp, PDFs y Drive, reemplazandola por un flujo estructurado de aprobacion/rechazo/solicitud de cambios.

**Propiedad:** Trinity (uso privado y comercial).

---

## Stack Tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript 5.8 |
| Bundler | Vite 6 |
| Estilos | Tailwind CSS 4 (con `@tailwindcss/postcss`) |
| Routing | React Router DOM 7 (HashRouter) |
| IA (copywriting) | Google Gemini (`@google/genai`, modelo `gemini-3-flash-preview`) |
| Backend | PHP (API REST externa en `socialflow.com.ar/api`) |
| Base de datos | MySQL (gestionada por el backend PHP) |
| Storage multimedia | Cloudinary (via backend PHP + endpoint `/upload.php`) |
| Arquitectura | Multi-tenant (cada agencia con su slug y branding) |
| Deploy | Build estatico (`dist/`) para cPanel |
| Iconos | Material Symbols Outlined (Google Fonts) |
| Tipografias | Manrope (display) + Noto Sans (body) via Google Fonts |

---

## Estructura de Carpetas

```
socialflow/
├── index.html              # HTML principal, carga fonts y Material Symbols
├── index.tsx               # Entry point React (createRoot + StrictMode)
├── index.css               # Estilos globales + tema Tailwind (@theme)
├── App.tsx                 # Router principal, layouts, rutas protegidas
├── types.ts                # Tipos globales (AuthUser, LoginCredentials, etc.)
├── geminiService.ts        # Servicio de IA (captions + hashtags con Gemini)
├── metadata.json           # Metadata del proyecto (nombre, descripcion)
│
├── hooks/                  # Custom hooks
│   ├── index.ts            # Barrel exports (useClientes, useAuth)
│   └── useClientes.ts      # Hook CRUD de clientes (fetch, create, update, delete)
│
├── context/                # React Context providers
│   ├── AuthContext.tsx      # Autenticacion (user, login, logout, token refresh)
│   └── BrandingContext.tsx  # Branding dinamico por agencia (colores, logo, slug)
│
├── services/               # Capa de comunicacion con el backend PHP
│   ├── index.ts            # Barrel exports de todos los services
│   ├── api.ts              # ApiService base (fetch wrapper con JWT + refresh)
│   ├── auth.ts             # Login, logout, me(), refresh token
│   ├── clientes.ts         # CRUD de clientes de la agencia
│   ├── calendarios.ts      # CRUD de calendarios editoriales
│   ├── publicaciones.ts    # CRUD de publicaciones + cambios de estado
│   ├── feedback.ts         # Comentarios/feedback sobre publicaciones
│   ├── stats.ts            # Estadisticas del dashboard de agencia
│   ├── branding.ts         # Branding publico de agencia por slug
│   ├── upload.ts           # Upload de archivos (imagen/video) a Cloudinary
│   ├── notificaciones.ts   # Notificaciones al cliente. notificarCliente(clienteId) → POST /notificaciones.php
│   └── admin.ts            # Servicios del panel Super Admin
│
├── components/             # Componentes reutilizables
│   ├── Sidebar.tsx         # Sidebar de navegacion (agencia)
│   ├── ClienteSidebar.tsx  # Sidebar de navegacion (cliente, props: isOpen/onClose)
│   ├── ReviewDetail.tsx    # Vista review/aprobacion. 3 cols fijas: MockupIPhone con portadaUrl (280px), info+copy+acciones (flex-1, oculta botones si aprobado/rechazado), chat WhatsApp-style (300px) con burbujas para comentarios y eventos de sistema centrados en italic para acciones (aprobar/modificar/rechazar)
│   ├── MobileHeader.tsx    # Header responsive para mobile
│   ├── ErrorBoundary.tsx   # Error boundary global
│   ├── MockupIPhone.tsx    # Preview de publicacion en mockup de iPhone
│   ├── PublicacionModal.tsx       # Modal de detalle de publicacion
│   ├── CrearPublicacionModal.tsx  # Modal para crear nueva publicacion
│   ├── CrearCalendarioModal.tsx   # Modal para crear calendario editorial
│   └── landing/            # Componentes de la landing page publica
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── WhiteLabel.tsx
│       ├── CTA.tsx
│       └── Footer.tsx
│
├── pages/                  # Paginas/vistas principales
│   ├── LandingPage.tsx     # Landing page publica
│   ├── LoginPage.tsx       # Login de agencia
│   ├── RegisterPage.tsx    # Registro de agencia
│   ├── Pricing.tsx         # Pagina de precios/planes
│   ├── Checkout.tsx        # Checkout de suscripcion
│   ├── VerifyEmailPage.tsx     # Verificacion de email
│   ├── ForgotPasswordPage.tsx  # Recuperar contrasenia
│   ├── ResetPasswordPage.tsx   # Reset de contrasenia
│   ├── Dashboard.tsx       # Dashboard agencia. Comentarios recientes navegan a /calendar/publicacion/:id
│   ├── ClientsPage.tsx     # Gestion de clientes
│   ├── CalendarView.tsx    # Vista de calendario editorial
│   ├── ContentCreation.tsx # Creacion de contenido (con IA)
│   ├── ApprovalsPage.tsx   # Aprobaciones agencia. Tab "Requieren Atencion" agrupa por cliente con boton "Notificar al cliente" (si hay posts en modificar). Cards: Ver detalle + Reenviar a revision + Eliminar. Sin chat inline
│   ├── PublicacionDetailPage.tsx # Detalle/edicion de publicacion. Boton "Enviar a revision" (visible si estado === modificar, cambia a pendiente y redirige a /approvals)
│   ├── SettingsPage.tsx    # Configuracion de agencia
│   ├── cliente/            # Paginas del portal cliente
│   │   ├── index.ts
│   │   ├── ClienteLoginPage.tsx    # Login del cliente
│   │   ├── ClienteDashboard.tsx    # Dashboard con grilla calendario + review
│   │   └── ClienteAprobaciones.tsx # Vista de aprobaciones del cliente
│   └── admin/              # Paginas del Super Admin
│       ├── index.ts
│       ├── AdminLoginPage.tsx   # Login super admin
│       ├── AdminDashboard.tsx   # Dashboard admin (metricas globales)
│       ├── AdminAgencias.tsx    # Gestion de agencias
│       └── AdminPagos.tsx       # Gestion de pagos
│
├── assets/
│   └── logo.webp           # Logo de SocialFlow
│
├── vite.config.ts          # Config de Vite (port 3000, proxy /api, alias @/, Gemini API key)
├── tailwind.config.js      # Config de Tailwind (colores custom, fonts)
├── postcss.config.js       # PostCSS con @tailwindcss/postcss
├── tsconfig.json           # TypeScript config (ES2022, bundler resolution, paths @/*)
├── package.json            # Dependencias y scripts (dev, build, preview)
├── .env                    # Variables de entorno (NO commitear)
├── .env.example            # Template de variables de entorno
└── .gitignore
```

---

## Tipos e Interfaces Principales

### Auth (`types.ts`)
- `UserType`: `'agencia' | 'cliente' | 'super_admin'`
- `UserRole`: `'admin' | 'editor' | 'viewer' | 'cliente' | 'super_admin'`
- `AuthUser`: Usuario autenticado con `id, email, nombre, user_type, rol, agencia_id, slug, plan, plan_limits, plan_usage, pendientes_aprobacion`
- `LoginCredentials`: `{ email, password, user_type? }`
- `PlanLimits`: `{ max_clientes, max_publicaciones_mes }`
- `PlanUsage`: `{ clientes, publicaciones_mes }`

### Clientes (`services/clientes.ts`)
- `ClienteAPI`: `{ id, nombre_cliente, email, empresa?, telefono?, notas?, activo, stats?, created_at, updated_at }`
- `CreateClienteData` / `UpdateClienteData`: Datos para crear/actualizar cliente
- `PaginationInfo`: `{ total, page, per_page, total_pages }`

### Calendarios (`services/calendarios.ts`)
- `CalendarioAPI`: `{ id, cliente_id, mes, anio, estado_general, fecha_envio?, cliente_nombre? }`
- `estado_general`: `'borrador' | 'enviado' | 'aprobado' | 'cerrado'`

### Publicaciones (`services/publicaciones.ts`)
- `PublicacionAPI`: `{ id, calendario_id, cliente_id?, nombre_cliente?, titulo?, red_social, tipo_contenido, fecha_programada, copy?, media_url?, media[], portada_url?, portada_public_id?, estado, version, orden }`
- `RedSocial`: `'instagram' | 'facebook' | 'tiktok'`
- `TipoContenido`: `'imagen' | 'carrusel' | 'story' | 'reel' | 'portada_reel'` (⚠️ pendiente deprecar — reemplazado por campo portada_url en reels)
- `EstadoPublicacion`: `'pendiente' | 'aprobado' | 'modificar' | 'rechazado'`

### Feedback (`services/feedback.ts`)
- `FeedbackAPI`: `{ id, publicacion_id, autor_id, tipo_autor, comentario, accion, estado_anterior, estado_nuevo, autor_nombre }`
- `accion`: `'comentario' | 'aprobar' | 'modificar' | 'rechazar'`

### Branding (`services/branding.ts`)
- `AgenciaBranding`: `{ id, nombre, slug, logo_url, colores: { primary, secondary, accent? } }`

### Admin (`services/admin.ts`)
- `AdminStats`: Metricas globales (agencias, ingresos, actividad)
- `Agencia`: `{ id, nombre_agencia, slug, email_contacto, plan, activa, max_clientes, fecha_vencimiento_plan, ... }`
- `Pago`: `{ id, agencia_id, monto, moneda, estado, fecha_pago, fecha_vencimiento, metodo_pago, ... }`

---

## Flujo de Autenticacion

### Tokens
- **JWT** almacenado en `localStorage` como `sf_token`
- **Refresh token** en `sf_refresh_token`
- **Expiracion** registrada en `sf_expires_in` (segundos, default 900) y `sf_token_saved_at` (timestamp)

### Flujo
1. **Login**: `POST /auth/login.php` con `{ email, password, user_type }` -> retorna `{ token, refresh_token, expires_in, user }`
2. **Verificacion al cargar**: Si existe `sf_token`, llama a `GET /auth/me.php` para obtener datos completos del usuario
3. **Refresh proactivo**: Antes de cada request, si el token expira en menos de 60s, se renueva via `POST /auth/refresh.php`
4. **Refresh reactivo**: Si un request retorna 401 con `token_expired`, se intenta refresh una vez y se reintenta el request
5. **Force logout**: Si el refresh falla o el token es invalido, se limpian todos los datos de `localStorage` y se redirige a `/#/login`

### Tipos de usuario y rutas protegidas
- **`agencia`**: Accede a `/dashboard`, `/clients`, `/calendar`, `/create`, `/approvals`, `/settings`
- **`cliente`**: Accede a `/cliente/dashboard` o `/portal/:slug/dashboard`
- **`super_admin`**: Accede a `/admin/dashboard`, `/admin/agencias`, `/admin/pagos`
- Cada tipo tiene su componente guard (`AgenciaRoute`, `ClienteRoute`, `AdminRoute`, `PortalRoute`) que redirige segun el `user_type`

### Portal White-Label
- Ruta: `/portal/:slug/login` y `/portal/:slug/dashboard`
- Carga branding dinamico (colores, logo) via `BrandingContext` usando el slug de la agencia
- El endpoint `/agencias.php?slug=xxx` es publico (no requiere auth)

---

## Decisiones de Arquitectura

### Frontend-only repo
Este repositorio contiene **solo el frontend**. El backend es una API REST en PHP desplegada en `socialflow.com.ar/api`. Los endpoints usan extension `.php` (ej: `/auth/login.php`, `/clientes.php`).

### HashRouter
Se usa `HashRouter` (no `BrowserRouter`) para compatibilidad con hosting estatico en cPanel sin necesidad de configurar rewrites del servidor.

### Lazy loading
Las paginas publicas y de agencia usan `React.lazy()` con `Suspense` para code splitting. Las paginas de cliente y admin se importan directamente (no lazy).

### API Service centralizado
`services/api.ts` expone una clase `ApiService` que:
- Agrega automaticamente `Authorization: Bearer <token>` a todos los requests
- Maneja refresh de tokens (proactivo y reactivo)
- Parsea respuestas JSON y normaliza errores
- Excluye endpoints de branding del manejo de 401

### Upload separado del ApiService
`services/upload.ts` usa `fetch` directo (no `api.request`) porque el ApiService fuerza `Content-Type: application/json`, incompatible con `multipart/form-data`.

### Multi-tenant via slug
Cada agencia tiene un `slug` unico. El portal del cliente se accede via `/portal/:slug/*` y carga dinamicamente los colores y logo de la agencia.

### Proxy de desarrollo
`vite.config.ts` configura un proxy para que en desarrollo las requests a `/api/*` se redirijan a `https://socialflow.com.ar`. Esto evita problemas de CORS y cookies cross-origin. La variable `VITE_API_URL=/api` (ruta relativa) se usa en desarrollo; en produccion el fallback en el codigo apunta a la URL absoluta.

### ReviewDetail compartido
`components/ReviewDetail.tsx` es el componente de review/aprobacion de publicaciones, usado por `ClienteDashboard`, `ClienteAprobaciones` y `PublicacionDetailPage`. Layout 3 columnas fijas: col 1 (280px) MockupIPhone con portadaUrl; col 2 (flex-1) info del post + copy + textarea + botones de accion (se ocultan si estado es aprobado/rechazado); col 3 (300px) chat estilo WhatsApp con historial real de feedback (agencia izquierda, cliente derecha) + input siempre activo para comentarios libres.

### ClienteSidebar responsive
`ClienteSidebar` acepta props `isOpen` y `onClose` para manejar el sidebar en mobile. En desktop (`md:`) siempre visible; en mobile se oculta con `translate-x` y se muestra con un boton hamburguesa en cada pagina cliente.

### IA con Gemini
El archivo `geminiService.ts` usa `@google/genai` para generar captions y sugerir hashtags. La API key se inyecta via Vite (`process.env.GEMINI_API_KEY`).

---

## Convenciones de Codigo

### Estructura general
- **Idioma del codigo**: Mezcla espaniol/ingles. Las interfaces y nombres de archivo estan en ingles, pero los comentarios, labels de UI y nombres de campos de la API estan en espaniol
- **Componentes**: Functional components con `React.FC` y tipado explicito de props
- **Estado**: `useState` + `useEffect` para estado local. Context API para estado global (auth, branding). No usa Redux ni Zustand
- **Services**: Objetos singleton con metodos async que retornan datos tipados. Pattern: `const service = { async method() { ... } }; export default service;`

### Estilos
- **Tailwind CSS 4** con tema custom definido en `index.css` via `@theme`
- **Colores del tema**: `primary (#136dec)`, `background-dark (#101822)`, `surface-dark (#1a222d)`, `border-dark (#282f39)`
- **Dark mode por defecto**: El `<html>` tiene `class="dark"` y toda la UI usa fondo oscuro
- **Clases inline**: Todo el styling es con utility classes de Tailwind directamente en JSX. No hay archivos CSS por componente

### Naming
- Archivos de paginas: PascalCase (`Dashboard.tsx`, `CalendarView.tsx`)
- Archivos de servicios: camelCase (`clientes.ts`, `publicaciones.ts`)
- Interfaces de API: sufijo `API` (`ClienteAPI`, `PublicacionAPI`, `CalendarioAPI`)
- Interfaces de creacion/actualizacion: prefijo `Create`/`Update` + sufijo `Data` (`CreateClienteData`)
- Contextos: sufijo `Context` (`AuthContext`, `BrandingContext`)

### Comentarios
- Headers de archivo con formato: `// ===== SOCIALFLOW - Nombre =====`
- JSDoc basico en metodos de servicios
- Comentarios inline en espaniol

### Patron de paginas
- Cada pagina maneja su propio estado con `useState`
- Fetch de datos en `useEffect` al montar
- Loading state con spinner
- Error state con boton de reintentar
- Existe `useClientes` como unico custom hook de data fetching. No usa librerias externas (`useSWR`, `useQuery`)

---

## Variables de Entorno

```
VITE_API_URL=/api                             # En desarrollo: ruta relativa (Vite proxy redirige a socialflow.com.ar)
                                              # En produccion: https://socialflow.com.ar/api (o se usa el fallback en codigo)
GEMINI_API_KEY=...                            # API key de Google Gemini (para IA)
```

---

## Scripts

```bash
npm run dev      # Inicia dev server en puerto 3000
npm run build    # Build de produccion (output en dist/)
npm run preview  # Preview del build de produccion
```

---

## Path Aliases

- `@/*` -> `./*` (raiz del proyecto, configurado en tsconfig.json y vite.config.ts)
