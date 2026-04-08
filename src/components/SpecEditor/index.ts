export { SpecEditor } from './SpecEditor';
export { Header } from './parts/Header';
export { EditorPanel, PreviewPanel, DevPanel, ResizeDivider } from './parts/PanelComponents';
export { JSONEditor } from './components/JSONEditor';
export { ErrorBoundary } from './components/ErrorBoundary';
export { MetricsSummary } from './components/MetricsSummary';
export { ComponentTreeView } from './components/ComponentTreeView';

// Hooks
export { useSpecEditor } from './hooks/useSpecEditor';
export { useSpecEditorLogic } from './hooks/useSpecEditorLogic';
export { useMetricsSummary, type MetricsData } from './hooks/useMetricsSummary';
export { useComponentTree, type TreeNodeData } from './hooks/useComponentTree';
export { useColumnResize } from './hooks/useColumnResize';
export { useDebounce } from './hooks/useDebounce';

// Utils
export { validateSpec, parseJSONSafely, validateSpecSchema } from './utils/specValidation';
export { getTemplates, getTemplateByName, templateToJSON, SPEC_TEMPLATES } from './utils/specTemplates';
