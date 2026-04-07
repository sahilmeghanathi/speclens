/**
 * This file is deprecated - kept for backwards compatibility.
 * The new 2-row layout uses direct DOM elements instead.
 */

export function EditorPanel({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

export function PreviewPanel({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

export function DevPanel({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

export function ResizeDivider() {
  return null;
}
