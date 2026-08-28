import { Anchor, AppShell, Badge, Container, Group, Text, Title } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppFooter } from "../components/AppFooter";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { timeZoneLabel } from "../lib/datetime";

/** Публичная часть: шапка с названием и меткой часового пояса гостя. */
export function PublicLayout() {
  const { t } = useTranslation();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="md" h="100%">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" underline="never" c="inherit">
              <Title order={3}>Meetly</Title>
            </Anchor>
            <Group gap="sm">
              {/*
                Всё время в API — UTC. Гостю показываем местное и явно
                подписываем зону, иначе 09:00 UTC выглядит как ошибка.
              */}
              <Badge variant="light" size="sm">
                {t("layout.timeBadge", { tz: timeZoneLabel() })}
              </Badge>
              <Anchor component={Link} to="/admin/bookings" size="sm" c="dimmed">
                {t("layout.adminLink")}
              </Anchor>
              <LanguageSwitcher />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="md" py="lg">
          <Outlet />
        </Container>

        {/* Подсказка про окно записи — внутри Main, как в админском лейауте. */}
        <Container size="md">
          <Text size="xs" c="dimmed" ta="center">
            {t("layout.publicHint")}
          </Text>
        </Container>

        <AppFooter size="md" />
      </AppShell.Main>
    </AppShell>
  );
}
