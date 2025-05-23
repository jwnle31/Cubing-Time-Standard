import { Container, Flex, ScrollArea, Text, Title } from '@mantine/core';
import PercAvgTable from '../components/tables/PercAvgTable';
import PercSingleTable from '../components/tables/PercSingleTable';
import { useFetchUpdateTime } from '../hooks/useFetchUpdateTime';
import { IconInfoCircle } from '@tabler/icons-react';

export function DistributionPage() {
  const { data } = useFetchUpdateTime();

  return (
    <>
      <Container size="lg" mb="xl">
        <Title>Distribution</Title>
      </Container>
      <Container size="lg" pb="xl">
        <Text size="lg">
          These tables show time distributions for WCA events based on personal
          records.
        </Text>
        <ul>
          <li>
            Each cell represents the time (or score) needed to be in a specific
            top % for that event.
          </li>
          <li>
            For example, a time in <b>3x3x3 / 30%</b> means that the person in
            the top 30% of competitors with a valid 3x3 average.
          </li>
          <li>
            Each cell is based on all WCA competitors with at least one
            successful official result in that event.
          </li>
        </ul>
      </Container>

      <Container size="lg" ta="right" mt="xl">
        <Text>
          Last updated:{' '}
          {data ? (
            data[0]['UPDATE_TIME'].split('T')[0]
          ) : (
            <span>{'\u00A0'.repeat(18)}</span>
          )}
        </Text>
      </Container>
      <Container size="lg">
        <h2>Average</h2>
        <ScrollArea>
          <PercAvgTable />
        </ScrollArea>
      </Container>
      <Container size="lg" my="xl">
        <Flex align="center">
          <IconInfoCircle size={12} />
          <Text size="xs">&nbsp;Only successful results are considered.</Text>
        </Flex>
      </Container>
      <br />
      <Container size="lg">
        <h2>Single</h2>
        <ScrollArea>
          <PercSingleTable />
        </ScrollArea>
      </Container>
      <Container size="lg" my="xl">
        <Flex align="center">
          <IconInfoCircle size={12} />
          <Text size="xs">&nbsp;Only successful results are considered.</Text>
        </Flex>
      </Container>
    </>
  );
}
