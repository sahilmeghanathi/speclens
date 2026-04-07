import type { ValidationError } from '../utils/specValidation';
import { validateSpec } from '../utils/specValidation';

import { useCallback, useMemo, memo } from 'react';

interface JSONEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly validationErrors?: ValidationError[] | null;
  readonly onValidation?: (errors: ValidationError[]) => void;
}

/**
 * Simple JSON editor with syntax highlighting and error display.
 * Memoized to prevent unnecessary re-renders.
 */
const JSONEditorComponent = memo(function JSONEditor({
  value,
  onChange,
  validationErrors,
  onValidation,
}: JSONEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Validate
      if (onValidation) {
        const errors = validateSpec(newValue);
        onValidation(errors);
      }
    },
    [onChange, onValidation]
  );

  const hasErrors = useMemo(
    () => validationErrors && validationErrors.length > 0,
    [validationErrors]
  );

  const isValid = useMemo(
    () => !hasErrors && value.trim(),
    [hasErrors, value]
  );

  let statusClass = '';
  let statusMessage = '';

  if (isValid) {
    statusClass = 'valid';
    statusMessage = '✓ Valid JSON';
  } else if (hasErrors) {
    statusClass = 'invalid';
    statusMessage = `✗ ${validationErrors?.length} Error(s)`;
  } else {
    statusMessage = '○ No content';
  }

  return (
    <div className="json-editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Status Bar */}
      <div
        className={`spec-editor-status ${statusClass}`}
        role="status"
        aria-live="polite"
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #333',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{statusMessage}</span>
      </div>

      {/* Editor */}
      <textarea
        className="json-editor-textarea"
        value={value}
        onChange={handleChange}
        spellCheck="false"
        style={{
          flex: 1,
          padding: '12px',
          background: '#0a0a0a',
          color: '#e0e0e0',
          fontFamily: "'Courier New', 'Monaco', monospace",
          fontSize: '13px',
          lineHeight: '1.6',
          border: 'none',
          resize: 'none',
          outline: 'none',
          overflow: 'auto',
        }}
        placeholder="Enter spec JSON..."
      />

      {/* Error List */}
      {hasErrors && (
        <div
          style={{
            maxHeight: '120px',
            overflowY: 'auto',
            borderTop: '1px solid #333',
            background: '#0d0d0d',
            padding: '8px',
          }}
        >
          {validationErrors?.map((error) => (
            <div
              key={`${error.line}-${error.column}`}
              style={{
                fontSize: '11px',
                color: '#ff9999',
                marginBottom: '4px',
                padding: '4px 6px',
                background: '#1a0000',
                borderRadius: '2px',
                borderLeft: '2px solid #ff6b6b',
                fontFamily: "'Courier New', monospace",
                lineHeight: '1.4',
              }}
            >
              Line {error.line}: {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

JSONEditorComponent.displayName = 'JSONEditor';

export const JSONEditor = JSONEditorComponent;
