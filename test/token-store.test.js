const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const { parseTokenList, addTokenToList, persistTokenList, readTokenFile } = require('../token-store');

test('parseTokenList reads comma and newline separated tokens', () => {
  const tokens = parseTokenList('abc, def\nghi, jkl');
  assert.deepEqual(tokens, ['abc', 'def', 'ghi', 'jkl']);
});

test('addTokenToList prevents duplicates and allows unlimited tokens by default', () => {
  const tokens = ['a', 'b'];
  const result = addTokenToList(tokens, 'b');
  assert.deepEqual(result, ['a', 'b']);

  const next = addTokenToList(tokens, 'c');
  assert.deepEqual(next, ['a', 'b', 'c']);

  const unlimited = addTokenToList(['a', 'b', 'c', 'd', 'e'], 'f');
  assert.deepEqual(unlimited, ['a', 'b', 'c', 'd', 'e', 'f']);

  const limited = addTokenToList(['a', 'b'], 'c', 2);
  assert.deepEqual(limited, ['a', 'b']);
});

test('persistTokenList writes BOT_TOKENS using comma list', () => {
  const filePath = 'test/.env.mock';
  const tokens = ['token1', 'token2'];
  const output = persistTokenList(filePath, tokens);
  assert.equal(output, 'token1,token2');
});

test('readTokenFile imports tokens from a .txt file', () => {
  const filePath = 'test/tokens-import.txt';
  fs.writeFileSync(filePath, 'token-a\n# comment\n token-b , token-c\n\n token-d\n');

  const tokens = readTokenFile(filePath);
  assert.deepEqual(tokens, ['token-a', 'token-b', 'token-c', 'token-d']);

  fs.unlinkSync(filePath);
});

test('parseTokenList accepts BOT_TOKENS lines from old env txt files', () => {
  const tokens = parseTokenList('BOT_TOKENS=token-a, token-b\n# old\n token-c\n token-d');
  assert.deepEqual(tokens, ['token-a', 'token-b', 'token-c', 'token-d']);
});
