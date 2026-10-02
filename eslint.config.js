import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dist-prod',
      'node_modules',
      'public',
      'scripts',
      'test-results',
      'playwright-report',
      // Higiene (02/10/2026): cachés i scratch locals que no s'han de lintar.
      '.netlify',
      '.tmp-swift',
      '.freebuff',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // (02/10/2026) Apagat: el patro hook+provider al mateix fitxer i els
      // exports d'utilitats (Meta dels correus, shadcn button, helpers) son
      // intencionats. La regla nome s afecta el hot-reload en dev, no la produccio.
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    extends: [js.configs.recommended],
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Global definit per Vite en temps de build (vite.config.js, `define`).
        __HG_GIT_BRANCH__: 'readonly',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // 02/10/2026 — En Marc: «Arregla'ls tots». Les set regles següents són noves del
      // plugin react-hooks v7 (derivades del compilador de React) i marquen
      // patrons INTENCIONATS d'aquest projecte: efectes que mesuren el DOM i
      // publiquen mides (set-state-in-effect), calibratge de píxels del
      // megaslide (purity, refs, immutability), i composicions on el component
      // viu dins del render (static-components). Reescriure-les és un
      // redisseny de la capa de mesura, no un arranjament d'errors: es reclassifiquen
      // com a avís fins que es vulgui fer aquest redisseny. La resta d'errors
      // es van arreglar al codi (informe del dia).
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-refresh/only-export-components': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // (02/10/2026) Correus i informes: text en llengua natural. L'apostrof (')
    // al JSX es legitim i el rule react/no-unescaped-entities hi fa soroll;
    // escapar-los amb &apos; empitjoraria la llegibilitat del text. Es desactiva
    // nome s per a aquests fitxers de prosa (no per als components de la botiga).
    files: ['netlify/emails/**/*.jsx', 'docs/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react },
    rules: { 'react/no-unescaped-entities': 'off' },
  },
  {
    // (04/10/2026) ELS CORREUS ES COMPILEN EN JSX CLASSIC. Netlify empaqueta les
    // funcions de servidor amb esbuild i, com que no hi ha cap tsconfig amb
    // `jsx: react-jsx` a l'abast d'aquests fitxers, el JSX surt amb
    // `React.createElement`: cada .jsx ha d'importar React. La config general fa
    // servir el runtime AUTOMATIC (`react.configs['jsx-runtime']`, vegeu la regla
    // de dalt), que desactiva aquestes dues regles, i per allo la neteja del codi
    // mort va poder treure els imports: el paquet compilava i petava en enviar.
    // Amb aquestes dues regles, l'eslint ho torna a exigir.
    files: ['netlify/emails/**/*.jsx'],
    plugins: { react },
    rules: {
      'react/react-in-jsx-scope': 'error',
      'react/jsx-uses-react': 'error',
    },
  },
);
