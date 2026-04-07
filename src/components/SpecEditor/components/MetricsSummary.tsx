import { useRenderTracker } from '../../../hooks/useRenderTracker';
import { useEffect, useState, useMemo, memo } from 'react';

interface MetricsData {
  readonly totalRenders: number;
  readonly mostRendered: { readonly name: string; readonly count: number } | null;
  readonly avgDuration: number;
  readonly mostCommonReason: string;
}

/**
 * Component displaying render tracking metrics summary.
 * Memoized to prevent unnecessary re-renders.
 */
const MetricsSummaryComponent = memo(function MetricsSummary() {
  const tracker = useRenderTracker();
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRenders: 0,
    mostRendered: null,
    avgDuration: 0,
    mostCommonReason: 'initial_render',
  });

  useEffect(() => {
    if (!tracker) return;

    const updateMetrics = () => {
      const stats = tracker.getAllStats();
      let totalRenders = 0;
      let totalDuration = 0;
      let maxRenders = 0;
      let mostRenderedName: string | null = null;
      const reasonCounts: Record<string, number> = {};

      for (const [nodeId, data] of Object.entries(stats)) {
        totalRenders += data.totalRenders ?? 0;
        totalDuration += data.averageDuration || 0;

        if ((data.totalRenders ?? 0) > maxRenders) {
          maxRenders = data.totalRenders ?? 0;
          mostRenderedName = data.componentType || nodeId;
        }

        if (data.lastReason) {
          reasonCounts[data.lastReason] = (reasonCounts[data.lastReason] || 0) + 1;
        }
      }

      let mostCommonReason = 'initial_render';
      let maxReasonCount = 0;
      for (const [reason, count] of Object.entries(reasonCounts)) {
        if (count > maxReasonCount) {
          maxReasonCount = count;
          mostCommonReason = reason;
        }
      }

      const avgDuration = totalRenders > 0 ? totalDuration / totalRenders : 0;

      setMetrics({
        totalRenders,
        mostRendered: mostRenderedName ? { name: mostRenderedName, count: maxRenders } : null,
        avgDuration: Math.round(avgDuration * 100) / 100,
        mostCommonReason,
      });
    };

    // Update immediately
    updateMetrics();

    // Poll every 500ms
    const interval = setInterval(updateMetrics, 500);
    return () => clearInterval(interval);
  }, [tracker]);

  // Memoize metric cards to prevent re-renders
  const metricCards = useMemo(
    () => [
      {
        label: 'Total Renders',
        value: metrics.totalRenders.toLocaleString(),
        color: '#60a5fa',
      },
      {
        label: 'Most Rendered',
        value: metrics.mostRendered
          ? `${metrics.mostRendered.name} (${metrics.mostRendered.count})`
          : 'Unknown',
        color: '#a78bfa',
      },
      {
        label: 'Avg Duration',
        value: `${metrics.avgDuration.toFixed(2)}ms`,
        color: '#4ade80',
      },
      {
        label: 'Render Reason',
        value: metrics.mostCommonReason.replaceAll('_', ' '),
        color: '#fbbf24',
      },
    ],
    [metrics]
  );

  return (
    <div className="spec-editor-metric-cards">
      {metricCards.map((card) => (
        <div key={card.label} className="spec-editor-metric-card">
          <div className="spec-editor-metric-label">{card.label}</div>
          <div
            className="spec-editor-metric-value"
            style={{ color: card.color }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
});

export const MetricsSummary = MetricsSummaryComponent;
