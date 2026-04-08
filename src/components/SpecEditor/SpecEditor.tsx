import { useEffect, useMemo, memo, type ReactNode } from 'react';
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

const DEFAULT_SPEC = JSON.stringify(
  {
    type: 'Card',
    id: 'root-card',
    props: {
      title: '📊 Demo Analytics Dashboard',
    },
    children: [
      {
        type: 'Grid',
        id: 'metrics-grid',
        props: {
          columns: 3,
        },
        children: [
          {
            type: 'StatCard',
            id: 'stat-1',
            props: {
              label: 'Total Revenue',
              value: '$45,231',
              change: '+12.5%',
            },
          },
          {
            type: 'StatCard',
            id: 'stat-2',
            props: {
              label: 'Active Users',
              value: '8,391',
              change: '+8.2%',
            },
          },
          {
            type: 'StatCard',
            id: 'stat-3',
            props: {
              label: 'Conversion Rate',
              value: '3.24%',
              change: '+2.1%',
            },
          },
        ],
      },
      {
        type: 'Grid',
        id: 'content-grid',
        props: {
          columns: 2,
        },
        children: [
          {
            type: 'Card',
            id: 'card-1',
            props: {
              title: '✨ Interactive Components',
              description: 'Try changing the "type" property to StatCard, Card, or Grid to see different components rendered. Edit in real-time on the left!',
            },
          },
          {
            type: 'Card',
            id: 'card-2',
            props: {
              title: '📈 Real-time Updates',
              description: 'Changes to the JSON spec are reflected instantly in the preview. Check the render metrics below to track performance.',
            },
          },
          {
            type: 'Card',
            id: 'card-3',
            props: {
              title: '🎯 Component Props',
              description: 'Each component type has different props. StatCard uses label, value, change. Card uses title, description. Grid uses columns.',
            },
          },
          {
            type: 'Card',
            id: 'card-4',
            props: {
              title: '🔧 Try It Yourself',
              description: 'Edit the JSON on the left. Change "columns" in Grid, add more StatCards, or modify Card titles to see the demo in action!',
            },
          },
        ],
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
  const { dividerPos, isDragging, handleMouseDown, handleSave } = useSpecEditorLogic({
    specJson,
    debouncedJson,
    setParsedSpec,
    setValidationErrors,
  });

  // Initialize with default spec if empty - once on mount
  useEffect(() => {
    if (!specJson) {
      setSpecJson(DEFAULT_SPEC);
    }
  }, []);

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
