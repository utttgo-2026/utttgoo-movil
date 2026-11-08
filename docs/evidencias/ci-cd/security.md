# Estado DevSecOps

- CodeQL: configurado en `.github/workflows/security.yml`; requiere ejecución en GitHub Actions.
- Dependency Review: configurado para bloquear severidad high o superior en Pull Requests.
- Gitleaks: configurado con `.gitleaks.toml`.
- Dependabot: configurado semanalmente para npm y mensualmente para GitHub Actions.
- npm audit: no reportó vulnerabilidades high/critical en la validación local; reportó vulnerabilidades transitivas low/moderate asociadas a Expo/Jest. Se documentan sin `npm audit fix --force` porque propondría cambios mayores de Expo.

Estado de release: los hallazgos high/critical bloquearían el gate. Los hallazgos medium/low permanecen documentados para remediación compatible con Expo SDK 58.
