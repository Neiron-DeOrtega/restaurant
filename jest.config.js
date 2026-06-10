module.exports = {
    preset: 'ts-jest', // Используем ts-jest для работы с TypeScript
    testEnvironment: 'node', // Указываем среду выполнения (Node.js)
    roots: ['src/tests'], // Где искать тесты
    moduleFileExtensions: ['ts', 'js'], // Расширения файлов
    testMatch: ['**/*.test.ts'], // Шаблон для тестовых файлов
    transform: {
      '^.+\\.ts$': 'ts-jest', // Преобразование TypeScript в JavaScript
    },
  };