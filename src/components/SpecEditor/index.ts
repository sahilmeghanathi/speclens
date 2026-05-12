export { SpecEditor } from './SpecEditor';
export { Header } from './parts/Header';
export { JSONEditor } from './components/JSONEditor';
export { ErrorBoundary } from './components/ErrorBoundary';
export { MetricsSummary } from './components/MetricsSummary';
export { ComponentTreeView } from './components/ComponentTreeView';

// Hooks
export { useSpecEditor } from './hooks/useSpecEditor';
export { useSpecEditorLogic } from './hooks/useSpecEditorLogic';
export { useMetricsSummary, type MetricsData } from './hooks/useMetricsSummary';
export { useComponentTree, type TreeNodeData } from './hooks/useComponentTree';
export { useDebounce } from './hooks/useDebounce';

// Utils
export { validateSpec, parseJSONSafely, validateSpecSchema } from './utils/specValidation';
export { SPEC_TEMPLATES } from './utils/specTemplates';
