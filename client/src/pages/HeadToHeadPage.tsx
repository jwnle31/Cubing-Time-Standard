// import {
//   Container,
//   Flex,
//   ScrollArea,
//   Table,
//   Text,
//   Title,
//   Badge,
//   Group,
//   Card,
//   Accordion,
//   TextInput,
//   Button,
// } from "@mantine/core";
// import { useState } from "react";
// import { IconTrophy } from "@tabler/icons-react";
// import { useFetchH2H } from "../hooks/useFetchHeadToHead";

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
//       "1": "Round 1",
//       "2": "Round 2",
//       "3": "Round 3",
//       f: "Final",
//       d: "Draw",
//     };
//     return roundMap[roundTypeId] || roundTypeId.toUpperCase();
//   };

//   const renderEventName = (eventId: string) => {
//     const eventMap: Record<string, string> = {
//       "333": "3x3 Cube",
//       "444": "4x4 Cube",
//       "555": "5x5 Cube",
//       "666": "6x6 Cube",
//       "777": "7x7 Cube",
//       "222": "2x2 Cube",
//       "333oh": "3x3 One-Handed",
//       "333bf": "3x3 Blindfolded",
//       magic: "Magic",
//       pyram: "Pyraminx",
//       sq1: "Square-1",
//       minx: "Megaminx",
//       "333fm": "Fewest Moves",
//     };
//     return eventMap[eventId] || eventId.toUpperCase();
//   };

//   const computeScores = (matches: typeof h2hData) => {
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
//       }
//     });

//     return { totalScore1, totalScore2, eventScores };
//   };

//   if (isLoading) return <Text align="center">Loading...</Text>;
//   if (isError)
//     return (
//       <Text align="center" color="red">
//         Failed to load data.
//       </Text>
//     );

//   const { totalScore1, totalScore2, eventScores } = computeScores(
//     h2hData || []
//   );

//   return (
//     <Container size="lg" mt="lg">
//       <Title order={2} color="teal" align="center" mb="md">
//         Head-to-Head Results
//       </Title>

//       {/* Input Form */}
//       <Flex justify="center" align="center" gap="sm" mb="lg">
//         <TextInput
//           label="Player 1 ID"
//           value={personId1}
//           onChange={(e) => setPersonId1(e.target.value)}
//           placeholder="Enter Player 1 ID"
//         />
//         <TextInput
//           label="Player 2 ID"
//           value={personId2}
//           onChange={(e) => setPersonId2(e.target.value)}
//           placeholder="Enter Player 2 ID"
//         />
//         <Button color="teal" onClick={handleFormSubmit}>
//           Fetch Results
//         </Button>
//       </Flex>

//       {/* Total Score */}
//       <Flex justify="center" align="center" mb="lg">
//         <Card shadow="sm" padding="md" radius="md" withBorder>
//           <Text align="center" size="xl" weight="bold" color="teal">
//             Total Score: {totalScore1} : {totalScore2}
//           </Text>
//         </Card>
//       </Flex>

//       {/* Results Table with Accordion */}
//       <ScrollArea>
//         <Accordion variant="separated">
//           {Object.keys(eventScores).map((eventId) => {
//             const eventMatches =
//               h2hData?.filter((match) => match.eventId === eventId) || [];
//             const { score1, score2 } = eventScores[eventId];

//             return (
//               <Accordion.Item value={eventId} key={eventId}>
//                 <Accordion.Control>
//                   <Title order={4} color="teal" mb="sm">
//                     {renderEventName(eventId)} - Subscore: {score1} : {score2}
//                   </Title>
//                 </Accordion.Control>
//                 <Accordion.Panel>
//                   <Table highlightOnHover verticalSpacing="sm">
//                     <thead>
//                       <tr>
//                         <th>Competition</th>
//                         <th>Round</th>
//                         <th>Player 1 Position</th>
//                         <th>Player 2 Position</th>
//                         <th>Winner</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {eventMatches.map((match, index) => (
//                         <tr key={index}>
//                           <td>
//                             <Badge color="teal" size="lg">
//                               {match.competitionId}
//                             </Badge>
//                           </td>
//                           <td>{renderRoundType(match.roundTypeId)}</td>
//                           <td>
//                             <Text color="teal">{match.pos1}</Text>
//                           </td>
//                           <td>
//                             <Text color="teal">{match.pos2}</Text>
//                           </td>
//                           <td>
//                             <Group spacing="xs">
//                               <IconTrophy size={16} color="teal" />
//                               <Text
//                                 color={match.winner === 1 ? "teal" : "red"}
//                                 weight="bold"
//                               >
//                                 Player {match.winner}
//                               </Text>
//                             </Group>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </Accordion.Panel>
//               </Accordion.Item>
//             );
//           })}
//         </Accordion>
//       </ScrollArea>
//     </Container>
//   );
// }
