import { Badge, Card, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useUpcomingBookings } from "../../api/queries";
import { QueryState } from "../../components/QueryState";
import { formatDateLong, formatDuration, formatRange } from "../../lib/datetime";
import { groupSlotsByLocalDay } from "../../lib/datetime";

/**
 * `/admin/bookings` — предстоящие встречи.
 *
 * `GET /api/admin/bookings` отдаёт **единый** список броней всех типов событий,
 * уже отсортированный по `start`. Клиент не пересортировывает: порядок —
 * ответственность сервера. Группировка по дням сделана только для читаемости.
 *
 * Прошедшие встречи в этот эндпоинт не попадают по контракту.
 */
export function AdminBookingsPage() {
  const { t } = useTranslation();
  const { data, isPending, error } = useUpcomingBookings();

  const days = groupSlotsByLocalDay(data ?? []);

  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="baseline">
          <Title order={1}>{t("adminBookings.title")}</Title>
          {data && <Badge variant="light">{data.length}</Badge>}
        </Group>
        <Text c="dimmed" mt={4}>
          {t("adminBookings.subtitle")}
        </Text>
      </div>

      <QueryState
        isPending={isPending}
        error={error}
        isEmpty={data?.length === 0}
        emptyTitle={t("adminBookings.emptyTitle")}
        emptyText={t("adminBookings.emptyText")}
      >
        <Stack gap="lg">
          {days.map((day) => (
            <Card key={day.dayKey} withBorder radius="md" padding="md">
              <Text fw={600} mb="sm">
                {formatDateLong(day.slots[0]!.start)}
              </Text>

              <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={130}>{t("adminBookings.thTime")}</Table.Th>
                    <Table.Th>{t("adminBookings.thEventType")}</Table.Th>
                    <Table.Th>{t("adminBookings.thGuest")}</Table.Th>
                    <Table.Th>{t("adminBookings.thNote")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {day.slots.map((booking) => (
                    <Table.Tr key={booking.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {formatRange(booking.start, booking.end)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDuration(booking.durationMinutes)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{booking.eventTypeTitle}</Text>
                        <Text size="xs" c="dimmed">
                          {booking.eventTypeId}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{booking.guest.name}</Text>
                        <Text size="xs" c="dimmed">
                          {booking.guest.email}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={booking.guest.note ? undefined : "dimmed"}>
                          {booking.guest.note ?? "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          ))}
        </Stack>
      </QueryState>
    </Stack>
  );
}
