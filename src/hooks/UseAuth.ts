import { useEffect, useState } from "react";

export const useAuth = () => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) setAuthorized(true);
    else setAuthorized(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("jwt", token);
    setAuthorized(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setAuthorized(false);
  };

  return { authorized, login, logout };
};
