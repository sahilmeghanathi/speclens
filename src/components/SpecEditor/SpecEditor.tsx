import { useCallback, useEffect, useState, useMemo, memo, type ReactNode } from 'react';
import { useSpecEditor } from './hooks/useSpecEditor';
import { useDebounce } from './hooks/useDebounce';
import { validateSpec } from './utils/specValidation';
import { Header } from './parts/Header';
import { JSONEditor } from './components/JSONEditor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MetricsSummary } from './components/MetricsSummary';
import { ComponentTreeView } from './components/ComponentTreeView';
import { renderNode } from '../../core/renderer';
import './SpecEditor.css';

const DEFAULT_SPEC = JSON.stringify(
  {
    type: 'Grid',
    id: 'root-grid',
    props: {
      columns: 2,
      gap: 16,
    },
    children: [
      {
        type: 'Card',
        id: 'card-1',
        props: {
          title: 'Welcome to Spec Editor',
          description: 'Edit the JSON spec on the left to see changes in real-time',
        },
      },
      {
        type: 'Card',
        id: 'card-2',
        props: {
          title: 'Real-time Tracking',
          description: 'View render metrics and component tree below',
        },
      },
    ],
  },
  null,
  2
);

/**
 * Preview content component - memoized to prevent re-renders.
 */
const PreviewContentComponent = memo(function PreviewContent({
  hasErrors,
  errorMessage,
  parsedSpec,
}: {
  readonly hasErrors: boolean;
  readonly errorMessage?: string;
  readonly parsedSpec?: any;
}): ReactNode {
  if (hasErrors) {
    return (
      <div className="spec-editor-error">
        <div className="spec-editor-error-title">⚠️ Invalid Spec</div>
        <div className="spec-editor-error-message">{errorMessage}</div>
      </div>
    );
  }

  if (parsedSpec) {
    return (
      <ErrorBoundary>
        <div className="spec-editor-render">{renderNode(parsedSpec as any)}</div>
      </ErrorBoundary>
    );
  }

  return <div className="spec-editor-placeholder">👋 No spec to preview</div>;
});

/**
 * Main Spec Editor UI component with 2-row layout.
 * Top: Editor (left) + Live Preview (right) with resizable divider
 * Bottom: Dev Panel with render tracking
 *
 * Optimized for performance with proper memoization and useCallback usage.
 */
export const SpecEditor = memo(function SpecEditor() {
  const {
    specJson,
    parsedSpec,
    validationErrors,
    setSpecJson,
    setParsedSpec,
    setValidationErrors,
  } = useSpecEditor();

  const debouncedJson = useDebounce(specJson || DEFAULT_SPEC, 300);
  const [dividerPos, setDividerPos] = useState(50); // 50% for equal split
  const [isDragging, setIsDragging] = useState(false);

  // Initialize with default spec if empty - once on mount
  useEffect(() => {
    if (!specJson) {
      setSpecJson(DEFAULT_SPEC);
    }
  }, []);

  // Handle spec validation and parsing - optimized to run on debounced value
  useEffect(() => {
    const errors = validateSpec(debouncedJson);
    const hasErrors = errors.length > 0;

    setValidationErrors(hasErrors ? errors : null);

    if (!hasErrors && debouncedJson.trim()) {
      try {
        const parsed = JSON.parse(debouncedJson);
        setParsedSpec(parsed);
      } catch {
        // Already caught by validation
      }
    } else if (!debouncedJson.trim()) {
      setParsedSpec(null);
    }
  }, [debouncedJson, setValidationErrors, setParsedSpec]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem('last-spec', specJson);
  }, [specJson]);

  // Handle dragging - optimized with separate effect
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.spec-editor-container') as HTMLElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newPos = ((e.clientX - rect.left) / rect.width) * 100;

      // Constrain between 20% and 80%
      if (newPos >= 20 && newPos <= 80) {
        setDividerPos(newPos);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Memoize preview props to prevent child re-renders
  const previewProps = useMemo(
    () => ({
      hasErrors: !!(validationErrors && validationErrors.length > 0),
      errorMessage: validationErrors?.[0]?.message,
      parsedSpec,
    }),
    [validationErrors, parsedSpec]
  );

  return (
    <div className="spec-editor-container">
      <Header onSave={handleSave} />

      {/* Top Row: Editor + Preview */}
      <div className="spec-editor-top-row">
        {/* Editor Panel */}
        <div className="spec-editor-left-panel" style={{ width: `${dividerPos}%` }}>
          <div className="spec-editor-panel-header">JSON Editor</div>
          <JSONEditor
            value={specJson || DEFAULT_SPEC}
            onChange={setSpecJson}
            validationErrors={validationErrors}
            onValidation={setValidationErrors}
          />
        </div>

        {/* Vertical Divider */}
        <button
          className={`spec-editor-v-divider ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          aria-label="Resize editor and preview"
          type="button"
          style={{ cursor: 'col-resize' }}
        />

        {/* Preview Panel */}
        <div className="spec-editor-right-panel" style={{ width: `${100 - dividerPos}%` }}>
          <div className="spec-editor-panel-header">Live Preview</div>
          <div className="spec-editor-preview-content">
            <PreviewContentComponent {...previewProps} />
          </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="spec-editor-h-divider" />

      {/* Bottom Row: Dev Panel */}
      <div className="spec-editor-bottom-row">
        <div className="spec-editor-panel-header">Render Tracking Dashboard</div>
        <div className="spec-editor-dev-content">
          <MetricsSummary />
          <div className="spec-editor-component-tree-section">
            <div className="spec-editor-tree-header">Component Tree</div>
            <ComponentTreeView />
          </div>
        </div>
      </div>
    </div>
  );
});

SpecEditor.displayName = 'SpecEditor';
