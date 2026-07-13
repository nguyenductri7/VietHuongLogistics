export const DEFAULT_LANGUAGE = 'vi'

export function parseLocalizedValue(value) {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return value

  try {
    const parsed = JSON.parse(trimmed)
    return isLocalizedValue(parsed) ? parsed : value
  } catch {
    return value
  }
}

export function isLocalizedValue(value) {
  const parsedValue = parseLocalizedValue(value)
  return Boolean(
    parsedValue &&
    typeof parsedValue === 'object' &&
    !Array.isArray(parsedValue) &&
    ('vi' in parsedValue || 'en' in parsedValue),
  )
}

export function getLocalizedValue(value, language = DEFAULT_LANGUAGE, fallbackLanguage = DEFAULT_LANGUAGE) {
  const parsedValue = parseLocalizedValue(value)
  if (!isLocalizedValue(parsedValue)) return value

  return (
    parsedValue[language] ??
    parsedValue[fallbackLanguage] ??
    parsedValue.vi ??
    parsedValue.en ??
    ''
  )
}

export function toLocalizedValue(value, language = DEFAULT_LANGUAGE, nextValue = '') {
  const parsedValue = parseLocalizedValue(value)
  if (isLocalizedValue(parsedValue)) {
    return {
      ...parsedValue,
      [language]: nextValue,
    }
  }

  return {
    vi: language === 'vi' ? nextValue : (value ?? ''),
    en: language === 'en' ? nextValue : '',
  }
}

export function serializeLocalizedValue(value) {
  return isLocalizedValue(value) ? JSON.stringify(parseLocalizedValue(value)) : value
}

export function toLocalizedString(value, language = DEFAULT_LANGUAGE, nextValue = '') {
  return JSON.stringify(toLocalizedValue(value, language, nextValue))
}

export function localizeObject(source, language = DEFAULT_LANGUAGE) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return source

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.map(item => localizeObject(item, language))]
      }

      if (value && typeof value === 'object' && !isLocalizedValue(value)) {
        return [key, localizeObject(value, language)]
      }

      return [key, getLocalizedValue(value, language)]
    }),
  )
}
