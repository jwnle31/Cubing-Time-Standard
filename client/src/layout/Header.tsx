import { useState } from "react";
import {
  ActionIcon,
  Anchor,
  Burger,
  Container,
  Drawer,
  Group,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSun, IconMoon } from "@tabler/icons-react";
import cx from "clsx";
import classes from "./Header.module.css";

const links = [
  { link: "/", label: "Distribution", matchType: "exact" },
  { link: "/personal-record", label: "Relative PR", matchType: "startsWith" },
  { link: "/head-to-head", label: "Head to Head", matchType: "startsWith" },
  { link: "/about", label: "About", matchType: "exact" },
];

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(window.location.pathname);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={
        link.matchType === "startsWith"
          ? active.startsWith(link.link) || undefined
          : active === link.link || undefined
      }
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container size="lg" className={classes.inner}>
        <Anchor href="/" className={classes.logo} underline="never">
          <span className={classes.emphasized}>C</span>ubing{" "}
          <span className={classes.emphasized}>T</span>ime{" "}
          <span className={classes.emphasized}>S</span>tandard
        </Anchor>
        <Group gap={5} visibleFrom="sm">
          {items}
          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
          >
            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
          </ActionIcon>
        </Group>

        <Burger
          className={classes.burger}
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
      </Container>

      <Drawer
        opened={opened}
        onClose={toggle}
        position="right"
        size="xs"
        withCloseButton={false}
      >
        <Stack gap={10}>
          {items}
          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
          >
            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
          </ActionIcon>
        </Stack>
      </Drawer>
    </header>
  );
}
