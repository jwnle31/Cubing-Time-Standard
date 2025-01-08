import { Skeleton, Table } from "@mantine/core";
import { EVENTS, EVENTNAMES } from "../../globals/wcaInfo";
import { PERCENTS } from "../../globals/appInfo";
import { formatTime, process333mbfData } from "../../utils/dataFormat";
import { useFetchDistribution } from "../../hooks/useFetchDistribution";
import classes from "./PercTable.module.css";

export default function PercSingleTable() {
  const queries = useFetchDistribution("single");
  const isError = queries.some((query) => query.isError);
  const percs = queries.map((query) => query.data);

  if (isError) return <p>Error fetching data.</p>;

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={classes.sticky}>Event</Table.Th>
          {PERCENTS.map((perc: number) => (
            <Table.Th key={perc}>{perc + "%"}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {EVENTS.map((eventId, index) => {
          let result = percs[index];
          return (
            <Table.Tr key={eventId}>
              <Table.Td className={classes.sticky}>
                {EVENTNAMES[eventId]}
              </Table.Td>
              {PERCENTS.map((perc, percIndex) => (
                <Table.Td key={perc}>
                  <Skeleton visible={!result}>
                    {result?.data[percIndex]
                      ? eventId === "333fm"
                        ? result.data[percIndex].best
                        : eventId === "333mbf"
                        ? process333mbfData(result.data[percIndex].best).solved
                        : formatTime(result.data[percIndex].best)
                      : "placeho"}
                  </Skeleton>
                </Table.Td>
              ))}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
