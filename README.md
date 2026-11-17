# UTTT-Go Móvil — V1.2

Cliente Android de UTTT-Go para compra/venta de alimentos en la comunidad universitaria. React Native + **Expo SDK 58**, TypeScript estricto y Expo Router. Las pruebas de desarrollo se hacen con **Expo Go**.

## Clonar y trabajar desde casa

**Guía completa para el compañero: [docs/COLABORACION.md](docs/COLABORACION.md).** Incluye configuración, conexión del teléfono, solución de errores y colaboración por Git.

Requisitos: Git, **Node.js 24 LTS** con npm, conexión a Internet y Expo Go Android compatible con SDK 58. El repositorio es público para clonar; subir cambios requiere permiso de escritura del equipo.

```powershell
git clone --branch V1.2 --single-branch https://github.com/utttgo-2026/utttgoo-movil.git
cd utttgoo-movil
npm ci
Copy-Item -LiteralPath ".env.example" -Destination ".env"
```

Antes de iniciar, abre `.env` y completa **`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** con la clave **publishable pública del proyecto del equipo**. La plantilla ya incluye los orígenes HTTPS de AWS y Supabase y el catálogo AWS. Solicita la clave pública al responsable; no uses `service_role`, claves secretas, credenciales SMTP ni JWT de usuarios.

Después:

```powershell
npx expo-doctor
npx expo start -c
```

Computadora y teléfono deben estar en la misma red Wi-Fi local. Escanea el QR de Metro con Expo Go. Cada compañero ejecuta su propio Metro y consume el backend HTTPS compartido desde su casa.

Para macOS/Linux, la copia de plantilla es `cp .env.example .env`. Con nvm compatible, `.nvmrc` permite seleccionar Node 24. Más detalles y modo túnel en la guía.

## Configuración

| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Origen HTTPS de AWS, sin `/api/v1` al final |
| `EXPO_PUBLIC_SUPABASE_URL` | Proyecto Supabase asociado al backend |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de cliente para confirmación de correo; completar localmente |
| `EXPO_PUBLIC_CATALOG_SOURCE` | `aws` para integración real; mock solo si se pide explícitamente en desarrollo |
| `EXPO_PUBLIC_BETA_REGISTRATION_ONLY` | `false` por defecto; `true` solo para reproducir el flujo interno registro→login acordado por el equipo |

El flag beta no verifica una cuenta ni concede permisos: AWS sigue exigiendo una cuenta institucional válida y autorización. Tras cambiar variables o actualizar el coordinador de sesión, reinicia Metro y haz **Reload completo** en Expo Go.

`.env` y sus variantes locales están ignoradas. Los valores `EXPO_PUBLIC_*` se incorporan al cliente y deben ser públicos; nunca colocar contraseñas, claves de servidor o secretos de firma allí.

## Estado funcional actual

- Autenticación AWS, confirmación de correo Supabase y JWT en SecureStore. No hay login demo ni autenticación por registros legacy de AsyncStorage.
- Catálogo y categorías AWS, búsqueda, detalle y paginación con `total`; fotografías no disponibles muestran placeholder local.
- Alta inmediata de vendedor con consulta posterior de estado y revalidación Buyer/Seller. Crear, consultar y modificar precio/stock; pausar y reactivar productos propios.
- Pedido de un solo producto con cantidad/notas, efectivo visual y recibo del identificador/total confirmado por AWS.
- Navegación y microinteracciones con Reduce Motion, rutas privadas y protección de sesiones.
- **Pendientes:** historial/detalle de pedidos por integrar, dashboard/tabs completos de vendedor, acciones de seguimiento, notificaciones remotas, QR seguro y fotografías/S3. La tarjeta QR actual está explícitamente bloqueada, no es una credencial.
- `created_desc` se bloquea por incompatibilidad observada del despliegue. Usar el orden predeterminado AWS.

Las etapas 003/005/006/007 continúan **EN PRUEBAS**. La confirmación física del hotfix `runSeller` no acredita todos los recorridos ni el arranque en una computadora nueva.

## Verificación local

```powershell
npx tsc --noEmit
npm run lint
npm run test:ci
npx expo-doctor
git diff --check
```

Último checkpoint funcional: **640 pruebas / 40 suites**, TypeScript sin errores, lint sin errores con 27 advertencias existentes y Expo Doctor 20/20. El resultado del entorno del compañero debe comprobarse allí.

## Organización

```text
src/app/                 Pantallas Expo Router (auth, buyer y seller)
src/components/          UI, catálogo, vendedor y navegación
src/context/             AuthContext y CartContext
src/services/            API HTTPS, sesión, SecureStore y Supabase
src/theme/               Diseño global
src/types/               DTOs y modelos compartidos
src/assets/images/       Recursos gráficos usados por la app
specs/, plans/, tasks/   SDD existente por etapa
docs/                    Guías de colaboración
```

Los recursos de ejecución y `package-lock.json` están en Git. Los PNG originales de Figma usados por el equipo están en una carpeta externa `../UTTT-Go/`; se solicitan al equipo para trabajo visual y no son necesarios para arrancar la app con sus assets versionados.

## Documentación y pruebas físicas

- [AGENTS.md](AGENTS.md) y [CONSTITUTION.md](CONSTITUTION.md): reglas del proyecto.
- [Matriz Figma actual](specs/006-figma-ui-navigation-fixes/figma-matrix.md).
- [Prueba de animaciones](specs/006-figma-ui-navigation-fixes/motion-expo-go.md).
- [Prueba vendedor/productos y hotfix runSeller](specs/007-seller-products/backend-handoff.md).
- [Memoria](memoria.md) y [changelog SDD](SDD_CHANGELOG.md).

## GitHub Actions y APK

CI ejecuta TypeScript, lint, Jest y Expo Doctor en push a `main`/`HRDCORE` o PR contra esas ramas. Un push a `V1.2` por sí solo no dispara ese workflow.

Expo Go es el recorrido de desarrollo listo para usar. El workflow `Build Android Preview` de esta rama todavía contiene un placeholder, no ejecuta la construcción del APK. La preparación manual de un APK interno con EAS requiere cuenta/autorización Expo, proyecto vinculado y variables de entorno del equipo; ver la sección EAS de la guía. No se publican builds de producción ni tiendas automáticamente.
