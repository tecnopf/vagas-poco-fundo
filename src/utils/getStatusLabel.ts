export const getStatusLabel = (status: string) => {
  switch (status) {
    case "opened": return "Aberta";
    case "closed": return "Fechada";
    case "filled": return "Preenchida";
    case "expired": return "Expirada";
    default: return "Todos os status";
  }
};