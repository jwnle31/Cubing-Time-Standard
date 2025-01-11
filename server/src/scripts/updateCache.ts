import axios from "axios";
import { cache } from "../middlewares/cacheMiddleware";
import { EVENTS } from "../globals/wcaInfo";
import { PERCENTS } from "../globals/appInfo";

const PERCENTS_STR = PERCENTS.join(",");

const endpointTypes = ["single", "average"];

const distributionEndpoints: string[] = EVENTS.flatMap((event) =>
  endpointTypes.map(
    (type) => `/api/stats/distribution/${event}/${type}?perc=${PERCENTS_STR}`
  )
);

const endpoints: string[] = [...distributionEndpoints, "/api/stats/metadata"];

export async function callEndpointsAndCache(): Promise<void> {
  for (const endpoint of endpoints) {
    const url = `${process.env.API_URL}${endpoint}`;

    try {
      console.log(`Calling ${url}...`);
      const response = await axios.get(url, {
        headers: { "X-Internal-Request": "true" },
      });

      cache.set(endpoint, response.data);
      console.log(`Response for ${url} cached successfully.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `Error calling ${url}:`,
          error.response?.status,
          error.response?.data || error.message
        );
      } else {
        console.error(`Unexpected error:`, error);
      }
    }
  }

  console.log("Final cache contents:", cache.keys());
}
