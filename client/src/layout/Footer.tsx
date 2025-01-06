import { Anchor, Container } from "@mantine/core";
import classes from "./Footer.module.css";
import { IconBrandGithub } from "@tabler/icons-react";

export function Footer() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner} size="lg">
        <Anchor>
          <IconBrandGithub
            className={classes.icon}
            size="2.5rem"
            stroke={1.5}
          />
        </Anchor>
      </Container>
    </div>
  );
}
