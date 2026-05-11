import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Ignora pastas que não devem ser analisadas
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'prisma/migrations/**',
    ],
  },

  // eslint-config-next v16 já exporta flat config array diretamente
  ...nextConfig,

  // Prettier desativa regras de formatação que conflitam com prettier
  prettierConfig,

  // Sobrescritas pontuais do projeto
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Permite variáveis prefixadas com _ sem acusar unused-vars
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Permite `any` explícito em casos controlados
      '@typescript-eslint/no-explicit-any': 'warn',

      // Regras do React Compiler — muito agressivas para padrões válidos
      // como useEffect(() => setMounted(true), []) e async data fetching
      'react-hooks/set-state-in-effect': 'warn',

      // react-hook-form usa watch() que o React Compiler não consegue
      // memoizar — aviso apenas, não bloqueia commit
      'react-hooks/incompatible-library': 'warn',

      // Arquivos de configuração (postcss, tailwind) usam default export anônimo
      'import/no-anonymous-default-export': 'off',
    },
  },
];

export default config;
