import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface PersonalRecord {
  eventId: string;
  pr: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/pr`;

const fetchPr = async (personId: string, type: "single" | "average") => {
  const url = `${BASE_URL}/${personId}/${type}`;
  const response = await axios.get(url);
  return response.data;
};

export const useFetchPr = (personId: string, type: "single" | "average") => {
  return useQuery<PersonalRecord[], Error>({
    queryKey: [`${personId}-${type}-pr`],
    queryFn: () => fetchPr(personId, type),
    enabled: !!personId,
  });
};
