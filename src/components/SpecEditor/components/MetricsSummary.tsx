import { useMemo, memo } from 'react';
import { useMetricsSummary } from '../hooks/useMetricsSummary';

/**
 * Component displaying render tracking metrics summary.
 * Memoized to prevent unnecessary re-renders.
 */
const MetricsSummaryComponent = memo(function MetricsSummary() {
  const metrics = useMetricsSummary();

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
