import {
  Container,
  Flex,
  ScrollArea,
  Text,
  Title,
  Card,
  Accordion,
  TextInput,
  Button,
  Grid,
  Center,
  Loader,
} from "@mantine/core";
import { useState, useRef } from "react";
import { useFetchH2H } from "../hooks/useFetchHeadToHead";
import { IconCircleFilled } from "@tabler/icons-react";
import { EVENTS, EVENTNAMES } from "../globals/wcaInfo";
import { MatchTable } from "../components/tables/MatchTable";
import { validateWCAId } from "../utils/validate";
import clsx from "clsx";
import styles from "./HeadToHeadPage.module.css";
import type { H2HInfo } from "../hooks/useFetchHeadToHead";

export function HeadToHeadPage() {
  const personId1Ref = useRef("");
  const personId2Ref = useRef("");
  const [submittedId1, setSubmittedId1] = useState("");
  const [submittedId2, setSubmittedId2] = useState("");
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const searchEnabled = Boolean(submittedId1 && submittedId2);

  const {
    data: h2hData,
    isLoading,
    isError,
  } = useFetchH2H(submittedId1, submittedId2, searchEnabled);

  const handleFormSubmit = () => {
    const error1 = validateWCAId(personId1Ref.current);
    const error2 = validateWCAId(personId2Ref.current);

    setError1(error1);
    setError2(error2);

    if (error1 || error2) return;

    setSubmittedId1(personId1Ref.current); // Set the submitted IDs after validation
    setSubmittedId2(personId2Ref.current);
  };

  const computeScores = (matches: H2HInfo[]) => {
    let totalScore1 = 0;
    let totalScore2 = 0;
    const eventScores: Record<string, { score1: number; score2: number }> = {};

    matches?.forEach((match) => {
      const winner = match.winner;
      if (!eventScores[match.eventId]) {
        eventScores[match.eventId] = { score1: 0, score2: 0 };
      }
      if (winner === 1) {
        totalScore1++;
        eventScores[match.eventId].score1++;
      } else if (winner === 2) {
        totalScore2++;
        eventScores[match.eventId].score2++;
      } else {
        totalScore1 += 0.5;
        totalScore2 += 0.5;
        eventScores[match.eventId].score1 += 0.5;
        eventScores[match.eventId].score2 += 0.5;
      }
    });

    return { totalScore1, totalScore2, eventScores };
  };

  const TotalScoreCard = ({
    totalScore1,
    totalScore2,
  }: {
    totalScore1: number;
    totalScore2: number;
  }) => (
    <Card
      padding="md"
      className={clsx(
        totalScore1 > totalScore2 && styles.cardWinner1,
        totalScore1 < totalScore2 && styles.cardWinner2,
        totalScore1 === totalScore2 && styles.cardTie
      )}
    >
      <h2>
        {totalScore1} : {totalScore2}
      </h2>
    </Card>
  );

  const EventAccordion = ({
    eventScores,
    h2hData,
    personId1,
    personId2,
  }: {
    eventScores: Record<string, { score1: number; score2: number }>;
    h2hData: H2HInfo[];
    personId1: string;
    personId2: string;
  }) => (
    <Accordion variant="separated">
      {Object.keys(eventScores)
        .sort((a, b) => EVENTS.indexOf(a) - EVENTS.indexOf(b))
        .map((eventId) => {
          const eventMatches =
            h2hData?.filter((match) => match.eventId === eventId) || [];
          const { score1, score2 } = eventScores[eventId];

          return (
            <Accordion.Item value={eventId} key={eventId}>
              <Accordion.Control
                className={clsx(
                  score1 > score2 && styles.accordionWinner1,
                  score1 < score2 && styles.accordionWinner2,
                  score1 === score2 && styles.accordionTie
                )}
              >
                <Flex justify="space-between" align="center">
                  <Title order={6} w={20} className={styles.textNoWrap}>
                    {EVENTNAMES[eventId]}
                  </Title>
                  <Text fw="bold">
                    {score1} : {score2}
                  </Text>
                  <Text></Text>
                </Flex>
              </Accordion.Control>
              <Accordion.Panel>
                <MatchTable
                  matches={eventMatches}
                  personId1={personId1}
                  personId2={personId2}
                />
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
    </Accordion>
  );

  const { totalScore1, totalScore2, eventScores } = computeScores(
    (h2hData || []).filter((x) => EVENTS.includes(x.eventId))
  );

  return (
    <Container size="lg" mt="lg">
      <Flex direction="column" mb="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
        >
          <Grid>
            <Grid.Col visibleFrom="xs" span={3} />
            <Grid.Col span={{ base: 6, xs: 3 }}>
              <TextInput
                label={
                  <Flex align="center">
                    <IconCircleFilled
                      size={16}
                      className={`${styles.iconCircle} ${styles.color1}`}
                    />
                    Person 1 ID
                  </Flex>
                }
                defaultValue={personId1Ref.current}
                error={error1}
                onChange={(e) => (personId1Ref.current = e.target.value)}
                placeholder="e.g. 2009ZEMD01"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, xs: 3 }}>
              <TextInput
                label={
                  <Flex align="center">
                    <IconCircleFilled
                      size={16}
                      className={`${styles.iconCircle} ${styles.color2}`}
                    />
                    Person 2 ID
                  </Flex>
                }
                defaultValue={personId2Ref.current}
                error={error2}
                onChange={(e) => (personId2Ref.current = e.target.value)}
                placeholder="e.g. 2007VALK01"
              />
            </Grid.Col>
            <Grid.Col visibleFrom="xs" span={3} />

            <Grid.Col visibleFrom="xs" span={3} />
            <Grid.Col span={{ base: 12, xs: 6 }}>
              <Button color="teal" type="submit" fullWidth>
                Search
              </Button>
            </Grid.Col>
            <Grid.Col visibleFrom="xs" span={3} />
          </Grid>
        </form>
      </Flex>

      <br />
      <br />

      {isLoading && (
        <Center>
          <Loader color="teal" />
        </Center>
      )}

      {isError && (
        <Center>
          <Text c="red">Failed to load data.</Text>
        </Center>
      )}

      {!isLoading && !isError && h2hData && (
        <>
          <Flex justify="center" align="center" mb="lg">
            <TotalScoreCard
              totalScore1={totalScore1}
              totalScore2={totalScore2}
            />
          </Flex>

          <ScrollArea>
            <EventAccordion
              eventScores={eventScores}
              h2hData={h2hData || []}
              personId1={submittedId1}
              personId2={submittedId2}
            />
          </ScrollArea>
        </>
      )}
    </Container>
  );
}
