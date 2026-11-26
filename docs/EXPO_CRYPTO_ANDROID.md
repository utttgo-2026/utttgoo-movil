# ExpoCrypto: recuperación de inicio en Android

## Resultado de esta incidencia

El usuario reportó `Cannot find native module 'ExpoCrypto'` al evaluar
authSession → AuthContext → layout, seguido de un error de ErrorBoundary.
Confirmó Expo Go **58.0.6 o posterior**, sin aportar el número exacto.
Después de forzar detención de Expo Go y arrancar únicamente este proyecto con
`npx expo start --go -c`, respondió **«Ya inicia correctamente»** a la comprobación
de desaparición de ambos errores. Es evidencia de recuperación física comunicada
por el usuario; no se equipara a una ejecución física observada por el agente.

La causa inmediata fue que el runtime anterior no resolvía el proveedor nativo
ExpoCrypto durante una importación estática. No faltaba el paquete JavaScript.
No se determinó el desencadenante interno de esa pérdida temporal del registro:
el arranque en frío por sí solo no identifica qué caché/lifecycle concreto falló.

El error adicional es compatible con una cascada: el layout importa AuthContext,
este importa AuthSession y este importa Crypto; si falla esa evaluación, el módulo
de la ruta no termina de cargarse y su ErrorBoundary tampoco queda disponible
normalmente. Ambos errores desaparecieron juntos según el usuario. No se afirma
una reproducción aislada del segundo error ni se cambió el error boundary.

## Versiones comprobadas, antes y después

| Paquete npm | Instalado antes | Al terminar |
|---|---|---|
| expo / SDK | 58.0.26 / 58 | 58.0.26 / 58 |
| expo-crypto | 58.0.8 | 58.0.8 |
| expo-modules-core | 58.1.0 | 58.1.0 |
| expo-router | 58.0.32 | 58.0.32 |
| react-native | 0.88.1 | 0.88.1 |

package.json, lock y árbol instalado coinciden; `npm ls` no encontró duplicados
de estos paquetes. `expo/bundledNativeModules.json` y la documentación SDK58
recomiendan crypto~58.0.8 y core~58.1.0. `npx expo install --check` confirmó
Dependencies are up to date y Expo Doctor20/20. No se aplicó una instalación o
downgrade sin incompatibilidad demostrada, ni se editó node_modules.

## Incidencias upstream: no confundir escenarios

- [Crypto SDK58](https://docs.expo.dev/versions/v58.0.0/sdk/crypto/): incluido
  en Expo Go Android; randomUUID utiliza aleatoriedad criptográfica nativa.
- [Expo #54020](https://github.com/expo/expo/issues/54020): Expo Go58.0.5 Android
  perdía módulos como ExpoCrypto al abrir un segundo proyecto en el mismo proceso.
  Un mantenedor confirma arreglo en **Expo Go58.0.6**; en su comentario del24nov
  la versión de Play Store seguía en revisión. No atribuir este ticket al teléfono
  del usuario, que ya reporta58.0.6+.
- [Expo #51198](https://github.com/expo/expo/issues/51198): reporte de
  expo-crypto58.0.5 / core58.0.14, builds Android release/prebuild y descubrimiento
  de módulos API2.0; cerrado por falta de repro válido. No es evidencia para bajar
  crypto58.0.8 a58.0.4 en Expo Go, cuyo binario no se reconstruye con npm.
- Las notas SDK58 describen Modules API2.0 y cambios de compilación/R8. No se
  añadieron reglas ProGuard, overrides de core ni parches de autolinking al proyecto
  Expo Go por extrapolar incidencias de otros tipos de build.

## Cómo abrir de nuevo sin perder la sesión

1. Cerrar únicamente el Metro de este proyecto con Ctrl+C.
2. Android → Ajustes → Aplicaciones → Expo Go → **Forzar detención**.
   No borrar datos/almacenamiento ni ejecutar `pm clear`; esta recuperación no
   necesita borrar JWT, contraseñas, usuarios legacy ni reinstalar la app.
3. En la raíz MovilGo ejecutar:

   ```powershell
   npx expo start --go -c
   ```

4. Abrir el QR **nuevo** y solo este proyecto. Recargar JS desde una instancia
   dañada no siempre equivale a iniciar otro proceso nativo.
5. Si la versión del cliente no es compatible con SDK58, seleccionar SDK58 →
   Android device en [la página oficial](https://expo.dev/go?sdkVersion=58&platform=android&device=true)
   y usar la versión compatible corregida que esté disponible por el canal oficial.
   Registrar el número exacto instalado; no confundir la versión de npm expo con
   la versión del binario Expo Go. No descargar APK de terceros.

### Solo si realmente se usa una development build

Si el binario es una build propia construida antes de agregar expo-crypto, instalar
el paquete npm no incorpora código Kotlin al APK existente: debe reconstruirse e
instalarse esa build. Con el entorno nativo configurado, `npx expo run:android`
recompila la app; también puede utilizarse el flujo de development build autorizado
por el mantenedor. No hace falta reconstruir UTTT-Go para añadir Crypto a Expo Go:
el proveedor viene en su propio binario compatible. No se ejecutó prebuild/EAS ni
se cambió de modalidad para resolver esta incidencia.

## Comprobar Crypto físicamente sin crear pedidos

El inicio demuestra que la importación ya no falla, pero aún debe comprobarse la
ejecución de métodos nativos. Desde la consola de **React Native DevTools** del
proyecto abierto, esta sonda SDK58 prueba el mismo proveedor JSI que usa expo-crypto.
Solo devuelve booleanos; no consulta sesión, no imprime UUID ni toca pedidos:

```js
await (async () => {
  const native = globalThis.expo?.modules?.ExpoCrypto;
  if (!native) return { nativeAvailable: false };
  const a = native.randomUUID();
  const b = native.randomUUID();
  const uuidV4 = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(a) && a !== b;
  const digest = await native.digestStringAsync('SHA-256', 'abc', { encoding: 'hex' });
  return {
    nativeAvailable: true,
    uuidV4,
    sha256: digest === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  };
})();
```

Resultado esperado: los tres valores true. Si devuelve false o arroja error,
registrar solo el resultado sanitizado y versión exacta del cliente; no usar otro
generador ni devolver éxito ficticio. Esta sonda no es un fallback de la app.

Después comprobar:
- AuthContext termina restauración; iniciar sesión si corresponde, sin borrar la
  sesión solo para probar.
- Abrir Mis pedidos y Pedidos recibidos con la cuenta autorizada.
- Abrir el detalle y marco QR; el escáner debe cargar y pedir cámara solo al pulsar.
- No pedir credenciales QR ni confirmar entregas sobre pedidos reales automáticamente.

## Seguridad y pruebas

Verificación local final: `npx tsc --noEmit` limpio, `npm run test:ci`
**871/871 en64suites**, lint0errores/21advertencias existentes, Doctor20/20 y
`git diff --check` sin errores. Bundle AndroidHTTP200/13,296,432bytes con el perfil
Hermes/ReactCompiler del manifiesto; solo se detuvo el Metro propio de verificación,
no el servidor que abrió el usuario. La prueba de bundle no ejecuta Crypto Kotlin.

AuthSession conserva su importación estática, Crypto.randomUUID(), validación UUIDv4,
SHA256 y bloqueos de duplicados/resultado incierto. AuthContext y SecureStore no
se modificaron para eludir la ausencia nativa. No hay lazy import, módulo opcional
ni Math.random/Date.now como fuente de UUID. Un build sin Crypto sigue fallando
visiblemente, en lugar de aparentar seguridad.

cryptoBootstrap.test.ts prueba el límite nativo simulado y el API JS real del paquete:
ausencia nativa impide evaluar el layout; proveedor presente permite cargar sesión,
provider y export ErrorBoundary; UUIDv4/SHA256 delegan sin Math.random. El mock nativo
no acredita el dispositivo. Los checks de bundle tampoco ejecutan módulos Kotlin.
Login/listados/QR y la sonda UUID/SHA física permanecen pendientes de confirmación
específica; el usuario sí confirmó recuperación del inicio y desaparición conjunta
de los errores. Sin pedidos reales automáticos, commit ni push.
