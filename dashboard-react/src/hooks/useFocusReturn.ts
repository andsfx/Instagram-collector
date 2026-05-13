import { useCallback, useEffect, useRef } from 'react'

/**
 * Hook to manage focus return when an overlay/modal closes.
 * Stores the trigger element reference and returns focus to it on close.
 *
 * Usage:
 * ```tsx
 * const { triggerRef, returnFocus } = useFocusReturn()
 *
 * <button ref={triggerRef} onClick={() => setOpen(true)}>Open</button>
 * // When closing:
 * function handleClose() {
 *   setOpen(false)
 *   returnFocus()
 * }
 * ```
 *
 * Requirements: 8.6, 8.7
 */
export function useFocusReturn<T extends HTMLElement = HTMLElement>() {
  const triggerRef = useRef<T>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const saveTrigger = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement | null
  }, [])

  const returnFocus = useCallback(() => {
    // Prefer the explicit trigger ref, fall back to previously active element
    const target = triggerRef.current ?? previousActiveElement.current
    if (target && typeof target.focus === 'function') {
      // Use requestAnimationFrame to ensure DOM has settled after overlay unmount
      requestAnimationFrame(() => {
        target.focus()
      })
    }
  }, [])

  return { triggerRef, saveTrigger, returnFocus }
}

/**
 * Hook to handle Escape key press for closing overlays.
 * Calls the provided onClose callback when Escape is pressed.
 *
 * Requirements: 8.6
 */
export function useEscapeClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
}
