import { Badge, Card, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEventTypes } from "../../api/queries";
import { QueryState } from "../../components/QueryState";
import { formatDuration } from "../../lib/datetime";

/**
 * `/` — виды брони.
 *
 * Источник данных: `GET /api/event-types` (PublicEventType: id, title,
 * description, durationMinutes). Ничего сверх контракта здесь нет.
 */
export function EventTypesPage() {
  const { t } = useTranslation();
  const { data, isPending, error } = useEventTypes();
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>{t("eventTypes.title")}</Title>
        <Text c="dimmed" mt={4}>
          {t("eventTypes.subtitle")}
        </Text>
      </div>

      <QueryState
        isPending={isPending}
        error={error}
        isEmpty={data?.length === 0}
        emptyTitle={t("eventTypes.emptyTitle")}
        emptyText={t("eventTypes.emptyText")}
      >
        <Stack gap="md">
          {data?.map((eventType) => (
            <UnstyledButton
              key={eventType.id}
              onClick={() => navigate(`/book/${eventType.id}`)}
            >
              <Card withBorder padding="lg" radius="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div>
                    <Text fw={600}>{eventType.title}</Text>
                    {eventType.description && (
                      <Text size="sm" c="dimmed" mt={4}>
                        {eventType.description}
                      </Text>
                    )}
                  </div>
                  <Badge variant="light" style={{ flexShrink: 0 }}>
                    {formatDuration(eventType.durationMinutes)}
                  </Badge>
                </Group>
              </Card>
            </UnstyledButton>
          ))}
        </Stack>
      </QueryState>
    </Stack>
  );
}
