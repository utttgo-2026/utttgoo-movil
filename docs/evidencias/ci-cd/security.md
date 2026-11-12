# Estado DevSecOps

- CodeQL: configurado en `.github/workflows/security.yml`; requiere ejecución en GitHub Actions.
- Dependency Review: configurado para bloquear severidad high o superior en Pull Requests.
- Gitleaks: configurado con `.gitleaks.toml`.
- Dependabot: configurado semanalmente para npm y GitHub Actions desde el directorio raíz, con agrupación de Actions.
- npm audit: no reportó vulnerabilidades high/critical en la validación local; reportó 27 vulnerabilidades moderate y 1 low transitivas asociadas a Expo/Jest. Se documentan sin `npm audit fix --force` porque propondría cambios mayores de Expo.
- CI: acciones externas fijadas a SHA completos, permisos mínimos, `persist-credentials: false`, concurrencia y timeouts por job.
- SDD: el gate valida estructura, rutas y encabezados de la fase `004-ci-cd`; no depende de una cadena inexistente.
- Preview: existe un único workflow manual en `.github/workflows/build-android.yml`; `build-preview.yml` fue eliminado por duplicidad.

Estado de release: los hallazgos high/critical bloquearían el gate. Los hallazgos medium/low permanecen documentados para remediación compatible con Expo SDK 58.
