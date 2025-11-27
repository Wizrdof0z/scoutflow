import { ReactNode, useEffect, useRef } from 'react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
}

export function Dialog({ isOpen, onClose, children, maxWidth = '5xl' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        ref={dialogRef}
        className={`relative bg-background rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full mx-4 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  )
}

interface DialogHeaderProps {
  children: ReactNode
  onClose?: () => void
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

interface DialogContentProps {
  children: ReactNode
}

export function DialogContent({ children }: DialogContentProps) {
  return <div className="px-6 py-6">{children}</div>
}

interface DialogTitleProps {
  children: ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-2xl font-bold text-foreground">{children}</h2>
}
