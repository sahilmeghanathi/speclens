/**
 * useSpecEditorLogic Hook
 * Manages additional SpecEditor logic (divider, validation, saving, etc.)
 */

import { useCallback, useEffect, useState } from 'react'
import { validateSpec } from '../utils/specValidation'
import type { ValidationError } from '../utils/specValidation'

interface UseSpecEditorLogicProps {
  specJson: string | undefined
  debouncedJson: string
  setParsedSpec: (spec: any) => void
  setValidationErrors: (errors: ValidationError[] | null) => void
}

/**
 * Hook to manage SpecEditor logic:
 * - Divider position and dragging
 * - Spec validation and parsing
 * - Saving to localStorage
 */
export function useSpecEditorLogic({
  specJson,
  debouncedJson,
  setParsedSpec,
  setValidationErrors,
}: UseSpecEditorLogicProps) {
  const [dividerPos, setDividerPos] = useState(50) // 50% for equal split
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleSave = useCallback(() => {
    localStorage.setItem('last-spec', specJson || '')
  }, [specJson])

  // Handle dragging - optimized with separate effect
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.spec-editor-container') as HTMLElement
      if (!container) return

      const rect = container.getBoundingClientRect()
      const newPos = ((e.clientX - rect.left) / rect.width) * 100

      // Constrain between 20% and 80%
      if (newPos >= 20 && newPos <= 80) {
        setDividerPos(newPos)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Handle spec validation and parsing
  useEffect(() => {
    const errors = validateSpec(debouncedJson)
    const hasErrors = errors.length > 0

    setValidationErrors(hasErrors ? errors : null)

    if (!hasErrors && debouncedJson.trim()) {
      try {
        const parsed = JSON.parse(debouncedJson)
        setParsedSpec(parsed)
      } catch {
        // Already caught by validation
      }
    } else if (!debouncedJson.trim()) {
      setParsedSpec(null)
    }
  }, [debouncedJson, setValidationErrors, setParsedSpec])

  return {
    dividerPos,
    isDragging,
    handleMouseDown,
    handleSave,
  }
}
