import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface RelativeRecord {
  eventId: string;
  pr: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/pr`;

const fetchRr = async (personId: string, type: "single" | "average") => {
  const url = `${BASE_URL}/${personId}/${type}`;
  const response = await axios.get(url);
  return response.data;
};

export const useFetchRr = (personId: string, type: "single" | "average") => {
  personId = personId.toUpperCase();
  return useQuery<RelativeRecord[], Error>({
    queryKey: [`${personId}-${type}-Rr`],
    queryFn: () => fetchRr(personId, type),
    enabled: !!personId,
  });
};
