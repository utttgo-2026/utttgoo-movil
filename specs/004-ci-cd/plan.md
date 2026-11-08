# Plan 004 - CI/CD, DevSecOps y Release Mobile

## Trazabilidad

Spec: `specs/004-ci-cd/spec.md`  
Tasks: `specs/004-ci-cd/tasks.md`

## Fases

1. **Base y SDD:** actualizar contrato, Node, scripts y documentación.
2. **Calidad:** pruebas deterministas, coverage y gates CI.
3. **Contrato API:** configuración por entorno, `ApiError` y cliente aislado; no conectar pantallas mock.
4. **DevSecOps:** CodeQL, Dependency Review, npm audit, Dependabot y Gitleaks.
5. **EAS/CD:** Preview manual, Release manual con environment `production` y AAB.
6. **Evidencia:** branch protection, bloqueos y matriz de resultados.

## Decisiones

- Node único: `22.13.1`.
- `EXPO_PUBLIC_API_BASE_URL` es configuración pública, no secreto.
- No se almacena JWT en AsyncStorage ni se implementa login Backend en esta fase.
- El HTTP informado para development no se fija en código; Production exige HTTPS.
- `extra.eas.projectId` no se inventa: permanece pendiente de vinculación real.
- Google Play se carga manualmente hasta contar con autorización, service account y prueba previa.

## Validación

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run doctor` y validación YAML/EAS. Los builds EAS y smoke tests externos quedan sujetos a credenciales e infraestructura.
