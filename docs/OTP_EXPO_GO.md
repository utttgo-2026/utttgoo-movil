# Verificación real de correo en Expo Go

## Contrato y alcance de la verificación

OpenAPI HTTPS respondió 200 y publica `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me` y `/api/v1/users/me`. No publica una ruta adicional de activación por OTP. El registro conserva los acuses 200/202 previamente admitidos; un acuse no acredita por sí solo la existencia de un perfil.

Según [el contrato de backend](https://github.com/utttgo-2026/utttgo-backend/blob/041ee969d85c973a18e0243fd128817ff83a5544/docs/auth-mobile-integration.md), AWS solicita `signUp` a Supabase y crea el perfil MongoDB `Buyer/PendingEmailVerification` ligado al `sub`. Supabase envía *Confirm sign up*. Expo verifica con `verifyOtp({email, token, type:'email'})` y reenvía con `resend({type:'signup', email})` usando la clave pública del proyecto; el SDK no conserva la sesión OTP. Un reenvío aceptado no prueba entrega SMTP. El cooldown local de 60 s y `Retry-After` no definen la caducidad del código.

En el código público de referencia `041ee96`, `LoginService` comprueba credenciales y confirmación en Supabase (`email_confirmed_at` o `confirmed_at`), verifica `sub`, correo, perfil local y JWT, y llama a `ActivatePendingAsync` si procede. Solo devuelve éxito si el perfil es `Active`. El móvil valida contrato, `/auth/me` y `/users/me` antes de guardar sesión y dar acceso. No hay auto-login ni activación local. El SHA de referencia no identifica por sí solo la revisión instalada en EC2.

Backend reporta Confirm email y SMTP Gmail operativos, con límites bajos, y documenta la plantilla con `{{ .Token }}` de seis dígitos sin `{{ .ConfirmationURL }}` (líneas 39–47). Falta cotejar con el equipo **Authentication → Providers → Email → Email OTP length** del proyecto efectivo, además del TTL y las cuotas. No se inspeccionó el Dashboard ni se disparó correo en esta intervención.

## Prueba física autorizada

1. Usa un correo institucional nuevo autorizado y acuerda con backend cómo localizar el intento en sus registros. No compartas contraseña, OTP, JWT ni credenciales SMTP.
2. La comprobación local actual devolvió **Beta desactivada** y clave con formato publishable, sin inspeccionar el bundle del teléfono. Antes, Beta desviaba el registro a Login. Con este cambio, **ambos modos abren Verificar correo** y no hace falta cambiar la bandera. Detén el Metro de este proyecto si ya está abierto y vuelve a iniciarlo:

   ```powershell
   npx expo start --go -c
   ```

   Abre el QR nuevo. Desde Bienvenida, **Crear cuenta** usa el mismo formulario que **Crear cuenta** desde Login. No recargues el proceso entre registro y verificación: el correo se conserva solo en memoria. No hace falta cambiar la clave si backend confirma que la existente corresponde al proyecto.
3. Registra la cuenta una vez. Debe abrirse **Verificar correo**. Si el resultado es incierto, revisa la bandeja de entrada y consulta a soporte antes de repetir. El coordinador bloquea otro intento para ese correo tras una respuesta incierta mientras siga viva la instancia; reiniciar la app no confirma que el alta falló.
4. Backend comprueba identidad y MongoDB pendiente ligado al mismo `sub`. Si quieres comprobar el bloqueo previo, intenta iniciar sesión sin confirmar: AWS debe rechazarlo, sin acceso privado. Desde Login puedes volver a la verificación si el correo coincide con el contexto reciente. El rechazo genérico no distingue contraseña incorrecta de correo todavía pendiente.
5. Comprueba recepción real y seis dígitos, incluido spam. Pega el código en las casillas, pulsa **Verificar correo** y comprueba **¡Correo verificado!** sin que se inicie sesión. Para probar reenvío, hazlo antes de confirmar, espera que se habilite **Reenviar código** y comprueba recepción del mensaje más reciente. No repitas solicitudes ante un resultado incierto.
6. Pulsa **Iniciar sesión**. Comprueba que Atrás no vuelve al OTP completado; si sales antes de verificar, puedes reabrir Login, escribir el correo del registro reciente y pulsar **Volver a verificar correo**, mientras dure el contexto en memoria. Escribe la contraseña y envía el login explícitamente. Backend debe confirmar que el perfil local pasó a `Active`; comprueba que se carga el perfil real, el acceso privado y la restauración al reiniciar.
7. Si el correo no llega, backend revisa Auth/SMTP y la plantilla. Si el OTP verifica pero login falla, debe correlacionar el proyecto, `sub` y correo confirmado con el perfil MongoDB, evaluar la transición a `Active` y verificar `/auth/me` y `/users/me`. Comparte únicamente hora, etapa y diagnóstico sanitizado.
