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

## Fase 7 - EAS Preview Environment Gate

1. Mantener las tres variables públicas requeridas en el ambiente EAS `preview`, usando únicamente la publishable key de Supabase para cliente móvil.
2. Mantener `.env.example` con placeholders vacíos; los valores reales no se versionan.
3. Validar nombres de variables EAS en el workflow antes de `eas build`, sin imprimir valores, JSON completo ni artifacts.
4. Fallar cerrado cuando falte `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL` o `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Mantener Production separado; no generar AAB ni ejecutar `eas submit` en esta fase.

## Fase 8 - EAS Production AAB Gate

1. Declarar `environment: production` en el perfil EAS Production y conservar `autoIncrement`, versionado remoto y `android.buildType: app-bundle`.
2. Validar antes de `eas build` la presencia por nombre de las tres variables públicas Production, sin imprimir valores ni crear artifacts sensibles.
3. Ejecutar gates de typecheck, lint, tests, coverage, Expo Doctor, export Android, npm audit y whitespace antes del build.
4. Ejecutar Production únicamente con CI y Security verdes, usando `--profile production` y sin `eas submit`.
5. Entregar el AAB para carga manual en Google Play Closed Testing.

## Validación

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run doctor` y validación YAML/EAS. Los builds EAS y smoke tests externos quedan sujetos a credenciales e infraestructura.
