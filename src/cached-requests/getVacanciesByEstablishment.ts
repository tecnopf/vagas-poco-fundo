import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../configs";
import { useAuth } from "../context/AuthContext";

export interface Job {
  id: number;
  title: string;
  description: string;
  status: "opened" | "closed" | "filled" | "expired";
  totalVacancies: number;
  remainingVacancies: number;
  expiration: string | null;
  educationLevel: "none" | "fundamental" | "middle" | "higher" | "incompleteHigher";
  workingHoursPerDay: number;
  createdDate: string;
  link?: string;
  establishment?: {
    id: number;
    name: string;
    socialLinks?: Record<string, any>;
  };
}

const fetchVacancies = async (token: string | null): Promise<Job[]> => {
  if (!token) throw new Error("Unauthorized")

  const res = await fetch(`${API_URL}/api/vacancy/establishment`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  })

  if (res.status === 401) throw new Error("Unauthorized")
  if (!res.ok) throw new Error("Failed to fetch vacancies")

  return res.json()
}

export const useVacancy = () => {
  const { token, authorized } = useAuth();

  return useQuery({
    queryKey: ["vacancy"],
    queryFn: () => fetchVacancies(token), 
    enabled: authorized ? true : false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000    
  });
};
