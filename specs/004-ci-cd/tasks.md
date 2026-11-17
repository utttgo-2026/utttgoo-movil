# Tasks 004 — CI/CD Pipeline

## Información General
- **Spec**: 004-ci-cd
- **Versión**: 1.0
- **Fecha**: 2025-11-06
- **Estado**: COMPLETADO (Fase 1)

---

## Tareas

### Fase 1: CI Pipeline
- [x] Crear `.github/workflows/ci.yml` con jobs: typecheck, lint, expo-doctor
- [x] Configurar triggers: PR/push a main y HRDCORE
- [x] Job TypeScript: `npx tsc --noEmit`
- [x] Job Lint: `npm run lint` (usa `expo lint`)
- [x] Job Expo Doctor: `npx expo-doctor`
- [x] Job Summary (Gate) que falle si cualquier check falla
- [x] Configurar cache npm en setup-node
- [x] Configurar Node.js 20 en setup-node

### Fase 2: Correcciones Previas (Pre-requisitos para CI/CD)
- [x] Corregir VirtualizedList anidado en BuyerHomeScreen (`src/app/buyer/index.tsx`)
- [x] Navegación back: `router.replace` → `router.push` en login/verify-email
- [x] Rutas relativas para imágenes (`../../assets/...`) en welcome.tsx, index.tsx
- [x] Navegación dinámica `/buyer/food/:id` + `useLocalSearchParams`
- [x] `nestedScrollEnabled` en Screen component
- [x] Scroll Home con FlatLists anidadas (scroll prop + nestedScrollEnabled)
- [x] Método de pago EFECTIVO en order-data, confirm-order
- [x] QR dinámico en order-created con react-native-qrcode-svg
- [x] Modelo Order: paymentMethod='cash', qrPayload
- [x] Mock orders actualizados con paymentMethod='cash' y qrPayload

### Fase 3: CI/CD Pipeline
- [x] Crear CI workflow (`.github/workflows/ci.yml`)
  - Job TypeScript: `npx tsc --noEmit`
  - Job Lint: `npm run lint` (usa `expo lint`)
  - Job Expo Doctor: `npx expo-doctor`
  - Job Summary (Gate)
  - Triggers: PR/push a main/HRDCORE
  - Cache npm en setup-node
  - Node.js 20 en setup-node
- [x] Crear build-android workflow (`.github/workflows/build-android.yml`)
  - Trigger: workflow_dispatch + push a HRDCORE (opcional)
  - Input: profile (preview/development)
  - Instalar EAS CLI
  - Build Android preview (comentado hasta vincular EAS)
  - Profile: preview
  - Platform: android
- [x] Configurar eas.json
  - Perfiles: development, preview, production
  - Preview: distribution internal, android buildType apk
  - Production: android buildType app-bundle
- [x] Actualizar package.json
  - Scripts: test, test:watch, test:ci
  - Jest config con preset jest-expo
  - Dependencias test: jest, jest-expo, react-test-renderer, @testing-library/react-native, @testing-library/jest-native
  - Jest config con preset jest-expo, transformIgnorePatterns, setupFilesAfterEnv
- [x] Instalar dependencias test: jest, jest-expo, react-test-renderer, @testing-library/react-native, @testing-library/jest-native, react-native-qrcode-svg, react-native-svg
- [x] Corregir versiones: jest 30.5.0, @types/jest 30.0.0, @testing-library/react-native 14.1.0
- [x] Instalar react-native-qrcode-svg + react-native-svg para QR
- [x] Correcciones lint/tsc en archivos modificados
- [x] Actualizar app.json: remover newArchEnabled, edgeToEdgeEnabled
- [x] Actualizar @react-native-async-storage/async-storage a 2.2.0

### Fase 4: Documentación SDD
- [x] Crear spec.md (`specs/004-ci-cd/spec.md`)
- [x] Crear plan.md (`plans/004-ci-cd-plan.md`)
- [x] Crear tasks.md (`tasks/004-ci-cd-tasks.md`) - ESTE ARCHIVO
- [x] Actualizar AGENTS.md con reglas CI/CD
- [x] Actualizar memoria.md con decisiones CI/CD
- [x] Actualizar README.md con sección CI/CD
- [x] Actualizar SDD_CHANGELOG.md con entrada de cambios
- [x] Actualizar AGENTS.md con reglas CI/CD
- [x] Actualizar memoria.md con decisiones CI/CD
- [x] Actualizar README.md con sección CI/CD
- [x] Actualizar SDD_CHANGELOG.md con entrada de cambios

### Fase 5: Validación y Cierre
- [x] `npx tsc --noEmit` → 0 errores
- [x] `npm run lint` → 0 errores, 78 warnings (solo warnings)
- [x] `npx expo-doctor` → 20/20 checks passed
- [x] Verificar CI workflow YAML syntax
- [x] Verificar build-android workflow YAML syntax
- [x] Verificar eas.json syntax

---

## Pendientes (Fase 2 - Futuro)

- [ ] Verificar categorías contra Figma UI-012 real
- [ ] Reemplazar placeholders Unsplash por recursos Figma (categorías/alimentos)
- [ ] Implementar tests automatizados (Jest + React Native Testing Library)
- [ ] Configurar Jest coverage thresholds
- [ ] Configurar EAS project linking (`eas build:configure`)
- [ ] Configurar EXPO_TOKEN en GitHub Secrets
- [ ] Ejecutar build preview real via `eas build --platform android --profile preview`
- [ ] Configurar Fase 2 CD: production build + eas submit
- [ ] Configurar credenciales Google Play / App Store
- [ ] Configurar notificaciones (Slack/Discord/Email) para CI/CD
- [ ] Configurar branch protection rules en GitHub

---

## Estado General
**COMPLETADO (Fase 1: CI + CD Preview)** — 2025-11-06