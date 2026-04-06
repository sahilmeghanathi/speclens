export const Grid = ({
  columns = 3,
  children,
}: {
  columns?: number;
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
      }}
    >
      {children}
    </div>
  );
};
