function Negado() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000080 0%, #1a1a99 50%, #3333cc 100%)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        color: "#000080",
        padding: "40px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
      }}>
        <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>🚫 Acesso Negado</h1>
        <p style={{ fontSize: "18px" }}>
          Você não tem permissão para acessar esta página.<br />
          Entre em contato com o administrador, se necessário.
        </p>
      </div>
    </div>
  );
}

export default Negado;
