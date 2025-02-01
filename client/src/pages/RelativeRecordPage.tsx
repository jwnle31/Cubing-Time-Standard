import { useState, useEffect } from "react";
import {
  Container,
  Text,
  TextInput,
  Button,
  Loader,
  Center,
  Flex,
  Title,
} from "@mantine/core";
import { useFetchRr } from "../hooks/useFetchRelativeRecord";
import { RelativeRecordTable } from "../components/tables/RelativeRecordTable";
import { calculateTealGradient } from "../utils/color";
import { IconInfoCircle } from "@tabler/icons-react";
import styles from "./RelativeRecordPage.module.css";
import { validateWCAId } from "../utils/validate";
import { useParams, useNavigate } from "react-router-dom";

export function RelativeRecordPage() {
  const { personId: initialPersonId } = useParams();
  const navigate = useNavigate();

  const validationError = initialPersonId
    ? validateWCAId(initialPersonId)
    : null;

  const [personId, setPersonId] = useState<string>(initialPersonId || "");
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"single" | "average" | "eventId">(
    "eventId"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(validationError);

  const {
    data: singleData,
    isLoading: isLoadingSingle,
    isError: isErrorSingle,
  } = useFetchRr(currentPersonId || "", "single");

  const {
    data: avgData,
    isLoading: isLoadingAvg,
    isError: isErrorAvg,
  } = useFetchRr(currentPersonId || "", "average");

  useEffect(() => {
    setPersonId(initialPersonId || "");
    if (initialPersonId) {
      setCurrentPersonId(validationError ? null : initialPersonId);
    }
  }, [initialPersonId, validationError]);

  const handleSort = (column: "single" | "average" | "eventId") => {
    const isSameColumn = sortBy === column;
    const newDirection =
      isSameColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortDirection(newDirection);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateWCAId(personId);
    setError(validationError);
    if (validationError) return;
    setCurrentPersonId(personId);
    navigate(`/personal-record/${personId.toUpperCase()}`);
  };

  return (
    <>
      <Container size="lg">
        <Title>Relative PR</Title>
      </Container>
      <Container size="lg" mt="xl">
        <form onSubmit={handleFormSubmit}>
          <Container size="xs" mb="xl" px="0" className={styles.inputContainer}>
            <TextInput
              placeholder="e.g. 2009ZEMD01"
              label="WCA ID"
              value={personId}
              onChange={(e) => setPersonId(e.currentTarget.value)}
              mb="xs"
              size="md"
              error={error}
            />
            <Button
              type="submit"
              disabled={!personId.trim()}
              color="teal"
              size="md"
              mb="md"
              fullWidth
            >
              Search
            </Button>
          </Container>
        </form>

        {(isLoadingSingle || isLoadingAvg) && (
          <Center mt="md">
            <Loader color="teal" />
          </Center>
        )}

        {(isErrorSingle || isErrorAvg) && (
          <Text c="red" mt="md">
            Failed to fetch data. Please check the ID.
          </Text>
        )}

        {!isLoadingSingle &&
          !isErrorSingle &&
          singleData &&
          !isLoadingAvg &&
          !isErrorAvg &&
          avgData &&
          initialPersonId && (
            <RelativeRecordTable
              singleData={singleData}
              avgData={avgData}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}

        <Container size="lg" my="xl" p="0">
          <Text size="sm" mb="xs">
            Gradient Scale:
          </Text>
          <Container
            size="lg"
            className={styles.gradientScale}
            bg={`linear-gradient(to right in hsl, ${calculateTealGradient(
              0.001
            )}, ${calculateTealGradient(0.999)})`}
          />
          <Text size="xs" mt="xs">
            Top 0% (White) | Top 100% (Black)
          </Text>
        </Container>
        <Container size="lg" my="xl" p="0">
          <Flex align="center">
            <IconInfoCircle size={12} />
            <Text size="xs">&nbsp;Only successful results are considered.</Text>
          </Flex>
        </Container>
      </Container>
    </>
  );
}
