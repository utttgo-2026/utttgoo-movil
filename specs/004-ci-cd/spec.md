# Specification 004 — CI/CD Pipeline

## Información General
- **ID**: 004-ci-cd
- **Nombre**: Pipeline de Integración y Despliegue Continuo
- **Versión**: 1.0
- **Fecha**: 2025-11-06
- **Estado**: COMPLETADO (Fase 1)

---

## 1. Objetivo

Establecer un pipeline de Integración Continua (CI) y Despliegue Continuo (CD) para UTTT-Go Móvil que garantice la calidad del código, detecte errores temprano y permita generar builds de prueba para Android mediante Expo Application Services (EAS).

---

## 2. Alcance

### Incluido (Fase 1 - Actual)
- **CI Pipeline**: TypeScript type check, Lint (expo lint), Expo Doctor
- **CD Pipeline (Fase 1)**: Build Android preview via EAS (workflow_dispatch)
- **Configuración EAS**: eas.json con perfiles development, preview, production
- **Documentación SDD**: Spec, Plan, Tasks para CI/CD

### No Incluido (Fase 2 - Futuro)
- Publicación automática en Google Play Store
- Publicación automática en Apple App Store
- Configuración de credenciales de tiendas (Google Play Service Account, App Store Connect)
- Notificaciones automáticas (Slack, Discord, Email)
- Builds de iOS
- Tests automatizados (pendiente configuración Jest)

---

## 3. Requisitos Funcionales

### CI (Integración Continua)
| ID | Requisito | Estado |
|----|-----------|--------|
| REQ-CI-001 | TypeScript type check (`npx tsc --noEmit`) | COMPLETADO |
| REQ-CI-002 | Lint (`npm run lint` / `expo lint`) | COMPLETADO |
| REQ-CI-003 | Expo Doctor (`npx expo-doctor`) | COMPLETADO |
| REQ-CI-004 | Triggers: PR a main/HRDCORE, push a main/HRDCORE | COMPLETADO |
| REQ-CI-005 | Tests automatizados | PENDIENTE (pendiente configuración Jest) |

### CD (Despliegue Continuo - Fase 1)
| ID | Requisito | Estado |
|----|-----------|--------|
| REQ-CD-001 | Build Android preview via EAS (`eas build --platform android --profile preview`) | COMPLETADO (workflow creado) |
| REQ-CD-002 | Trigger: `workflow_dispatch` + opcional push a HRDCORE | COMPLETADO |
| REQ-CD-003 | Profile `preview` para builds de prueba | CONFIGURADO en eas.json |
| REQ-CD-002 | Build de producción / publicación en tiendas | PENDIENTE (Fase 2) |

---

## 4. Arquitectura del Pipeline

### CI Pipeline (`.github/workflows/ci.yml`)
```
┌─────────────────────────────────────┐
│         Pull Request / Push         │
└──────────────┬──────────────────────┘
               ▼
    ┌─────────────────────────┐
    │   Setup Node.js 20      │
    │   Cache: npm            │
    └───────────┬─────────────┘
                ▼
    ┌─────────────────────────┐
    │      npm ci             │
    └───────────┬─────────────┘
                ▼
    ┌──────────┬──────────┬──────────┐
    ▼          ▼          ▼
TypeScript   Lint       Expo Doctor
(typescript) (expo lint) (expo-doctor)
                │
                ▼
         ┌─────────────┐
         │  Summary    │
         │  (Gate)     │
         └─────────────┘
```

### CD Pipeline (`.github/workflows/build-android.yml`)
```
┌─────────────────────────────────────┐
│   workflow_dispatch / push HRDCORE  │
└──────────────┬──────────────────────┘
               ▼
    ┌─────────────────────────┐
    │   Setup Node.js 20      │
    │   Cache: npm            │
    └───────────┬─────────────┘
                ▼
    ┌─────────────────────────┐
    │      npm ci             │
    └───────────┬─────────────┘
                ▼
    ┌─────────────────────────┐
    │   npx tsc --noEmit      │
    └───────────┬─────────────┘
                ▼
    ┌─────────────────────────┐
    │   Install EAS CLI       │
    └───────────┬─────────────┘
                ▼
    ┌─────────────────────────┐
    │  eas build --platform   │
    │     android --profile   │
    │     preview --non-inter │
    │     active              │
    └───────────┬─────────────┘
                ▼
         ┌─────────────┐
         │  Artifact   │
         │  (eas.json, │
         │   app.json) │
         └─────────────┘
```

---

## 5. Configuraciones Clave

### eas.json
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { 
      "distribution": "internal",
      "android": { "buildType": "apk", "gradleCommand": ":app:assembleRelease" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### package.json - Scripts CI/CD
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "expo lint",
    "test": "jest",
    "test:ci": "jest --ci --coverage",
    "doctor": "expo-doctor"
  }
}
```

### Jest Configuration
```json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!(react-native|@expo|@react-native|expo)/)"
    ],
    "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"],
    "testMatch": ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
  }
}
```

---

## 5. Triggers de GitHub Actions

| Workflow | Triggers |
|----------|----------|
| `ci.yml` | `pull_request` a `main`/`HRDCORE`, `push` a `main`/`HRDCORE` |
| `build-android.yml` | `workflow_dispatch`, `push` a `HRDCORE` (opcional) |

---

## 7. Secrets Requeridos (GitHub Secrets)

| Secret | Descripción | Estado |
|--------|-------------|--------|
| `EXPO_TOKEN` | Token de autenticación Expo/EAS | **PENDIENTE** (requerido para CD) |

---

## 8. Estado

**COMPLETADO** (Fase 1: CI + CD Preview) — 2025-11-06

---

## 8. Referencias

- `CONSTITUTION.md` (principios CI/CD)
- `AGENTS.md` (reglas operativas)
- `SDD_CHANGELOG.md` (historial de cambios)
- `.github/workflows/ci.yml`
- `.github/workflows/build-android.yml`
- `eas.json`
- `package.json`