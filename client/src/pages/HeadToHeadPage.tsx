// import {
//   Container,
//   Flex,
//   ScrollArea,
//   Table,
//   Text,
//   Title,
//   Badge,
//   Card,
//   Accordion,
//   TextInput,
//   Button,
// } from "@mantine/core";
// import { useState } from "react";
// import { useFetchH2H } from "../hooks/useFetchHeadToHead";
// import { IconCircleFilled, IconEqual } from "@tabler/icons-react";
// import { EVENTS, EVENTNAMES } from "../globals/wcaInfo";

// export interface H2HInfo {
//   competitionId: string;
//   eventId: string;
//   roundTypeId: string;
//   pos1: number;
//   pos2: number;
//   winner: number;
// }

// export function HeadToHeadPage() {
//   const [personId1, setPersonId1] = useState("2009zemd01"); // Default ID
//   const [personId2, setPersonId2] = useState("2007valk01"); // Default ID
//   const [submittedId1, setSubmittedId1] = useState(personId1);
//   const [submittedId2, setSubmittedId2] = useState(personId2);

//   const {
//     data: h2hData,
//     isLoading,
//     isError,
//   } = useFetchH2H(submittedId1, submittedId2);

//   const handleFormSubmit = () => {
//     setSubmittedId1(personId1);
//     setSubmittedId2(personId2);
//   };

//   const renderRoundType = (roundTypeId: string) => {
//     const roundMap: Record<string, string> = {
//       "0": "Qualification Round",
//       "1": "First Round",
//       "2": "Second Round",
//       "3": "Semi Final",
//       b: "B Final",
//       c: "Final",
//       d: "First Round",
//       e: "Second Round",
//       f: "Final",
//       g: "Semi Final",
//       h: "Qualification Round",
//     };
//     return roundMap[roundTypeId] || roundTypeId.toUpperCase();
//   };

//   const computeScores = (matches: H2HInfo[]) => {
//     let totalScore1 = 0;
//     let totalScore2 = 0;
//     const eventScores: Record<string, { score1: number; score2: number }> = {};

//     matches?.forEach((match) => {
//       const winner = match.winner;
//       if (!eventScores[match.eventId]) {
//         eventScores[match.eventId] = { score1: 0, score2: 0 };
//       }
//       if (winner === 1) {
//         totalScore1++;
//         eventScores[match.eventId].score1++;
//       } else if (winner === 2) {
//         totalScore2++;
//         eventScores[match.eventId].score2++;
//       } else {
//         totalScore1 += 0.5;
//         totalScore2 += 0.5;
//         eventScores[match.eventId].score1 += 0.5;
//         eventScores[match.eventId].score2 += 0.5;
//       }
//     });

//     return { totalScore1, totalScore2, eventScores };
//   };

//   const { totalScore1, totalScore2, eventScores } = computeScores(
//     (h2hData || []).filter((x) => EVENTS.includes(x.eventId))
//   );

//   return (
//     <Container size="lg" mt="lg">
//       {/* Input Form */}
//       <Flex justify="center" align="center" gap="sm" mb="lg">
//         <TextInput
//           label={
//             <Flex align="center">
//               <IconCircleFilled
//                 size={16}
//                 color="#00D4FF"
//                 style={{ marginRight: "4px" }}
//               />
//               Person 1 ID
//             </Flex>
//           }
//           value={personId1}
//           onChange={(e) => setPersonId1(e.target.value)}
//           placeholder="Enter Person 1 ID"
//         />
//         <TextInput
//           label={
//             <Flex align="center">
//               <IconCircleFilled
//                 size={16}
//                 color="#D4E822"
//                 style={{ marginRight: "4px" }}
//               />
//               Person 2 ID
//             </Flex>
//           }
//           value={personId2}
//           onChange={(e) => setPersonId2(e.target.value)}
//           placeholder="Enter Person 2 ID"
//         />
//         <Button color="teal" onClick={handleFormSubmit}>
//           Fetch Results
//         </Button>
//       </Flex>
//       <br />
//       <br />
//       {isLoading ? (
//         <Text>Loading...</Text>
//       ) : isError ? (
//         <Text color="red">Failed to load data.</Text>
//       ) : (
//         <>
//           {/* Total Score */}
//           <Flex justify="center" align="center" mb="lg">
//             <Card
//               padding="md"
//               // radius="md"
//               style={{
//                 backgroundColor:
//                   totalScore1 > totalScore2
//                     ? "rgba(0, 212, 255, 0.05)" // Transparent blue for Person 1
//                     : totalScore1 < totalScore2
//                     ? "rgba(212, 224, 47, 0.05)" // Transparent yellow for Person 2
//                     : "rgba(192, 192, 192, 0.05)", // Transparent gray for ties
//                 borderLeft:
//                   totalScore1 > totalScore2
//                     ? "4px solid #00D4FF" // Blue border for Person 1
//                     : totalScore1 < totalScore2
//                     ? "4px solid #D4E822" // Yellow border for Person 2
//                     : "4px solid gray", // Gray border for ties
//                 borderRight:
//                   totalScore1 > totalScore2
//                     ? "4px solid #00D4FF" // Blue border for Person 1
//                     : totalScore1 < totalScore2
//                     ? "4px solid #D4E822" // Yellow border for Person 2
//                     : "4px solid gray", // Gray border for ties
//               }}
//             >
//               <h2>
//                 {totalScore1} : {totalScore2}
//               </h2>
//             </Card>
//           </Flex>

//           {/* Results Table with Accordion */}
//           <ScrollArea>
//             <Accordion variant="separated">
//               {Object.keys(eventScores).map((eventId) => {
//                 const eventMatches =
//                   h2hData?.filter((match) => match.eventId === eventId) || [];
//                 const { score1, score2 } = eventScores[eventId];

//                 return (
//                   <Accordion.Item value={eventId} key={eventId}>
//                     <Accordion.Control
//                       style={{
//                         backgroundColor:
//                           score1 > score2
//                             ? "rgba(0, 212, 255, 0.05)" // Transparent blue for Person 1
//                             : score1 < score2
//                             ? "rgba(212, 224, 47, 0.05)" // Transparent yellow for Person 2
//                             : "rgba(192, 192, 192, 0.05)", // Transparent gray for ties
//                         borderLeft:
//                           score1 > score2
//                             ? "4px solid #00D4FF" // Blue border for Person 1
//                             : score1 < score2
//                             ? "4px solid #D4E822" // Yellow border for Person 2
//                             : "4px solid gray", // Gray border for ties
//                       }}
//                     >
//                       <Flex justify="space-between" align="center">
//                         <Title order={6} w={20} style={{ textWrap: "nowrap" }}>
//                           {EVENTNAMES[eventId]}
//                         </Title>
//                         <Text fw={700}>
//                           {score1} : {score2}
//                         </Text>
//                         <Text></Text>
//                       </Flex>
//                     </Accordion.Control>

//                     <Accordion.Panel>
//                       <Table highlightOnHover verticalSpacing="sm">
//                         <Table.Thead>
//                           <Table.Tr>
//                             <Table.Th>Competition</Table.Th>
//                             <Table.Th visibleFrom="sm">Round</Table.Th>
//                             <Table.Th visibleFrom="sm" ta="center">
//                               P1 Place
//                             </Table.Th>
//                             <Table.Th visibleFrom="sm" ta="center">
//                               P2 Place
//                             </Table.Th>
//                             <Table.Th
//                               style={{ textWrap: "nowrap" }}
//                               ta="center"
//                             >
//                               Winner
//                             </Table.Th>
//                           </Table.Tr>
//                         </Table.Thead>

//                         <Table.Tbody>
//                           {eventMatches.map((match, index) => (
//                             <Table.Tr
//                               key={index}
//                               style={{
//                                 backgroundColor:
//                                   match.winner === 1
//                                     ? "rgba(0, 212, 255, 0.05)" // Transparent blue for Person 1
//                                     : match.winner === 2
//                                     ? "rgba(212, 224, 47, 0.05)" // Transparent yellow for Person 2
//                                     : "rgba(192, 192, 192, 0.05)", // Transparent gray for ties
//                                 borderLeft:
//                                   match.winner === 1
//                                     ? "4px solid #00D4FF" // Blue border for Person 1
//                                     : match.winner === 2
//                                     ? "4px solid #D4E822" // Yellow border for Person 2
//                                     : "4px solid gray", // Gray border for ties
//                               }}
//                             >
//                               <Table.Td>
//                                 <Badge color="teal" size="lg">
//                                   {match.competitionId}
//                                 </Badge>
//                               </Table.Td>
//                               <Table.Td visibleFrom="sm">
//                                 {renderRoundType(match.roundTypeId)}
//                               </Table.Td>
//                               <Table.Td visibleFrom="sm" ta="center">
//                                 <Text>{match.pos1}</Text>
//                               </Table.Td>
//                               <Table.Td visibleFrom="sm" ta="center">
//                                 <Text>{match.pos2}</Text>
//                               </Table.Td>
//                               <Table.Td ta="center">
//                                 <Flex justify="center">
//                                   {match.winner === 1 && (
//                                     <Flex align="center">
//                                       <IconCircleFilled
//                                         size={16}
//                                         color="#00D4FF"
//                                         style={{ marginRight: "4px" }}
//                                       />
//                                       <Text
//                                         fw="bold"
//                                         style={{ textWrap: "nowrap" }}
//                                         visibleFrom="xs"
//                                       >
//                                         {personId1.toUpperCase()}
//                                       </Text>
//                                     </Flex>
//                                   )}
//                                   {match.winner === 2 && (
//                                     <Flex align="center">
//                                       <IconCircleFilled
//                                         size={16}
//                                         color="#D4E822"
//                                         style={{ marginRight: "4px" }}
//                                       />
//                                       <Text
//                                         fw="bold"
//                                         style={{ textWrap: "nowrap" }}
//                                         visibleFrom="xs"
//                                       >
//                                         {personId2.toUpperCase()}
//                                       </Text>
//                                     </Flex>
//                                   )}
//                                   {match.winner === 0 && (
//                                     <Flex align="center">
//                                       <IconEqual
//                                         size={16}
//                                         color="gray"
//                                         style={{
//                                           marginRight: "4px",
//                                         }}
//                                       />
//                                       <Text visibleFrom="xs">Tie</Text>
//                                     </Flex>
//                                   )}
//                                 </Flex>
//                               </Table.Td>
//                             </Table.Tr>
//                           ))}
//                         </Table.Tbody>
//                       </Table>
//                     </Accordion.Panel>
//                   </Accordion.Item>
//                 );
//               })}
//             </Accordion>
//           </ScrollArea>
//         </>
//       )}
//     </Container>
//   );
// }
