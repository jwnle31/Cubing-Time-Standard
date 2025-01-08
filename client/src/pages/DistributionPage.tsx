import { Container, ScrollArea, Text } from "@mantine/core";
import PercAvgTable from "../components/tables/PercAvgTable";
import PercSingleTable from "../components/tables/PercSingleTable";
import { useFetchMetadata } from "../hooks/useFetchMetadata";

export function DistributionPage() {
  const { data } = useFetchMetadata();

  return (
    <>
      <Container size="lg" ta="right">
        <Text>
          Last updated:{" "}
          {data ? (
            data[0]["updated_at"].split("T")[0]
          ) : (
            <span>{"\u00A0".repeat(18)}</span>
          )}
        </Text>
      </Container>
      <Container size="lg">
        <h2>Average</h2>
        <ScrollArea>
          <PercAvgTable />
        </ScrollArea>
      </Container>
      <br />
      <Container size="lg">
        <h2>Single</h2>
        <ScrollArea>
          <PercSingleTable />
        </ScrollArea>
      </Container>
      <br />
      <Container size="lg">
        <h2>Acknowledgements</h2>
        <ul>
          <li>
            These data are based on official personal record times from the
            World Cube Association (WCA).
          </li>
          <li>Competition results are owned and managed by the WCA.</li>
        </ul>
      </Container>
    </>
  );
}
