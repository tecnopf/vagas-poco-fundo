import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../configs";
import { useAuth } from "../context/AuthContext";

interface SocialLinks {
  facebook?: string
  whatsapp?: string
  instagram?: string
  linkedin?: string
  useAccountEmail?: boolean
}

export interface Profile {
  id: number
  name: string
  cnpj: string
  email: string
  createTime: string
  socialLinks?: SocialLinks
}

const fetchProfile = async (token: string | null): Promise<Profile> => {
  console.log('fetching profile...')
  if (!token) throw new Error("Unauthorized")

  const res = await fetch(`${API_URL}/api/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  })

  if (res.status === 401) throw new Error("Unauthorized")
  if (!res.ok) throw new Error("Failed to fetch profile")

  return res.json()
}

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