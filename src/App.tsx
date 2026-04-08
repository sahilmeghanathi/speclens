import { useEffect } from "react";
import { RenderTrackerProvider } from "./core/RenderTrackerProvider";
import { tracker } from "./core/renderTracker";
import { Dashboard } from "./components";
import { SpecEditor } from "./components/SpecEditor";

function App() {
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
        <SpecEditor />
        <div style={{ display: 'flex', height: '100vh', width: '100%', flexDirection: 'row' }}>
          <div style={{ flex:  '1', overflow: 'hidden' }}>
            <Dashboard />
          </div>
        </div>
    </RenderTrackerProvider>
  );
}

export default App;
