# GiftApp — HANDOFF Document

> Documento de transferencia para retomar el proyecto en una nueva sesión.
> Última actualización: 20 de junio de 2026.

---

## 1. Descripción del Proyecto

**GiftApp** es una plataforma web para la gestión de campañas de regalos corporativos. Permite a empresas crear campañas, importar empleados y beneficiarios desde Excel, y que los empleados seleccionen regalos para sus beneficiarios a través de un flujo público.

### Arquitectura
- **Backend:** NestJS + Prisma ORM + PostgreSQL (Supabase)
- **Frontend:** React 19 + Vite 8 + React Router 7
- **Base de datos:** Supabase PostgreSQL (us-east-1)
- **Autenticación:** JWT (admin) + JWT público (empleados)

---

## 2. Estructura del Proyecto

```
mimo-regalostestv4/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Schema completo (12 modelos)
│   │   ├── seed.ts                # Seed de datos iniciales
│   │   └── migrations/            # Migraciones Prisma
│   ├── src/
│   │   ├── admin-users/           # CRUD usuarios admin
│   │   ├── auth/                  # Login admin, JWT strategy
│   │   ├── beneficiaries/         # CRUD beneficiarios
│   │   ├── campaigns/             # CRUD campañas + público por slug [MODIFICADO] Fix slug duplicado
│   │   ├── common/
│   │   │   ├── config/env.ts      # Validación de variables de entorno
│   │   │   ├── decorators/roles.decorator.ts
│   │   │   ├── filters/http-exception.filter.ts
│   │   │   ├── guards/roles.guard.ts
│   │   │   ├── interceptors/timing.interceptor.ts  # [NUEVO] Medición de rendimiento
│   │   │   └── utils/campaign-window.ts
│   │   ├── companies/             # CRUD empresas (contiene generateSlug estático)
│   │   ├── dashboard/
│   │   │   ├── dashboard.cache.ts         # [NUEVO] Cache en memoria 30s
│   │   │   └── dashboard.service.ts       # [MODIFICADO] Con cache
│   │   ├── employees/             # CRUD empleados
│   │   ├── gifts/                 # CRUD regalos + imágenes
│   │   ├── imports/
│   │   │   ── imports.service.ts # [MODIFICADO] Importación por batches
│   │   ├── prisma/prisma.service.ts
│   │   ├── public-auth/           # Login público de empleados
│   │   ├── public-selection/      # Selección de regalos pública
│   │   ├── reports/               # Exportación Excel de selecciones
│   │   ├── selections/            # CRUD selecciones
│   │   ├── support-requests/      # CRUD solicitudes de soporte
│   │   ├── app.module.ts
│   │   └── main.ts                # [MODIFICADO] Con timing interceptor condicional
│   ├── test-timing.sh             # [NUEVO] Script de medición de rendimiento
│   ├── .env                       # Configuración local (us-east-1)
│   ├── .env.example
│   ├── .env.us-west-2-backup      # Backup del .env anterior (Oregon)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js               # Cliente HTTP con token
│   │   │   ├── backendApiService.js       # Llamadas al backend
│   │   │   ├── giftAppService.js          # [MODIFICADO] Con cache frontend
│   │   │   └── localStorageService.js     # Modo demo/localStorage
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── GiftDetailModal.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProgressStepper.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── BeneficiariesAdmin.jsx
│   │   │   │   ├── Campaigns.jsx              # [MODIFICADO] Fix preview slug duplicado
│   │   │   │   ├── Employees.jsx          # [MODIFICADO] UX importación mejorada
│   │   │   │   ├── Gifts.jsx
│   │   │   │   ├── Selections.jsx
│   │   │   │   └── SupportRequests.jsx
│   │   │   ├── public/
│   │   │   │   ├── AlreadyConfirmed.jsx
│   │   │   │   ├── BeneficiarySelection.jsx  # [MODIFICADO] Requests paralelos
│   │   │   │   ├── CampaignWelcome.jsx
│   │   │   │   ├── EmployeeLogin.jsx
│   │   │   │   ├── Summary.jsx
│   │   │   │   ├── SupportRequest.jsx
│   │   │   │   └── ThankYou.jsx
│   │   │   └── NotFound.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx              # [MODIFICADO] Code splitting con React.lazy
│   │   ├── styles/
│   │   │   └── global.css                 # ~1121 líneas, estilos globales
│   │   ├── utils/
│   │   │   ├── dates.js
│   │   │   ├── normalizers.js
│   │   │   ├── simpleCache.js             # [NUEVO] Cache frontend con TTL
│   │   │   ── validators.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── vite.config.js
│   └── package.json
├── tigo_import_500_empleados.xlsx              # Archivo de prueba (500 empleados) — original
├── tigo_import_500_empleados_nuevos_datos.xlsx # Archivo de prueba (500 empleados) — nuevos datos
└── Informe_Auditoria_mimo-regalos.docx
```

---

## 3. Configuración de Entorno

### Backend (.env)
```
DATABASE_URL="postgresql://postgres.uqxvrmcxumqnllaobrlh:muKcag-6rokho-bomkom@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&connect_timeout=30&pool_timeout=30"
DIRECT_URL="postgresql://postgres.uqxvrmcxumqnllaobrlh:muKcag-6rokho-bomkom@aws-1-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=30"
JWT_SECRET="DKHUe7QRpy8MUhWZjQZgPnB8fe8apB30g6VOdt76L14tFfL7xCBede7a7iB9ymiL"
JWT_EXPIRES_IN="8h"
PUBLIC_JWT_SECRET="RzMhDXACmfDXssMRdh-o4UrnuUi_duZa6AY_UzFz-ocRGrFDpNemZBDMLbn2Eka5"
PUBLIC_JWT_EXPIRES_IN="4h"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENABLE_TIMING_LOGS=false
ADMIN_SEED_EMAIL="admin@giftapp.com"
ADMIN_SEED_PASSWORD="Admin123!"
```

### Frontend (.env)
```
VITE_ENABLE_DEMO_DATA=false
VITE_API_URL=http://localhost:3001/api
VITE_USE_BACKEND=true
```

### Credenciales de prueba
- **Admin:** admin@giftapp.com / Admin123!
- **Roles:** SUPER_ADMIN, ADMIN, COMPANY_VIEWER

---

## 4. Comandos de Desarrollo

### Backend
```bash
cd backend
npm install                    # Instalar dependencias
npx prisma generate            # Generar cliente Prisma
npx prisma migrate deploy      # Aplicar migraciones
npm run start:dev              # Desarrollo con hot-reload
npm run build                  # Build de producción
npm run start:prod             # Producción
ENABLE_TIMING_LOGS=true npm run start:dev  # Con logs de timing
```

### Frontend
```bash
cd frontend
npm install                    # Instalar dependencias
npm run dev                    # Desarrollo (http://localhost:5173)
npm run build                  # Build de producción
npm run preview                # Preview del build
```

### Script de medición de rendimiento
```bash
cd backend
./test-timing.sh               # Mide tiempos de endpoints admin
```

---

## 5. Optimizaciones de Rendimiento Implementadas

### 5.1 Backend — Timing Interceptor (Phase 1)
- **Archivo:** `backend/src/common/interceptors/timing.interceptor.ts`
- **Registro en:** `backend/src/main.ts` (condicional con `ENABLE_TIMING_LOGS`)
- **Log format:** `[HTTP] METHOD /url - statusCode - durationMs`
- **No registra:** bodies, datos sensibles

### 5.2 Backend — Dashboard Cache (Phase 2)
- **Archivo:** `backend/src/dashboard/dashboard.cache.ts`
- **TTL:** 30 segundos
- **Cache key:** `${role}_${companyId}` (ej: `SUPER_ADMIN_all`, `COMPANY_VIEWER_123`)
- **Impacto:** Dashboard pasa de ~900ms a ~12ms en cache hit
- **21 queries** consolidadas en cache, no se modificó lógica de negocio

### 5.3 Frontend — Public Flow Parallelization (Phase 3)
- **Archivo:** `frontend/src/pages/public/BeneficiarySelection.jsx`
- **Cambio:** `giftAppGetPublicEmployeeSession()` y `giftAppGetPublicCampaignBySlug(slug)` ahora se ejecutan en paralelo con `Promise.all`
- **Ahorro:** 1 round-trip de red (~50-200ms)

### 5.4 Frontend — Route Code Splitting (Phase 4)
- **Archivo:** `frontend/src/routes/AppRoutes.jsx`
- **Estrategia:** `React.lazy()` + `Suspense` para todas las rutas admin y flujo público de selección
- **Eager load:** CampaignWelcome, EmployeeLogin, NotFound (páginas ligeras)
- **Resultado:** Bundle principal de 360KB → 269KB (-25.5%)

### 5.5 Frontend — Simple Cache (Phase 5)
- **Archivo:** `frontend/src/utils/simpleCache.js`
- **Funciones:** `getCache(key)`, `setCache(key, data, ttl)`, `clearCache(key)`
- **Endpoints cacheados:**
  - `giftAppGetPublicCampaignBySlug(slug)` → key: `campaign_${slug}`, TTL: 60s
  - `giftAppGetCompanies()` → key: `companies`, TTL: 60s
  - `giftAppGetGifts(campaignId)` → key: `gifts_campaign_${campaignId}`, TTL: 30s

### 5.6 Backend — Import Batch Processing (Phase 6)
- **Archivo:** `backend/src/imports/imports.service.ts`
- **Problema:** Transacción única de 120s fallaba con 500 empleados en Supabase
- **Solución:** Batches de 10 grupos de empleados, cada uno en su propia transacción
- **Timeout por batch:** 120,000ms
- **Resultado:** 500 empleados importados exitosamente en 50 batches

### 5.7 Campaign Slug — Fix Duplicación de Prefijo de Empresa (Phase 7)
- **Archivos:** `backend/src/campaigns/campaigns.service.ts` y `frontend/src/pages/admin/Campaigns.jsx`
- **Problema:** Al crear campaña con nombre `emp-2026` para empresa con slug `emp`, se generaba `emp-emp-2026`
- **Causa:** La lógica siempre concatenaba `{company.slug}-{campaignName}` sin verificar si el nombre ya contenía el prefijo
- **Solución:** Si `campaignSlugPart` ya empieza con `{company.slug}-`, se usa tal cual; si no, se prepende
- **Impacto:** Flujo de importación Excel ahora funciona correctamente porque el slug coincide exactamente

---

## 6. Schema de Base de Datos (Resumen)

### Modelos principales
| Modelo | Descripción |
|--------|-------------|
| Company | Empresas clientes |
| Role | Roles: SUPER_ADMIN, ADMIN, COMPANY_VIEWER |
| AdminUser | Usuarios del panel admin |
| Campaign | Campañas de regalos (con soft-delete) |
| Employee | Empleados importados (con soft-delete) |
| Beneficiary | Beneficiarios de empleados (con soft-delete) |
| Gift | Regalos disponibles (con imágenes, soft-delete) |
| GiftImage | Imágenes de regalos |
| Selection | Selección confirmada de un empleado |
| SelectionItem | Item individual (beneficiario + regalo) |
| SupportRequest | Solicitudes de soporte |
| SupportRequestHistory | Historial de cambios de soporte |
| StockMovement | Auditoría de movimientos de stock |
| EmailLog | Logs de emails (simulados por ahora) |

### Relaciones clave
- Company → Campaigns (1:N)
- Campaign → Employees, Gifts, Selections, SupportRequests (1:N)
- Employee → Beneficiaries (1:N)
- Selection → SelectionItems (1:N)
- Gift → GiftImages, StockMovements (1:N)

### Índices importantes
- `Campaign.slug` (unique)
- `Employee.campaignId_documentId` (unique compound)
- `Gift.campaignId_reference` (unique compound)
- `Selection.campaignId_employeeId` (unique compound)
- `SelectionItem.selectionId_beneficiaryId` (unique compound)

---

## 7. Flujos de la Aplicación

### Flujo Admin
1. Login con email/password → JWT token
2. Dashboard con estadísticas (cache 30s)
3. CRUD de campañas, empleados, beneficiarios, regalos
4. Importación masiva desde Excel (batch processing)
5. Gestión de selecciones y soporte
6. Exportación Excel de selecciones confirmadas

### Flujo Público (Empleado)
1. Acceso por URL: `/campaign/:slug`
2. Login con documentId → JWT público
3. Selección de regalos para cada beneficiario
4. Confirmación de selección (decrementa stock atómicamente)
5. Página de agradecimiento

### Roles y Permisos
- **SUPER_ADMIN:** Acceso total, sin company scoping
- **ADMIN:** Acceso total, sin company scoping
- **COMPANY_VIEWER:** Solo ve datos de su companyId

---

## 8. Archivos Modificados en Esta Sesión

### Sesión 17-18 de junio — Optimizaciones de rendimiento (Fases 1-6)
| Archivo | Cambio |
|---------|--------|
| `backend/src/common/interceptors/timing.interceptor.ts` | Creado - interceptor de timing |
| `backend/src/main.ts` | Registro condicional del timing interceptor |
| `backend/src/dashboard/dashboard.cache.ts` | Creado - cache en memoria |
| `backend/src/dashboard/dashboard.service.ts` | Integración de cache |
| `backend/src/imports/imports.service.ts` | Batch processing para importación |
| `backend/.env` | Agregado `ENABLE_TIMING_LOGS=false` |
| `backend/.env.example` | Agregado `ENABLE_TIMING_LOGS=false` |
| `backend/test-timing.sh` | Creado - script de medición |
| `frontend/src/utils/simpleCache.js` | Creado - cache frontend |
| `frontend/src/api/giftAppService.js` | Integración de cache en 3 endpoints |
| `frontend/src/pages/public/BeneficiarySelection.jsx` | Parallelización de requests |
| `frontend/src/routes/AppRoutes.jsx` | Code splitting con React.lazy |
| `frontend/src/pages/admin/Employees.jsx` | UX de importación mejorada |

### Sesión 20 de junio — Migración a us-east-1 + Fix slug duplicado (Fase 7-8)
| Archivo | Cambio |
|---------|--------|
| `backend/.env` | Migrado DATABASE_URL y DIRECT_URL a Supabase us-east-1 |
| `backend/.env.us-west-2-backup` | Creado - backup del .env anterior (Oregon) |
| `backend/src/campaigns/campaigns.service.ts` | Fix generación automática de slug (evita duplicar prefijo de empresa) |
| `frontend/src/pages/admin/Campaigns.jsx` | Fix preview de slug en formulario de nueva campaña |
| `HANDOFF.md` | Actualizado con todos los cambios recientes |

---

## 9. Estado Actual de Git

```
Branch: main
Last commit: 3b63e1e "version terminada lista para desplegar"

Changes not staged:
  - backend/src/campaigns/campaigns.service.ts            (fix slug duplicado)
  - backend/src/imports/imports.service.ts                (batch processing)
  - backend/src/prisma/prisma.service.ts                  (sin cambios funcionales)
  - backend/src/public-selection/public-selection.service.ts (sin cambios funcionales)
  - frontend/src/pages/admin/Campaigns.jsx                (fix preview slug)
  - frontend/src/pages/admin/Employees.jsx                (UX importación)

Deleted (not staged):
  - Informe_Auditoria_mimo-regalos.docx
  - empleados-test.xlsx
  - ~$empleados-test.xlsx

Untracked files:
  - HANDOFF.md
  - backend/.env.us-west-2-backup
  - backend/src/common/interceptors/timing.interceptor.ts
  - backend/src/dashboard/dashboard.cache.ts
  - backend/test-timing.sh
  - backend/uploads/campaign-logos/1781982821926-m3r40d.png
  - frontend/src/utils/simpleCache.js
  - tigo_import_500_empleados.xlsx
  - tigo_import_500_empleados_nuevos_datos.xlsx
```

**IMPORTANTE:** Todos los cambios de las sesiones 17-20 de junio NO han sido commiteados. Se deben commitear antes de desplegar a producción.

---

## 10. Problemas Conocidos y Deuda Técnica

### Alto impacto
1. **Pool de conexiones = 10:** El dashboard dispara 21 queries paralelas. Con cache esto se mitiga, pero bajo carga concurrente puede saturarse.
2. **Sin paginación en endpoints de lista:** Todos los `findMany()` devuelven TODOS los registros. A medida que crezca la data, será un problema.
3. **JWT strategy hace DB lookup en cada request:** Cada llamada autenticada al admin hace 1 query extra. Podría cachearse con TTL corto.

### Medio impacto
4. **Sin caching en otros endpoints:** Solo el dashboard tiene cache. Campaigns se re-fetch en 6 de 8 páginas admin.
5. **Sin React.memo/useMemo/useCallback:** Todos los componentes re-renderizan completamente.
6. **No hay virtualización de tablas:** Todas las filas se renderizan en el DOM.

### Bajo impacto
7. **CSS global único:** 14KB de CSS se carga en todas las páginas.
8. **Duplicación de `publicRequest` en backendApiService.js:** ~40 líneas duplicadas de `request()`.

---

## 11. Próximos Pasos Sugeridos (Priorizados)

### Inmediato
1. **Commitear todos los cambios** de las sesiones 17-20 de junio
2. **Actualizar variables de entorno en Render** con las nuevas DATABASE_URL y DIRECT_URL de us-east-1
3. **Redeploy backend en Render** y verificar conectividad
4. **Verificar que el frontend no tiene errores de consola**

### Corto plazo
5. **Agregar paginación** a endpoints de lista (employees, beneficiaries, gifts, selections)
6. **Cache de campañas en frontend** (se fetch en 6 páginas admin)
7. **Aumentar connection_limit a 15** si se observa saturación del pool (propuesta conservadora)

### Mediano plazo
8. **Consolidar queries del dashboard** con `groupBy` (21 queries → ~8 queries)
9. **Agregar React.memo** a componentes de tabla y listas
10. **Implementar AbortController** para cancelar requests al desmontar componentes

### Largo plazo
11. **Migrar a TanStack Query** para caching y deduplicación de requests
12. **Virtualización de tablas** con react-window para datasets grandes
13. **Email real** (actualmente solo SIMULATED en EmailLog)

---

## 12. Notas de Despliegue

### Backend
- Build: `npm run build` → genera `dist/`
- Producción: `npm run start:prod` → `node dist/main`
- Variables de entorno requeridas: DATABASE_URL, DIRECT_URL, JWT_SECRET, PUBLIC_JWT_SECRET
- Puerto: 3001 (configurable con PORT)
- Serve estático de uploads en `/uploads`

### Frontend
- Build: `npm run build` → genera `dist/`
- El build produce ~25 chunks por code splitting
- Variable VITE_API_URL debe apuntar al backend en producción
- No hay servidor estático incluido; usar Nginx, Vercel, etc.

### Base de datos
- Supabase PostgreSQL en us-east-1 (proyecto: `uqxvrmcxumqnllaobrlh`)
- Pooler transaccional en puerto 6543 (runtime)
- Pooler de sesión en puerto 5432 (migraciones)
- 1 migración existente aplicada (`20260611015500_init_postgres`)
- Backup del .env anterior (us-west-2) en `backend/.env.us-west-2-backup`

---

## 13. Reglas de Oro del Proyecto

Estas reglas se establecieron durante las optimizaciones y deben respetarse:

1. **NO modificar lógica de stock** — El decremento de stock en la confirmación de selección es atómico y crítico.
2. **NO modificar la transacción de confirmación de selección** — Garantiza consistencia entre selección, stock y email log.
3. **NO modificar el flujo público de autenticación** — Los empleados acceden con documentId + JWT público.
4. **NO modificar company scoping** — COMPANY_VIEWER solo ve datos de su empresa.
5. **NO modificar roles/permisos** — SUPER_ADMIN, ADMIN, COMPANY_VIEWER.
6. **NO modificar el schema de Prisma** sin migración explícita.
7. **NO agregar paquetes** sin aprobación explícita.
8. **NO cambiar connection_limit** sin evidencia de saturación del pool.

---

## 14. Archivos de Prueba

| Archivo | Descripción |
|---------|-------------|
| `tigo_import_500_empleados.xlsx` | 500 empleados para prueba de importación masiva (original) |
| `tigo_import_500_empleados_nuevos_datos.xlsx` | 500 empleados — nuevos datos, usa campaignSlug `tigo-2026` |

### Formato esperado del Excel de importación
Columnas: `campaignSlug`, `employeeDocumentId`, `employeeFullName`, `employeeEmail`, `employeePhone`, `shippingAddress`, `shippingCity`, `beneficiaryFullName`, `beneficiaryAge`, `beneficiaryGender`

---

## 15. Contacto y Contexto Adicional

- **Proyecto original:** mimo-regalostestv7/mimo-regalostestv4
- **Versión anterior de referencia:** mimo-regalostestv4 (dentro del mismo directorio)
- **Informe de auditoría:** `Informe_Auditoria_mimo-regalos.docx`
- **Fecha de última sesión:** 20 de junio de 2026
- **Sesiones previas:** 6 fases de optimización de rendimiento completadas + migración a us-east-1 + fix slug duplicado
- **Supabase us-east-1:** Proyecto `uqxvrmcxumqnllaobrlh` en Virginia del Norte
- **Empresas creadas:** Default Company, Nutresa, Coca-Cola, Tigo, EMP
- **Campañas activas:** `tigo-2026` (Tigo), `emp-2026` (EMP)
