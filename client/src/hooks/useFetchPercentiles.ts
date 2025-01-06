import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { EVENTS } from "../globals/wcaInfo";
import { PERCENTILES } from "../globals/appInfo";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/percentiles`;
const PERCENTILES_STR = PERCENTILES.join(",");

const fetchPercentiles = async (
  eventId: string,
  type: "single" | "average"
) => {
  const url = `${BASE_URL}/${eventId}/${type}`;
  const response = await axios.get(url, {
    params: { perc: PERCENTILES_STR },
  });
  return { eventId, data: response.data };
};

export const useFetchPercentiles = (type: "single" | "average") => {
  return useQueries({
    queries: EVENTS.map((eventId) => ({
      queryKey: [`${type}Percentiles`, eventId],
      queryFn: () => fetchPercentiles(eventId, type),
    })),
  });
};
