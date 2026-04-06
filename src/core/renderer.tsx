import { registry } from "./registery";
import type { SpecNode } from "./types";
import { withRenderTracking } from "./withRenderTracking";


export function renderNode(node: SpecNode): React.ReactNode {
  const Component = registry[node.type];

  if (!Component) {
    return <div>Unknown component: {node.type}</div>;
  }

  // Wrap component with render tracking
  const TrackedComponent = withRenderTracking(Component, node.id);

  return (
    <TrackedComponent {...node.props}>
      {node.children?.map((child) => (
        <div key={child.id}>{renderNode(child)}</div>
      ))}
    </TrackedComponent>
  );
}
