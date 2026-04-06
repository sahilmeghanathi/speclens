export const StatCard = ({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) => {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        minWidth: 200,
      }}
    >
      <p style={{ opacity: 0.6 }}>{label}</p>
      <h2 style={{ margin: "8px 0" }}>{value}</h2>
      <span style={{ color: "limegreen" }}>{change}</span>
    </div>
  );
};
