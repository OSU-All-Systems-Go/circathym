export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [1, 'always', ['feat', 'fix', 'docs', 'test', 'chore']],
    'type-empty': [1, 'never'],
    'subject-empty': [1, 'never'],
    'subject-case': [2, 'always', 'sentence-case'],
  },
};
