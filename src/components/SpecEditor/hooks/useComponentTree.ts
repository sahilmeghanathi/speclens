/**
 * useComponentTree Hook
 * Extracts tree building and metrics updating logic from ComponentTreeView
 */

import { useRenderTracker } from '../../../hooks/useRenderTracker'
import { useEffect, useState } from 'react'

export interface TreeNodeData {
  readonly type: string
  readonly id: string
  readonly depth: number
  readonly renderCount: number
  readonly renderReason: string
  readonly children: readonly TreeNodeData[]
}

/**
 * Recursively build component tree from spec
 */
function buildTree(spec: any, depth: number = 0): TreeNodeData {
  return {
    type: spec.type || 'Unknown',
    id: spec.id || `${spec.type}-${depth}`,
    depth,
    renderCount: 0,
    renderReason: 'initial_render',
    children: (spec.children || []).map((child: any) => buildTree(child, depth + 1)),
  }
}

/**
 * Custom hook for component tree management
 * Builds tree from spec and updates metrics from tracker
 */
export function useComponentTree(parsedSpec: any) {
  const tracker = useRenderTracker()
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null)

  // Build tree only when spec changes
  useEffect(() => {
    if (!parsedSpec) {
      setTreeData(null)
      return
    }
    setTreeData(buildTree(parsedSpec))
  }, [parsedSpec])

  // Update metrics from tracker
  useEffect(() => {
    if (!treeData || !tracker) return

    const updateMetrics = () => {
      const stats = tracker.getAllStats()

      const updateNode = (node: TreeNodeData): TreeNodeData => {
        const data = stats[node.id]
        return {
          ...node,
          renderCount: (data?.totalRenders) ?? 0,
          renderReason: data?.lastReason || 'initial_render',
          children: node.children.map(updateNode),
        }
      }

      setTreeData((current) => (current ? updateNode(current) : null))
    }

    // Update immediately
    updateMetrics()

    // Poll every 500ms
    const interval = setInterval(updateMetrics, 500)
    return () => clearInterval(interval)
  }, [treeData, tracker])

  return treeData
}
