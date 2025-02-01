import { Table, Text } from "@mantine/core";
import { EVENTS, EVENTNAMES } from "../../globals/wcaInfo";
import { calculateTealGradient, getTextColor } from "../../utils/color";
import clsx from "clsx";
import styles from "./RelativeRecordTable.module.css";
import type { RelativeRecord } from "../../hooks/useFetchRelativeRecord";

interface RelativeRecordTableProps {
  singleData: RelativeRecord[] | null;
  avgData: RelativeRecord[] | null;
  sortBy: "single" | "average" | "eventId";
  sortDirection: "asc" | "desc";
  onSort: (column: "single" | "average" | "eventId") => void;
}

export const RelativeRecordTable = ({
  singleData,
  avgData,
  sortBy,
  sortDirection,
  onSort,
}: RelativeRecordTableProps) => {
  const renderTableRows = () => {
    const allEventIds = new Set([
      ...(singleData || []).map((r) => r.eventId),
      ...(avgData || []).map((r) => r.eventId),
    ]);

    const sortRows = (rows: any[]) => {
      const getValue = (row: any) => {
        switch (sortBy) {
          case "single":
            return row.singleRr ?? 101;
          case "average":
            return row.avgRr ?? 101;
          case "eventId":
            return EVENTS.indexOf(row.eventId) ?? 101;
          default:
            return Infinity;
        }
      };

      return rows.sort((a, b) => {
        const aValue = getValue(a);
        const bValue = getValue(b);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    };

    let rows = Array.from(allEventIds)
      .filter((eventId) => EVENTS.includes(eventId))
      .map((eventId) => {
        const singleRecord = singleData?.find((r) => r.eventId === eventId);
        const avgRecord = avgData?.find((r) => r.eventId === eventId);

        const singleRr = singleRecord ? singleRecord.pr * 100 : null;
        const avgRr = avgRecord ? avgRecord.pr * 100 : null;

        const singleTextColor = getTextColor(singleRecord?.pr ?? 1);
        const avgTextColor = getTextColor(avgRecord?.pr ?? 1);

        return {
          eventId,
          singleRr,
          avgRr,
          singleTextColor,
          avgTextColor,
          singleBgColor: calculateTealGradient(singleRecord?.pr ?? 1),
          avgBgColor: calculateTealGradient(avgRecord?.pr ?? 1),
        };
      });

    rows = sortRows(rows);

    const isLastRow = (rowIndex: number) => rowIndex === rows.length - 1;
    const isFirstRow = (rowIndex: number) => rowIndex === 0;
    const isLastColumn = (columnIndex: number) =>
      columnIndex === 1 || columnIndex === 2;
    const isFirstColumn = (columnIndex: number) =>
      columnIndex === 1 || columnIndex === 2;

    return rows.map(
      (
        {
          eventId,
          singleRr,
          avgRr,
          singleTextColor,
          avgTextColor,
          singleBgColor,
          avgBgColor,
        },
        rowIndex
      ) => (
        <Table.Tr key={eventId}>
          <Table.Td className={styles.eventCell}>
            {EVENTNAMES[eventId]}
          </Table.Td>
          <Table.Td
            className={clsx(styles.prCell, {
              [styles.firstRowTopLeft]:
                isFirstRow(rowIndex) && isFirstColumn(1),
              [styles.lastRowBottomLeft]:
                isLastRow(rowIndex) && isLastColumn(1),
            })}
            c={singleTextColor}
            bg={singleBgColor}
            style={{
              borderTop: !isFirstRow(rowIndex)
                ? `2px solid ${singleBgColor}`
                : undefined,
              borderBottom: !isLastRow(rowIndex)
                ? `2px solid ${singleBgColor}`
                : undefined,
              borderRight: `2px solid ${singleBgColor}`,
            }}
          >
            {singleRr !== null ? `${singleRr.toFixed(2)}%` : "N/A"}
          </Table.Td>
          <Table.Td
            className={clsx(styles.prCell, {
              [styles.firstRowTopRight]:
                isFirstRow(rowIndex) && isFirstColumn(2),
              [styles.lastRowBottomRight]:
                isLastRow(rowIndex) && isLastColumn(2),
            })}
            c={avgTextColor}
            bg={avgBgColor}
            style={{
              borderTop: !isFirstRow(rowIndex)
                ? `2px solid ${avgBgColor}`
                : undefined,
              borderBottom: !isLastRow(rowIndex)
                ? `2px solid ${avgBgColor}`
                : undefined,
              borderLeft: `2px solid ${avgBgColor}`,
            }}
          >
            {avgRr !== null ? `${avgRr.toFixed(2)}%` : "N/A"}
          </Table.Td>
        </Table.Tr>
      )
    );
  };

  return (
    <Table withRowBorders={false} highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th
            className={`${styles.eventColumn} ${styles.wthcTransparent}`}
            onClick={() => onSort("eventId")}
          >
            Event
            {sortBy === "eventId" && (sortDirection === "asc" ? " ↑" : " ↓")}
          </Table.Th>
          <Table.Th
            className={`${styles.singleColumn} ${styles.wthcTransparent}`}
            onClick={() => onSort("single")}
          >
            Single
            {sortBy === "single" && (sortDirection === "asc" ? " ↑" : " ↓")}
          </Table.Th>
          <Table.Th
            className={`${styles.averageColumn} ${styles.wthcTransparent}`}
            onClick={() => onSort("average")}
          >
            Average
            {sortBy === "average" && (sortDirection === "asc" ? " ↑" : " ↓")}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {renderTableRows().length > 0 ? (
          renderTableRows()
        ) : (
          <Table.Tr>
            <Table.Td colSpan={3}>
              <Text c="red" mt="md">
                No PR records found for this person.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
};
