function tryParseJson(value) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function isLegacyLocalizedObject(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (Object.prototype.hasOwnProperty.call(value, 'vi') ||
      Object.prototype.hasOwnProperty.call(value, 'en')) &&
    Object.keys(value).every(key => ['vi', 'en'].includes(key))
  );
}

function sanitizeLegacyLocalized(value) {
  const parsed = tryParseJson(value);

  if (parsed instanceof Date) {
    return parsed;
  }

  if (isLegacyLocalizedObject(parsed)) {
    return parsed.vi ?? parsed.en ?? '';
  }

  if (Array.isArray(parsed)) {
    return parsed.map(sanitizeLegacyLocalized);
  }

  if (parsed && typeof parsed === 'object') {
    return Object.fromEntries(
      Object.entries(parsed).map(([key, child]) => [key, sanitizeLegacyLocalized(child)])
    );
  }

  return parsed;
}

module.exports = {
  sanitizeLegacyLocalized,
};
