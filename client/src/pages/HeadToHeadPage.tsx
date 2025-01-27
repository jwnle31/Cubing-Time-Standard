import { useState, useEffect } from "react";
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
import { useFetchH2H } from "../hooks/useFetchHeadToHead";
import { IconCircleFilled } from "@tabler/icons-react";
import { EVENTS, EVENTNAMES } from "../globals/wcaInfo";
import { MatchTable } from "../components/tables/MatchTable";
import { validateWCAId } from "../utils/validate";
import clsx from "clsx";
import styles from "./HeadToHeadPage.module.css";
import type { H2HInfo } from "../hooks/useFetchHeadToHead";
import { useParams, useNavigate } from "react-router-dom";

export function HeadToHeadPage() {
  const { personId1: urlPersonId1, personId2: urlPersonId2 } = useParams();
  const navigate = useNavigate();

  const validationError1 = urlPersonId1 ? validateWCAId(urlPersonId1) : null;
  const validationError2 = urlPersonId2 ? validateWCAId(urlPersonId2) : null;

  const [personId1, setPersonId1] = useState<string>(urlPersonId1 || "");
  const [personId2, setPersonId2] = useState<string>(urlPersonId2 || "");
  const [submittedId1, setSubmittedId1] = useState<string | null>(null);
  const [submittedId2, setSubmittedId2] = useState<string | null>(null);
  const [error1, setError1] = useState<string | null>(validationError1);
  const [error2, setError2] = useState<string | null>(validationError2);

  const {
    data: h2hData,
    isLoading,
    isError,
  } = useFetchH2H(submittedId1 || "", submittedId2 || "");

  useEffect(() => {
    setPersonId1(urlPersonId1 || "");
    setPersonId2(urlPersonId2 || "");
    if (urlPersonId1 && urlPersonId2) {
      setSubmittedId1(validationError1 ? null : urlPersonId1);
      setSubmittedId2(validationError2 ? null : urlPersonId2);
    }
  }, [urlPersonId1, urlPersonId2, validationError1, validationError2]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError1 = validateWCAId(personId1);
    const validationError2 = validateWCAId(personId2);

    setError1(validationError1);
    setError2(validationError2);

    if (validationError1 || validationError2) return;

    setSubmittedId1(personId1);
    setSubmittedId2(personId2);

    navigate(
      `/head-to-head/${personId1.toUpperCase()}/${personId2.toUpperCase()}`
    );
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
    <Container size="lg">
      <Title>Head to Head</Title>
      <Container size="lg" mt="xl">
        <Flex direction="column" mb="lg">
          <form onSubmit={handleFormSubmit}>
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
                  value={personId1}
                  onChange={(e) => setPersonId1(e.target.value)}
                  error={error1}
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
                  value={personId2}
                  onChange={(e) => setPersonId2(e.target.value)}
                  error={error2}
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
        {isLoading ? (
          <Center>
            <Loader color="teal" />
          </Center>
        ) : isError ? (
          <Center>
            <Text c="red">Failed to load data.</Text>
          </Center>
        ) : (
          h2hData &&
          urlPersonId1 &&
          urlPersonId2 &&
          submittedId1 &&
          submittedId2 && (
            <>
              <Flex justify="center" align="center" mt="xl" pt="xl" mb="lg">
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
          )
        )}
      </Container>
    </Container>
  );
}
