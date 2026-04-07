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
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(96, 165, 250, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: 200,
      }}
    >
      <p style={{ opacity: 0.6, color: "#94a3b8", marginBottom: 8 }}>{label}</p>
      <h2 style={{ margin: "8px 0", color: "#f1f5f9" }}>{value}</h2>
      <span style={{ color: "#10b981", fontWeight: 600 }}>{change}</span>
    </div>
  );
};
