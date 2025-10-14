// src/cached-requests/getVacancies.ts
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { API_URL } from "../configs";

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
  link?: string | null;
  establishment?: {
    id: number;
    name: string;
    socialLinks?: Record<string, any>;
  };
}

interface PaginatedResponse {
  jobs: Job[];
  hasMore: boolean;
}

const fetchVacancies = async (page: number): Promise<PaginatedResponse> => {
  const res = await fetch(`${API_URL}/api/vacancy?page=${page}&limit=30`);
  if (!res.ok) throw new Error("Failed to fetch vacancies");
  return res.json();
};




export const useVacancy = (page: number) => {

  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["vacancies", page],
    queryFn: () => fetchVacancies(page),
    placeholderData: keepPreviousData, 
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });


  

  if (!query.isPlaceholderData && query.data?.hasMore) {
    const nextKey = ["vacancies", page + 1];
    const nextData = queryClient.getQueryData(nextKey);

    if (!nextData) {
      queryClient.prefetchQuery({
        queryKey: nextKey,
        queryFn: () => fetchVacancies(page + 1),
      });
    }
  }

  return query;
};
