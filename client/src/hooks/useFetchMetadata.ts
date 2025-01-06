import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Metadata {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/metadata`;

const fetchMetadata = async (): Promise<Metadata[]> => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const useFetchMetadata = () => {
  return useQuery<Metadata[], Error>({
    queryKey: ["metadata"],
    queryFn: fetchMetadata,
  });
};
