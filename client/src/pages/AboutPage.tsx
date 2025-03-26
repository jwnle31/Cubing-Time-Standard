import { Container, Text, Title } from '@mantine/core';

export function AboutPage() {
  return (
    <>
      <Container size="lg" mb="xl">
        <Title>About</Title>
      </Container>
      <Container size="lg" pb="xl">
        <Text size="lg" mb="xl">
          Cubing Time Standard is a tool designed for cubers to track their
          performance across WCA events. The platform aims to provide meaningful
          insights that help cubers set realistic goals and improve their skills
          for official competitions.
        </Text>
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
