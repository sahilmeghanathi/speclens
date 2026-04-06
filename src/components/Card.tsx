export const Card = ({ title, children }: any) => {
  return (
    <div style={{ padding: 20 }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
