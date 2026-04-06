import { registry } from "./registery";
import type { SpecNode } from "./types";


export function renderNode(node: SpecNode): React.ReactNode {
  const Component = registry[node.type];

  if (!Component) {
    return <div>Unknown component: {node.type}</div>;
  }

  return (
    <Component {...node.props}>
      {node.children?.map((child) => (
        <div key={child.id}>{renderNode(child)}</div>
      ))}
    </Component>
  );
}
