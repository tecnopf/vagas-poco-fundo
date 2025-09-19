import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../configs";
import { useAuth } from "../context/AuthContext";

const fetchProfile = async (token: string|null): Promise<any> => {
  console.log('token in fetch: ', token)
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/api/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Failed to fetch profile");

  return res.json();
};

export const useProfile = () => {
  const { token, authorized } = useAuth()

  return useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(token), 
    enabled: authorized ? true : false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000    
  });
};