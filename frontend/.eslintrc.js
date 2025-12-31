/**
 * ESLint 配置
 * 用于代码质量检查
 */
export default {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // 禁止使用 console（生产环境）
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    // 禁止使用 debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    // 禁止使用 any 类型（TypeScript）
    '@typescript-eslint/no-explicit-any': 'warn',
    // 要求使用 const 而不是 let（如果可能）
    'prefer-const': 'warn',
    // 禁止未使用的变量
    'no-unused-vars': 'warn',
  },
};




