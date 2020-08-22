module.exports =  {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: [
        '@typescript-eslint',
    ],
    parserOptions: {
        ecmaVersion: 2019,
        project: './tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: './',
    },
    env: {
        node: true,
        es6: true,
    },
    rules: {
        // 允许使用显式的 any 类型
        '@typescript-eslint/no-explicit-any': 'off',
        // 允许使用非空断言
        '@typescript-eslint/no-non-null-assertion': 'off',
        // 不禁止任何类型
        '@typescript-eslint/ban-types': 'off',
        // 允许对具有初始化语句的变量额外标注类型
        '@typescript-eslint/no-inferrable-types': 'off',
        // 允许使用 namespace
        '@typescript-eslint/no-namespace': 'off'
    },
};
