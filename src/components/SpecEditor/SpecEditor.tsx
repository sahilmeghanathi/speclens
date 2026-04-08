import { useMemo, memo, type ReactNode } from 'react';
import { useSpecEditor } from './hooks/useSpecEditor';
import { useDebounce } from './hooks/useDebounce';
import { useSpecEditorLogic } from './hooks/useSpecEditorLogic';
import { Header } from './parts/Header';
import { JSONEditor } from './components/JSONEditor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MetricsSummary } from './components/MetricsSummary';
import { ComponentTreeView } from './components/ComponentTreeView';
import { renderNode } from '../../core/renderer';
import './SpecEditor.css';

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

  const debouncedJson = useDebounce(specJson, 300);
  const { dividerPos, isDragging, handleMouseDown, handleSave } = useSpecEditorLogic({
    specJson,
    debouncedJson,
    setParsedSpec,
    setValidationErrors,
  });

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
            value={specJson}
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
