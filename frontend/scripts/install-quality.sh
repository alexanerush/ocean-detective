#!/usr/bin/env bash
set -euo pipefail
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @playwright/test @axe-core/playwright eslint @eslint/js typescript-eslint globals eslint-plugin-react-hooks prettier @lhci/cli
npm pkg set 'scripts.test=vitest run' 'scripts.test:coverage=vitest run --coverage' 'scripts.lint=eslint src tests e2e' 'scripts.format=prettier --write src tests e2e' 'scripts.format:check=prettier --check src tests e2e' 'scripts.test:e2e=playwright test' 'scripts.bundle:report=node scripts/bundle-report.mjs' 'scripts.lighthouse=lhci autorun'
npx playwright install chromium
