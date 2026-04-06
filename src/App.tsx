import { renderNode } from "./core/renderer";
import { sampleSpec } from "./specs/sampleSpec";

function App() {
  return <div style={{ padding: 30 }}>{renderNode(sampleSpec)}</div>;
}

export default App;
