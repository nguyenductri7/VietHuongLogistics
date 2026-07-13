import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { attrTextMap, LANGUAGE_OPTIONS, LANGUAGES, staticTextMap, uiText } from './translations'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'site_language'
const TEXT_NODE_KEY = '__viText'
const ATTR_KEY_PREFIX = 'data-vi-'

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'vi'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === 'en' ? 'en' : 'vi'
}

function preserveSpacing(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || ''
  const trailing = original.match(/\s*$/)?.[0] || ''
  return `${leading}${translated}${trailing}`
}

function translateStaticText(text) {
  const trimmed = text.trim()
  if (!trimmed) return text
  const translated = staticTextMap[trimmed]
  return translated ? preserveSpacing(text, translated) : text
}

function shouldSkipNode(node) {
  const parent = node.parentElement
  if (!parent) return true
  return !!parent.closest('script, style, code, pre, textarea, input, select, option, [data-no-translate]')
}

function translateTextNodes(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []

  while (walker.nextNode()) {
    const node = walker.currentNode
    if (!shouldSkipNode(node)) nodes.push(node)
  }

  nodes.forEach((node) => {
    if (!node[TEXT_NODE_KEY]) node[TEXT_NODE_KEY] = node.nodeValue
    const nextValue = language === 'en'
      ? translateStaticText(node[TEXT_NODE_KEY])
      : node[TEXT_NODE_KEY]

    if (node.nodeValue !== nextValue) node.nodeValue = nextValue
  })
}

function translateAttributes(root, language) {
  const attrs = ['placeholder', 'aria-label', 'title']
  const elements = root.querySelectorAll('[placeholder], [aria-label], [title]')

  elements.forEach((el) => {
    attrs.forEach((attr) => {
      if (!el.hasAttribute(attr)) return

      const storeAttr = `${ATTR_KEY_PREFIX}${attr}`
      if (!el.hasAttribute(storeAttr)) {
        el.setAttribute(storeAttr, el.getAttribute(attr) || '')
      }

      const original = el.getAttribute(storeAttr) || ''
      const translated = attrTextMap[original] || staticTextMap[original]
      const nextValue = language === 'en' && translated ? translated : original
      if (el.getAttribute(attr) !== nextValue) el.setAttribute(attr, nextValue)
    })
  })
}

function applyDocumentLanguage(language) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language === 'en' ? 'en' : 'vi'
  translateTextNodes(document.body, language)
  translateAttributes(document.body, language)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  const setLanguage = (nextLanguage) => {
    const normalized = nextLanguage === 'en' ? 'en' : 'vi'
    setLanguageState(normalized)
    window.localStorage.setItem(STORAGE_KEY, normalized)
  }

  const toggleLanguage = () => setLanguage(language === 'vi' ? 'en' : 'vi')

  const value = useMemo(() => ({
    language,
    languages: LANGUAGES,
    languageOptions: LANGUAGE_OPTIONS,
    setLanguage,
    toggleLanguage,
    t: (key) => uiText[language]?.[key] || uiText.vi[key] || key,
  }), [language])

  useEffect(() => {
    applyDocumentLanguage(language)

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => applyDocumentLanguage(language))
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title'],
    })

    return () => observer.disconnect()
  }, [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
