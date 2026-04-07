import { useEffect, useState } from "react";
import { renderNode } from "./core/renderer";
import { sampleSpec } from "./specs/sampleSpec";
import { RenderTrackerProvider } from "./core/RenderTrackerProvider";
import { tracker } from "./core/renderTracker";
import { Dashboard } from "./components";
import { SpecEditor } from "./components/SpecEditor";

function App() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'both' | 'spec-editor'>('dashboard');

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
      {/* {viewMode === 'spec-editor' ? ( */}
      
        <SpecEditor />
      {/* // ) : ( */}
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
                background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 100%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
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
              zIndex: 9999,
              display: 'flex',
              gap: '8px'
            }}
          >
            <button
              onClick={() => setViewMode('spec-editor')}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #a78bfa, #f97316)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(169, 139, 250, 0.4)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                (e.target as HTMLElement).style.boxShadow = '0 6px 24px rgba(169, 139, 250, 0.6)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)';
                (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(169, 139, 250, 0.4)';
              }}
            >
              ✏️ Editor
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'dashboard' ? 'both' : 'dashboard')}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(96, 165, 250, 0.4)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(-3px)';
                (e.target as HTMLElement).style.boxShadow = '0 6px 24px rgba(96, 165, 250, 0.6)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'translateY(0)';
                (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(96, 165, 250, 0.4)';
              }}
            >
              {viewMode === 'dashboard' ? '👁️ Show Spec' : 'Hide Spec'}
            </button>
          </div>

        </div>
      {/* )} */}
    </RenderTrackerProvider>
  );
}

export default App;
