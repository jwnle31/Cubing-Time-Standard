import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface H2HInfo {
  competitionId: string;
  eventId: string;
  roundTypeId: string;
  pos1: number;
  pos2: number;
  winner: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/h2h`;

const fetchH2H = async (personId1: string, personId2: string) => {
  const url = `${BASE_URL}/${personId1}/${personId2}`;
  const response = await axios.get(url);
  return response.data;
};

export const useFetchH2H = (personId1: string, personId2: string) => {
  return useQuery<H2HInfo[], Error>({
    queryKey: [`${personId1}-${personId2}-h2h`],
    queryFn: () => fetchH2H(personId1, personId2),
  });
};
