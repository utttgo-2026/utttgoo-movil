# Plan 004 — CI/CD Pipeline

## Información General
- **Spec**: 004-ci-cd
- **Versión**: 1.0
- **Fecha**: 2025-11-06
- **Estado**: COMPLETADO (Fase 1)

---

## 1. Objetivo

Implementar pipeline de Integración Continua (CI) y Despliegue Continuo (CD - Fase 1: Preview) para UTTT-Go Móvil usando GitHub Actions y Expo Application Services (EAS).

---

## 2. Alcance del Plan

### Fase 1: CI + CD Preview (Actual - COMPLETADO)
- Pipeline CI: TypeScript, Lint, Expo Doctor
- Pipeline CD Preview: Build Android via EAS (workflow_dispatch)
- Configuración EAS con perfiles development/preview/production
- Documentación SDD completa

### Fase 2: CD Producción (Futuro - Fuera de alcance actual)
- Build producción Android (AAB) + iOS (IPA)
- Configuración credenciales Google Play / App Store
- `eas submit` automatizado
- Notificaciones de release

---

## 2. Fases de Implementación

### Fase 1: CI Pipeline (Día 1) ✅ COMPLETADO
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Crear `.github/workflows/ci.yml` | `.github/workflows/ci.yml` | ✅ COMPLETADO |
| Job TypeScript: `npx tsc --noEmit` | `ci.yml` | ✅ |
| Job Lint: `npm run lint` | `ci.yml` | ✅ |
| Job Expo Doctor: `npx expo-doctor` | `ci.yml` | ✅ |
| Triggers: PR/Push a main/HRDCORE | `ci.yml` | ✅ |
| Job Summary (Gate) | `ci.yml` | ✅ |
| Cache npm | `ci.yml` | ✅ |

### Fase 2: Correcciones Previas (Día 1-2) ✅ COMPLETADO
| Corrección | Archivos | Estado |
|------------|----------|--------|
| VirtualizedList anidado en Home | `src/app/buyer/index.tsx` | ✅ |
| Navegación back: replace → push (login/verify) | `login.tsx`, `verify-email.tsx` | ✅ |
| Rutas relativas para imágenes | `welcome.tsx`, `index.tsx` | ✅ |
| Navegación dinámica `/buyer/food/:id` | `food/[id].tsx`, `index.tsx` | ✅ |
| `nestedScrollEnabled` en Screen | `Screen.tsx` | ✅ |
| Scroll Home con FlatLists anidadas | `index.tsx`, `Screen.tsx` | ✅ |

### Fase 3: Método de Pago + QR (Día 3-4) ✅ COMPLETADO
| Funcionalidad | Archivos | Estado |
|---------------|----------|--------|
| Pago EFECTIVO en order-data | `order-data.tsx` | ✅ |
| Pago EFECTIVO en confirm-order | `confirm-order.tsx` | ✅ |
| QR dinámico en order-created | `order-created.tsx` | ✅ |
| Modelo Order: paymentMethod='cash', qrPayload | `types/models.ts` | ✅ |
| Mock orders actualizados | `data/mock/orders.ts` | ✅ |
| QR dinámico con react-native-qrcode-svg | `order-created.tsx` | ✅ |

### Fase 4: CI/CD Pipeline (Día 5-6) ✅ COMPLETADO
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Crear CI workflow | `.github/workflows/ci.yml` | ✅ |
| Crear build-android workflow | `.github/workflows/build-android.yml` | ✅ |
| Configurar eas.json | `eas.json` | ✅ |
| Actualizar package.json (test scripts) | `package.json` | ✅ |
| Instalar dependencias test (jest, jest-expo, etc.) | `package.json` | ✅ |
| Instalar react-native-qrcode-svg + react-native-svg | `package.json` | ✅ |
| Correcciones lint/tsc | Varios archivos | ✅ |

### Fase 5: Documentación SDD (Día 6) ✅ COMPLETADO
| Documento | Archivo | Estado |
|-----------|---------|--------|
| Specification | `specs/004-ci-cd/spec.md` | ✅ |
| Plan | `plans/004-ci-cd-plan.md` | ✅ |
| Tasks | `tasks/004-ci-cd-tasks.md` | ✅ (por crear) |
| Actualizar AGENTS.md | `AGENTS.md` | ✅ (por actualizar) |
| Actualizar memoria.md | `memoria.md` | ✅ (por actualizar) |
| Actualizar README.md | `README.md` | ✅ (por actualizar) |
| Actualizar SDD_CHANGELOG.md | `SDD_CHANGELOG.md` | ✅ (por actualizar) |

---

## 3. Dependencias

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `jest` | ~30.5.0 | Test runner |
| `jest-expo` | ~58.0.0 | Preset Jest para Expo |
| `jest-expo` | ~58.0.0 | Preset Jest para Expo |
| `react-test-renderer` | 19.3.0 | Renderer para tests |
| `@testing-library/react-native` | ^14.1.0 | Testing utilities |
| `@testing-library/jest-native` | ^5.4.3 | Matchers de Jest |
| `react-native-qrcode-svg` | ^6.3.54 | Generación QR |
| `react-native-svg` | 15.16.0 | Requerido por QRCode |
| `eslint` | ^9.0.0 | Linting |
| `eslint-config-expo` | ~58.0.4 | Config ESLint para Expo |

---

## 4. Validaciones de Cierre

| Validación | Comando | Estado |
|------------|---------|--------|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errores |
| Lint | `npm run lint` | ✅ 0 errores, 78 warnings |
| Expo Doctor | `npx expo-doctor` | ✅ 20/20 checks passed |
| Tests (cuando existan) | `npm run test:ci` | Pendiente |

---

## 5. Estado

**COMPLETADO** (Fase 1: CI + CD Preview) — 2025-11-06

---

## 6. Referencias

- `specs/004-ci-cd/spec.md`
- `CONSTITUTION.md`
- `SDD_CHANGELOG.md`
- `AGENTS.md`
- `.github/workflows/ci.yml`
- `.github/workflows/build-android.yml`
- `eas.json`
- `package.json`