import { useEffect } from 'react'
import { SITE } from './firebase'

function setMeta(selector: string, attr: string, value: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, value)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

interface SeoOptions {
  title: string
  description?: string
  path?: string
  /** JSON-LD object injected as a script tag; removed on unmount. */
  jsonLd?: Record<string, unknown>
}

/**
 * Lightweight head management. The site is a client-rendered SPA, so this
 * mainly serves users and link previews that execute JS. If organic search
 * becomes a serious channel, pre-render the vendor pages at build time.
 */
export function useSeo({ title, description, path, jsonLd }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title.includes('Function Hub') ? title : `${title} | The Function Hub SA`
    document.title = fullTitle
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = `${SITE.url}${path ?? window.location.pathname}`

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => {
      script?.remove()
    }
  }, [title, description, path, jsonLd])
}
