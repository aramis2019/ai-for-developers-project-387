import { Anchor, Container, Divider, Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Версия задеплоенной сборки.
 *
 * Приходит из build-arg `APP_VERSION` докерфайла: Jenkins передаёт туда
 * `<номер сборки>-<короткий sha>`, например `14-efdd23d`. Фронтенд и бэкенд
 * едут в одном образе, поэтому версия образа и есть версия того, что сейчас
 * работает на проде.
 *
 * Здесь `||`, а не `??` как в `api/client.ts`: там пустая строка осмысленна
 * (относительные URL), а пустая версия — нет, её нужно свести к `dev`.
 * Локально и в mock-режиме переменной нет вовсе.
 */
const appVersion = import.meta.env.VITE_APP_VERSION || "dev";

const REPOSITORY_URL = "https://github.com/aramis2019/ai-for-developers-project-387";

type AppFooterProps = {
  /** Ширина контейнера — должна совпадать с контентом лейаута. */
  size: "md" | "lg";
};

/**
 * Общий футер обеих частей приложения.
 *
 * Не `AppShell.Footer`: тот прилипает к низу вьюпорта и постоянно отъедает
 * высоту у календаря. Этот живёт в потоке документа и виден после контента.
 */
export function AppFooter({ size }: AppFooterProps) {
  const { t } = useTranslation();

  return (
    <>
      <Divider mt="xl" />
      <Container size={size} component="footer" py="lg">
        <Group justify="space-between" wrap="wrap" gap="md">
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} Meetly
          </Text>

          <Group gap="lg" wrap="wrap">
            <Anchor component={Link} to="/" size="xs" c="dimmed">
              {t("footer.eventTypes")}
            </Anchor>
            <Anchor component={Link} to="/admin/bookings" size="xs" c="dimmed">
              {t("footer.admin")}
            </Anchor>
            <Anchor href={REPOSITORY_URL} target="_blank" rel="noreferrer" size="xs" c="dimmed">
              GitHub
            </Anchor>
          </Group>

          <Text size="xs" c="dimmed" ff="monospace">
            {t("footer.build", { version: appVersion })}
          </Text>
        </Group>
      </Container>
    </>
  );
}
