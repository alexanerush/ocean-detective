import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
export default tseslint.config({ignores:['dist/**','coverage/**','playwright-report/**','test-results/**','reports/**','src/legacy-main.ts','src/counter.ts']},js.configs.recommended,...tseslint.configs.recommended,{files:['src/**/*.{ts,tsx}','tests/**/*.{ts,tsx}','e2e/**/*.ts','*.config.ts'],languageOptions:{globals:{...globals.browser,...globals.node}},plugins:{'react-hooks':hooks},rules:{'react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'warn'}});
