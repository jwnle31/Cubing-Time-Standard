import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { EVENTS } from "../globals/wcaInfo";
import { PERCENTS } from "../globals/appInfo";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/stats/distribution`;
const PERCENTS_STR = PERCENTS.join(",");

const fetchDistribution = async (
  eventId: string,
  type: "single" | "average"
) => {
  const url = `${BASE_URL}/${eventId}/${type}`;
  const response = await axios.get(url, {
    params: { perc: PERCENTS_STR },
  });
  return { eventId, data: response.data };
};

export const useFetchDistribution = (type: "single" | "average") => {
  return useQueries({
    queries: EVENTS.map((eventId) => ({
      queryKey: [`${type}Distribution`, eventId],
      queryFn: () => fetchDistribution(eventId, type),
    })),
  });
};
