import { useRenderTracker } from '../../../hooks/useRenderTracker';
import { useSpecEditor } from '../hooks/useSpecEditor';
import { useEffect, useState, useMemo, memo, useCallback } from 'react';

interface TreeNodeData {
  readonly type: string;
  readonly id: string;
  readonly depth: number;
  readonly renderCount: number;
  readonly renderReason: string;
  readonly children: readonly TreeNodeData[];
}

/**
 * Recursively build component tree from spec.
 */
function buildTree(spec: any, depth: number = 0): TreeNodeData {
  return {
    type: spec.type || 'Unknown',
    id: spec.id || `${spec.type}-${depth}`,
    depth,
    renderCount: 0,
    renderReason: 'initial_render',
    children: (spec.children || []).map((child: any) => buildTree(child, depth + 1)),
  };
}

interface TreeNodeProps {
  readonly node: TreeNodeData;
  readonly selected: string | null;
  readonly onSelect: (id: string) => void;
  readonly defaultExpanded?: boolean;
}

/**
 * Single tree node - memoized to prevent re-renders of other nodes.
 */
const TreeNodeComponent = memo(function TreeNode({
  node,
  selected,
  onSelect,
  defaultExpanded = true,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const reasonColors: Record<string, string> = useMemo(
    () => ({
      props_changed: '#60a5fa',
      parent_rerender: '#fbbf24',
      state_change: '#f97316',
      context_change: '#a78bfa',
      initial_render: '#4ade80',
    }),
    []
  );

  const reasonEmoji: Record<string, string> = useMemo(
    () => ({
      props_changed: '🔄',
      parent_rerender: '⚡',
      state_change: '🎯',
      context_change: '📦',
      initial_render: '⭐',
    }),
    []
  );

  const reasonColor = reasonColors[node.renderReason] || '#888';
  const reasonIcon = reasonEmoji[node.renderReason] || '◯';

  const handleToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setExpanded((prev) => !prev);
    },
    []
  );

  const handleSelect = useCallback(() => {
    onSelect(node.id);
  }, [node.id, onSelect]);

  return (
    <div className="tree-node">
      <button
        onClick={handleSelect}
        type="button"
        aria-pressed={selected === node.id}
        className={`tree-node-content ${selected === node.id ? 'selected' : ''}`}
      >
        {node.children.length > 0 && (
          <button
            onClick={handleToggle}
            type="button"
            className={`tree-node-toggle ${expanded ? 'expanded' : ''}`}
            aria-expanded={expanded}
            aria-label="Toggle node"
          >
            ▶
          </button>
        )}
        {node.children.length === 0 && <span className="tree-node-toggle">·</span>}

        <span className="tree-node-icon" style={{ color: reasonColor }}>
          {reasonIcon}
        </span>
        <span className="tree-node-name">{node.type}</span>
        <span className="tree-node-count">({node.renderCount})</span>
      </button>

      {expanded &&
        node.children.map((child) => (
          <TreeNodeComponent
            key={child.id}
            node={child}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
});

/**
 * Component displaying hierarchical tree of components with render metrics.
 * Memoized to prevent unnecessary re-renders.
 */
const ComponentTreeViewComponent = memo(function ComponentTreeView() {
  const { parsedSpec, selectedComponentId, setSelectedComponentId } = useSpecEditor();
  const tracker = useRenderTracker();
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);

  // Build tree only when spec changes
  useEffect(() => {
    if (!parsedSpec) {
      setTreeData(null);
      return;
    }
    setTreeData(buildTree(parsedSpec));
  }, [parsedSpec]);

  // Update metrics from tracker
  useEffect(() => {
    if (!treeData || !tracker) return;

    const updateMetrics = () => {
      const stats = tracker.getAllStats();

      const updateNode = (node: TreeNodeData): TreeNodeData => {
        const data = stats[node.id];
        return {
          ...node,
          renderCount: (data?.totalRenders) ?? 0,
          renderReason: data?.lastReason || 'initial_render',
          children: node.children.map(updateNode),
        };
      };

      setTreeData((current) => (current ? updateNode(current) : null));
    };

    // Update immediately
    updateMetrics();

    // Poll every 500ms
    const interval = setInterval(updateMetrics, 500);
    return () => clearInterval(interval);
  }, [treeData, tracker]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedComponentId(id === selectedComponentId ? null : id);
    },
    [selectedComponentId, setSelectedComponentId]
  );

  if (!treeData) {
    return <div className="spec-editor-placeholder">No components to display</div>;
  }

  return (
    <div className="spec-editor-tree-content">
      <TreeNodeComponent
        node={treeData}
        selected={selectedComponentId}
        onSelect={handleSelect}
      />
    </div>
  );
});

export const ComponentTreeView = ComponentTreeViewComponent;
