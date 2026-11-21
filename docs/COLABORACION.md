# Trabajar en UTTT-Go V1.2 desde casa

Esta guía permite clonar el cliente móvil, instalar las versiones del lock y abrirlo en Expo Go. Cada computadora ejecuta Metro y se conecta al backend AWS HTTPS compartido. Tu teléfono utiliza el Metro de tu propia computadora.

## 1. Preparar el equipo

- **Node.js 24 LTS** y npm. Verifica `node --version` y `npm --version`.
- Git: verifica `git --version`.
- Expo Go para Android compatible con **Expo SDK 58**. Si Expo Go informa otro SDK, instala una versión Android compatible desde la fuente oficial de Expo: <https://expo.dev/go>.
- Internet, computadora y teléfono en la misma red Wi-Fi local.

En macOS/Linux con nvm, después de clonar usa `nvm install` y `nvm use`; `.nvmrc` indica 24. En Windows instala Node 24 LTS o selecciónalo con el administrador de Node que utilices. No se requiere instalar el antiguo `expo-cli` global: los comandos usan `npx expo` del proyecto.

El repositorio es público: se puede clonar sin invitación. Para subir cambios, el propietario debe conceder acceso de escritura a tu cuenta de GitHub. Cada integrante usa su propia cuenta GitHub/Expo y sus propias credenciales institucionales en la app.

## 2. Clonar la rama correcta

En PowerShell o una terminal:

```powershell
git clone --branch V1.2 --single-branch https://github.com/utttgo-2026/utttgoo-movil.git
cd utttgoo-movil
git branch --show-current
npm ci
```

La rama debe ser `V1.2`. La raíz correcta contiene `package.json`, `package-lock.json`, `app.json` y `src/`: no hay que entrar a otra carpeta `MovilGo` después de clonar este repositorio.

Usa `npm ci` para reproducir el lock. No copies `node_modules` desde otra computadora ni cambies versiones para resolver un problema de configuración.

## 3. Crear el entorno local una sola vez

PowerShell, en una clonación nueva donde todavía no existe `.env`:

```powershell
Copy-Item -LiteralPath ".env.example" -Destination ".env"
```

macOS/Linux:

```sh
cp .env.example .env
```

Abre `.env` en tu editor. La plantilla ya trae las URLs públicas del entorno compartido y estas opciones:

| Campo | Qué hacer |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Conservar el origen HTTPS proporcionado por el equipo; no agregar `/api/v1` ni usar localhost |
| `EXPO_PUBLIC_SUPABASE_URL` | Conservar el proyecto Supabase asociado al mismo backend |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pedir al responsable la clave **publishable pública** de ese proyecto y completarla localmente |
| `EXPO_PUBLIC_CATALOG_SOURCE` | Mantener `aws` para probar datos reales |
| `EXPO_PUBLIC_BETA_REGISTRATION_ONLY` | Mantener `false` para el flujo de confirmación; usar `true` localmente si el equipo está reproduciendo su prueba interna registro→login en Expo Go |

La clave pública se obtiene del responsable o, con acceso autorizado al proyecto Supabase, de su configuración de API keys. El cliente actual espera el formato `sb_publishable_...`; no utilizar una clave `service_role`, `sb_secret_`, una contraseña ni un JWT de usuario. La clave pública no reemplaza permisos de una cuenta y debe pertenecer al mismo proyecto que usa AWS.

La plantilla deja la clave vacía deliberadamente. Con ella vacía, el catálogo AWS puede consultarse, pero el cliente no tiene la configuración completa para verificar/reenviar códigos de Supabase. Completarla es un requisito del recorrido de confirmación de correo, no un error que se solucione deshabilitando validaciones.

Las variables `EXPO_PUBLIC_*` son visibles en la aplicación compilada. Los secretos del servidor, SMTP, bases de datos, firma JWT y `EXPO_TOKEN` no van en esos campos ni en Git. `.env*` se ignora salvo `.env.example`. No copies el SecureStore ni los datos de sesión de otro teléfono.

El flag beta `true` solo cambia el recorrido interno permitido del cliente. AWS sigue exigiendo cuenta institucional verificada, estado válido y roles autorizados; no crea una sesión ni verifica un correo por sí mismo. Para producción debe ser `false`.

## 4. Comprobar y arrancar

```powershell
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo start -c
```

Acepta el acceso de Node a la red privada si el firewall de Windows lo solicita. Desde Expo Go Android escanea el QR que muestra Metro. La computadora debe continuar ejecutando Metro mientras pruebas.

La API, MongoDB, Redis y Supabase están fuera de este repositorio. Para trabajar sobre el cliente se utiliza su despliegue compartido HTTPS; su disponibilidad depende del equipo backend. No hay que instalar ni simular esas bases de datos para abrir este cliente.

### Si la conexión LAN no llega al teléfono

Detén Metro con Ctrl+C y prueba el transporte de Expo por túnel:

```powershell
npx expo start --tunnel -c
```

Expo puede solicitar instalar su ayudante `@expo/ngrok` en el entorno de desarrollo. Se necesita Internet y la conexión depende del servicio de túnel. No cambies la URL de AWS a la URL del túnel: el túnel transporta Metro, no es el backend de autenticación.

## 5. Recorrido inicial y actualización de código

1. Bienvenida → Seguir explorando: comprobar catálogo/categorías AWS o su error/estado vacío real.
2. Iniciar sesión con una **cuenta institucional propia verificada**. No existen usuarios demo válidos de autenticación. Correo, contraseña y permisos se comprueban en backend.
3. Perfil → Quiero vender: GET de negocio automático; ausencia exacta de perfil muestra formulario, negocio Active con permisos permite Mis productos.
4. Si se prueban altas/productos/pedidos reales, coordinar la cuenta y los datos con el equipo. La clonación no necesita crear datos nuevos para funcionar.
5. Seguir el [manual vendedor/productos](../specs/007-seller-products/backend-handoff.md) y el [manual de movimiento](../specs/006-figma-ui-navigation-fixes/motion-expo-go.md).

Para actualizar una clonación que no tenga trabajo local pendiente:

```powershell
git pull --ff-only origin V1.2
npm ci
npx expo start -c
```

Revisa `git status` antes de actualizar. Conserva tus cambios en tu rama de trabajo antes de traer actualizaciones; no uses un reset forzado para resolver diferencias. Tu `.env` local se mantiene: vuelve a copiar el ejemplo solo en una instalación nueva.

Cuando se modifique `.env` o el coordinador de sesión, detén/reinicia Metro y haz **Reload completo** en Expo Go. Fast Refresh puede conservar una instancia vieja de `AuthSession`. El hotfix `runSeller` detecta contratos incompatibles y pide recarga; no se arregla borrando tokens o desactivando seguridad.

## 6. Qué está listo y qué sigue pendiente

| Capacidad | Estado en V1.2 |
|---|---|
| Catálogo/categorías/detalle reales | Integrados; dependen de disponibilidad AWS |
| Alta vendedor y permisos | Integrados; consultar perfil y validar Buyer/Seller |
| Crear/editar precio/stock/pausar/reactivar producto propio | Integrados; requieren autorización real |
| Pedido único con notas y recibo | Integrado; el backend calcula el total |
| Efectivo | Presentación conforme al contrato; no hay cobro electrónico |
| QR | Marco visual bloqueado; sin credencial ni validación backend |
| Historial/detalle de pedidos, dashboard y tabs completos Seller | Pendientes de integrar, no presentarlos como terminados |
| Avisos remotos | Contrato pendiente; no se muestran fixtures como eventos reales |
| Fotos/S3 | Pendiente; placeholder local |
| Orden Más recientes | Deshabilitado por incompatibilidad `created_desc` observada en AWS |

## 7. Solución de problemas

| Síntoma | Comprobación |
|---|---|
| `package.json` no encontrado | Ejecutar desde la raíz `utttgoo-movil` clonada |
| Versiones/engines incompatibles | Seleccionar Node 24 LTS y repetir `npm ci`; no actualizar todas las dependencias |
| Expo Go pide otro SDK | Comprobar compatibilidad SDK 58 y versión oficial de Expo Go Android |
| QR de Metro no abre | Misma Wi-Fi, firewall privado de Node y reinicio; después probar túnel |
| Error de URL/API | Revisar origen HTTPS de `.env`, sin `/api/v1`; reiniciar Metro. Abrir `/health` del origen compartido desde el navegador del teléfono para comprobar conectividad |
| Falta configuración Supabase | Completar URL y publishable pública del mismo proyecto, recargar completamente |
| 401/403 | Cuenta/rol/perfil deben ser válidos en AWS. No se resuelve inventando un token, rol local o usuario demo |
| No llega correo | Confirmar dirección institucional y configuración/entrega SMTP con backend; no crear códigos locales |
| Vendedor indica módulo desactualizado | Cerrar y volver a abrir el proyecto con Metro `-c`; Reload completo, no solo Fast Refresh |
| No aparecen fotos, historial o QR utilizable | Revisar la tabla de alcance; esas funciones todavía tienen pendientes documentados |

## 8. Ayudar con cambios y pruebas

Con permiso de escritura, crea una rama propia desde `V1.2`:

```powershell
git switch -c ayuda-v1.2
```

Lee `AGENTS.md`, la spec/plan/tasks de la etapa que modifiques y las capturas Figma correspondientes. Los assets de ejecución están versionados; los originales de diseño `../UTTT-Go/` se solicitan al equipo para trabajo visual. No necesitas generar imágenes para arrancar el proyecto.

Antes de entregar cambios:

```powershell
npx tsc --noEmit
npm run lint
npm run test:ci
npx expo-doctor
git diff --check
git status --short
```

Prueba físicamente en Expo Go antes del commit, según `AGENTS.md`. Incluye solo fuente/recursos/documentación pertinentes y comprueba que no se agreguen `.env`, credenciales, `.expo`, `coverage` ni `node_modules`. Reporta dispositivo/Android/Expo Go, secuencia y resultado; no envíes JWT, contraseñas o headers de autenticación.

## 9. APK interno con EAS: preparación adicional

Para colaborar como estamos desarrollando, el recorrido anterior de Expo Go es suficiente. Un APK independiente requiere cuenta Expo autorizada, proyecto EAS del equipo vinculado y las variables públicas configuradas en el entorno EAS utilizado. Actualmente `app.json` no incorpora un `extra.eas.projectId` y el workflow `Build Android Preview` solo muestra información: su comando real de build está comentado.

El responsable debe confirmar/vincular el proyecto correcto y los accesos antes de generar APKs. Después puede comprobarlo y solicitar un build interno manual:

```powershell
npx eas-cli@latest login
npx eas-cli@latest project:info
npx eas-cli@latest build --platform android --profile preview
```

Completa las mismas variables públicas en EAS; no dependas de que `.env` ignorado se envíe por Git. Para el perfil beta interno existente usa `beta-registration` únicamente si el equipo autoriza ese recorrido. No configures un token Expo como variable `EXPO_PUBLIC_*`.

Esta guía no ejecuta builds, no activa el workflow placeholder, no publica en tiendas y no garantiza un APK ya generado. CI actual corre en `main`/`HRDCORE` o PR hacia esas ramas; subir únicamente `V1.2` no lo dispara automáticamente.

## 10. Comprobación de clonación realizada

Se hizo una clonación nueva de la rama remota `V1.2` (base `b6a8890`) en una carpeta temporal independiente del workspace. Se ejecutó `npm ci` desde el lock sin cambiar `package.json`, `package-lock.json` ni `app.json`; TypeScript terminó sin errores, Jest pasó **640/640 pruebas en 40 suites** y Expo Doctor **20/20**.

Después se comprobó el bundle Android de Metro con una copia de los valores públicos de la plantilla: **HTTP 200**, con los módulos comerciales y de animaciones presentes. No se copió el `.env` privado ni se rellenó una clave Supabase; eso no valida OTP ni permisos reales del equipo nuevo. Metro se detuvo al terminar y no se crearon datos en AWS.

La prueba aislada se ejecutó con el Node local 25.4.0 y npm 11.7.0, que emitieron advertencias de engines. **Para el compañero se recomienda Node 24 LTS**, alineado con CI y admitido por las dependencias; no se afirma haber probado físicamente su computadora o teléfono. Los archivos de esta entrega son documentación/configuración de desarrollo, sin cambios en el código de la app.
