import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hook: animate elements into view on scroll using GSAP ScrollTrigger
 * @param {object} options - GSAP from/to vars + trigger options
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const {
      from = { opacity: 0, y: 50 },
      to = { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      trigger = ref.current,
      start = 'top 80%',
      stagger = false,
      selector = null,
    } = options

    const targets = selector
      ? ref.current.querySelectorAll(selector)
      : ref.current

    const anim = gsap.fromTo(targets, from, {
      ...to,
      scrollTrigger: {
        trigger,
        start,
        once: true,
      },
      ...(stagger ? { stagger } : {}),
    })

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [])

  return ref
}
