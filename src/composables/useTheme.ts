import { onMounted, onUnmounted, ref } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const resolvedTheme = ref<'light' | 'dark'>('light')

let mediaQuery: MediaQueryList | null = null
let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null

export function useTheme() {
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const applyTheme = (newTheme: Theme) => {
    theme.value = newTheme
    const root = document.documentElement

    if (newTheme === 'system') {
      resolvedTheme.value = getSystemTheme()
    } else {
      resolvedTheme.value = newTheme
    }

    if (resolvedTheme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('light')
    } else {
      // If system, toggle to opposite of current resolved theme
      setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
    }
  }

  onMounted(() => {
    // Load saved theme or default to system
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      applyTheme(savedTheme)
    } else {
      applyTheme('system')
    }

    // Watch for system theme changes
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryHandler = () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', mediaQueryHandler)
  })

  onUnmounted(() => {
    if (mediaQuery && mediaQueryHandler) {
      mediaQuery.removeEventListener('change', mediaQueryHandler)
    }
  })

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }
}
