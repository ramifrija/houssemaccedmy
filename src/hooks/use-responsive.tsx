import { useState, useEffect } from 'react'

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
        setScreenSize('mobile')
      } else if (width < 1024) {
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
        setScreenSize('tablet')
      } else {
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
        setScreenSize('desktop')
      }
    }

    // Vérifier la taille initiale
    checkScreenSize()

    // Écouter les changements de taille
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize
  }
}

export default useResponsive


