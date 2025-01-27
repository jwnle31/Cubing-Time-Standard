import { Table, Badge, Text, Flex } from "@mantine/core";
import { IconCircleFilled, IconEqual } from "@tabler/icons-react";
import styles from "./MatchTable.module.css";
import type { H2HInfo } from "../../hooks/useFetchHeadToHead";

interface MatchTableProps {
  matches: H2HInfo[];
  personId1: string;
  personId2: string;
}

export function MatchTable({ matches, personId1, personId2 }: MatchTableProps) {
  return (
    <Table highlightOnHover verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Competition</Table.Th>
          <Table.Th visibleFrom="sm">Round</Table.Th>
          <Table.Th visibleFrom="sm" ta="center">
            P1 Place
          </Table.Th>
          <Table.Th visibleFrom="sm" ta="center">
            P2 Place
          </Table.Th>
          <Table.Th className={styles.textNoWrap} ta="center">
            Winner
          </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {matches.map((match, index) => (
          <Table.Tr
            key={index}
            className={
              match.winner === 1
                ? styles.rowWinner1
                : match.winner === 2
                ? styles.rowWinner2
                : styles.rowTie
            }
          >
            <Table.Td>
              <Badge color="teal" size="lg">
                {match.competitionId}
              </Badge>
            </Table.Td>
            <Table.Td visibleFrom="sm">{match.roundTypeId}</Table.Td>
            <Table.Td visibleFrom="sm" ta="center">
              <Text>{match.pos1}</Text>
            </Table.Td>
            <Table.Td visibleFrom="sm" ta="center">
              <Text>{match.pos2}</Text>
            </Table.Td>
            <Table.Td ta="center">
              <Flex justify="center">
                {match.winner === 1 && (
                  <Flex align="center">
                    <IconCircleFilled
                      size={16}
                      className={`${styles.iconCircle} ${styles.color1}`}
                    />
                    <Text fw="bold" visibleFrom="xs">
                      {personId1.toUpperCase()}
                    </Text>
                  </Flex>
                )}
                {match.winner === 2 && (
                  <Flex align="center">
                    <IconCircleFilled
                      size={16}
                      className={`${styles.iconCircle} ${styles.color2}`}
                    />
                    <Text fw="bold" visibleFrom="xs">
                      {personId2.toUpperCase()}
                    </Text>
                  </Flex>
                )}
                {match.winner === 0 && (
                  <Flex align="center">
                    <IconEqual
                      size={16}
                      className={`${styles.iconCircle} ${styles.colorTie}`}
                    />
                    <Text fw="bold" visibleFrom="xs">
                      Tie
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
