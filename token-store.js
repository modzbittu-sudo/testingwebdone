const fs = require('fs');
const path = require('path');

function normalizeTokenCandidate(rawItem) {
  let item = String(rawItem ?? '').replace(/\r/g, '').trim();
  if (!item || item.startsWith('#') || item.startsWith('//')) {
    return '';
  }

  item = item.replace(/^#.*$/, '').trim();
  if (!item) {
    return '';
  }

  const stripped = item
    .replace(/^BOT_TOKENS?\s*[:=]\s*/i, '')
    .replace(/^TOKEN\s*[:=]\s*/i, '')
    .replace(/^DISCORD_TOKEN\s*[:=]\s*/i, '')
    .replace(/^\s*['\"]|['\"]\s*$/g, '')
    .replace(/^[\[\(]+|[\]\)]+$/g, '')
    .split(/\s+/)[0]
    .trim();

  if (!stripped || /^(?:comment|old|example|token)$/i.test(stripped)) {
    return '';
  }

  if (!/^[A-Za-z0-9._-]+$/.test(stripped)) {
    return '';
  }

  return stripped;
}

function parseTokenList(value) {
  const rawValues = Array.isArray(value) ? value : [value];

  return rawValues
    .flatMap((entry) => String(entry ?? '').split(/\r?\n|,|;/))
    .map((item) => normalizeTokenCandidate(item))
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function readTokenFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return parseTokenList(content);
}

function addTokenToList(existingTokens, newToken, maxBots = Number.MAX_SAFE_INTEGER) {
  const list = parseTokenList(existingTokens);
  const token = String(newToken || '').trim();

  if (!token) {
    return list;
  }

  if (list.includes(token)) {
    return list;
  }

  if (Number.isFinite(maxBots) && maxBots > 0 && list.length >= maxBots) {
    return list;
  }

  return [...list, token];
}

function persistTokenList(filePath, tokens) {
  const normalized = parseTokenList(tokens);
  const envValue = normalized.join(',');

  const envFilePath = filePath || path.join(process.cwd(), '.env');
  const directory = path.dirname(envFilePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  let existing = '';
  if (fs.existsSync(envFilePath)) {
    existing = fs.readFileSync(envFilePath, 'utf8');
  }

  const lines = existing.split(/\r?\n/);
  let replaced = false;

  const updatedLines = lines.map((line) => {
    if (/^BOT_TOKENS=/i.test(line.trim())) {
      replaced = true;
      return `BOT_TOKENS=${envValue}`;
    }
    return line;
  });

  if (!replaced) {
    updatedLines.push(`BOT_TOKENS=${envValue}`);
  }

  const cleaned = updatedLines.filter((line, index) => {
    if (line.trim() === '') {
      return index === updatedLines.length - 1 ? false : true;
    }
    return true;
  });

  const finalContent = cleaned.join('\n').replace(/\n+$/, '') + '\n';
  fs.writeFileSync(envFilePath, finalContent, 'utf8');
  return envValue;
}

module.exports = {
  parseTokenList,
  readTokenFile,
  addTokenToList,
  persistTokenList,
};
