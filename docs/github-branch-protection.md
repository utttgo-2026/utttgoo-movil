# Protección de `main`

Configurar en GitHub `Settings > Branches > Branch protection rules`:

- Bloquear push directo a `main`.
- Requerir Pull Request.
- Requerir al menos 1 aprobación.
- Requerir que la rama esté actualizada antes de fusionar.
- Requerir estos checks: `Quality Gate`, `Expo Doctor`, `SDD Traceability Gate`, `CodeQL JavaScript and TypeScript`, `npm Audit` y `Gitleaks`.
- Bloquear el merge si falla un check obligatorio.
- Requerir aprobación del environment `production` para releases.

La configuración requiere permisos de administrador del repositorio y no se ejecuta automáticamente desde este proyecto.
