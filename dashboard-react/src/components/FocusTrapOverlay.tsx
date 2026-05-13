import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import FocusTrap from 'focus-trap-react'

/**
 * Reusable overlay component with focus trap, Escape-to-close, and focus return.
 * Implements Requirements 8.6 and 8.7:
 * - Focus is trapped inside the overlay while open
 * - Escape key closes the overlay
 * - Focus returns to the trigger element on close
 *
 * Usage:
 * ```tsx
 * <FocusTrapOverlay
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   triggerRef={buttonRef}
 *   ariaLabel="Dialog title"
 * >
 *   <div>Overlay content</div>
 * </FocusTrapOverlay>
 * ```
 */
export function FocusTrapOverlay({
  isOpen,
  onClose,
  triggerRef,
  children,
  ariaLabel,
  ariaLabelledBy,
  role = 'dialog',
  className = '',
  backdropClassName = 'fixed inset-0 z-50 bg-black/40',
  containerClassName = 'fixed inset-0 z-50 flex items-center justify-center',
}: {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
  children: ReactNode
  ariaLabel?: string
  ariaLabelledBy?: string
  role?: 'dialog' | 'alertdialog'
  className?: string
  backdropClassName?: string
  containerClassName?: string
}) {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store the trigger element when overlay opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null
    }
  }, [isOpen])

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      const target = triggerRef?.current ?? previousActiveElement.current
      if (target && typeof target.focus === 'function') {
        requestAnimationFrame(() => {
          target.focus()
        })
      }
      previousActiveElement.current = null
    }
  }, [isOpen, triggerRef])

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    },
    [onClose],
  )

  if (!isOpen) return null

  return (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        escapeDeactivates: true,
        onDeactivate: onClose,
        allowOutsideClick: true,
        returnFocusOnDeactivate: false, // We handle focus return manually
      }}
    >
      <div className={containerClassName} onKeyDown={handleKeyDown}>
        {/* Backdrop */}
        <div
          className={backdropClassName}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Content */}
        <div
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={className}
        >
          {children}
        </div>
      </div>
    </FocusTrap>
  )
}
