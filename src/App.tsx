import { useEffect, useState } from "react";
import { renderNode } from "./core/renderer";
import { sampleSpec } from "./specs/sampleSpec";
import { RenderTrackerProvider } from "./core/RenderTrackerProvider";
import { tracker } from "./core/renderTracker";
import { Dashboard } from "./components";

function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'both'>('dashboard');

  // Log tracking data to console every 2 seconds for debugging
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (tracker.isEnabled()) {
        const stats = tracker.getSystemStats();
        console.log(`[RenderTracker] ${stats.totalComponentsTracked} components tracked, ${stats.totalRenders} total renders`);
      }
    }, 2000);

    return () => clearInterval(logInterval);
  }, []);

  return (
    <RenderTrackerProvider enabled={true}>
      <div style={{ display: 'flex', height: '100vh', width: '100%', flexDirection: viewMode === 'dashboard' ? 'column' : 'row' }}>
        {/* Dashboard - Primary View */}
        <div style={{ flex: viewMode === 'both' ? '1 1 50%' : '1', overflow: 'hidden' }}>
          <Dashboard />
        </div>

        {/* Spec Rendering - Secondary View (only in 'both' mode) */}
        {viewMode === 'both' && (
          <div
            style={{
              flex: '1 1 50%',
              padding: 30,
              overflow: 'auto',
              background: '#ffffff',
              borderLeft: '1px solid #e0e0e0'
            }}
          >
            {renderNode(sampleSpec)}
          </div>
        )}

        {/* View Mode Toggle */}
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999
          }}
        >
          <button
            onClick={() => setViewMode(viewMode === 'dashboard' ? 'both' : 'dashboard')}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {viewMode === 'dashboard' ? '👁️ Show Spec' : 'Hide Spec'}
          </button>
        </div>
      </div>
    </RenderTrackerProvider>
  );
}

export default App;
