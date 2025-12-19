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

const fetchProfile = async (role: string|null): Promise<Profile|null> => {

  if(!role) return null

  const res = await fetch(`${API_URL}/api/${role}/profile/get`, {
    method: "GET",
    credentials: 'include'
  })

  if (res.status === 401) throw new Error("Unauthorized")
  if (!res.ok) throw new Error("Failed to fetch profile")

  return res.json()
}

export const useProfile = () => {
  const { authorized, role } = useAuth()

  return useQuery({
    queryKey: ["profile", role],
    queryFn: () => fetchProfile(role), 
    enabled: authorized ? true : false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000    
  });
};