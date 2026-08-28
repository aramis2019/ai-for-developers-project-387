import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import type { EventTypeCreate } from "../../api/client";
import { useAdminEventTypes, useCreateEventType } from "../../api/queries";
import { constraints } from "../../api/constraints";
import { describeError, isApiError, toFieldErrors } from "../../api/errors";
import { QueryState } from "../../components/QueryState";
import { formatDateTime, formatDuration } from "../../lib/datetime";

/**
 * `/admin/event-types` — типы событий и создание нового.
 *
 * Редактирования и удаления в контракте текущей версии нет
 * (contracts/docs/domain.md, раздел 5), поэтому таблица только для чтения.
 */
export function AdminEventTypesPage() {
  const { t } = useTranslation();
  const { data, isPending, error } = useAdminEventTypes();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>{t("adminEventTypes.title")}</Title>
          <Text c="dimmed" mt={4}>
            {t("adminEventTypes.subtitle")}
          </Text>
        </div>
        <Button onClick={open}>{t("adminEventTypes.create")}</Button>
      </Group>

      <QueryState
        isPending={isPending}
        error={error}
        isEmpty={data?.length === 0}
        emptyTitle={t("adminEventTypes.emptyTitle")}
        emptyText={t("adminEventTypes.emptyText")}
      >
        <Card withBorder radius="md" padding={0}>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("adminEventTypes.thId")}</Table.Th>
                <Table.Th>{t("adminEventTypes.thTitle")}</Table.Th>
                <Table.Th w={120}>{t("adminEventTypes.thDuration")}</Table.Th>
                <Table.Th w={170}>{t("adminEventTypes.thCreated")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.map((eventType) => (
                <Table.Tr key={eventType.id}>
                  <Table.Td>
                    <Text size="sm" ff="monospace">
                      {eventType.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{eventType.title}</Text>
                    {eventType.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {eventType.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDuration(eventType.durationMinutes)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {formatDateTime(eventType.createdAt)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </QueryState>

      <Modal opened={opened} onClose={close} title={t("adminEventTypes.modalTitle")} centered>
        <CreateEventTypeForm onCreated={close} />
      </Modal>
    </Stack>
  );
}

function CreateEventTypeForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation();
  const createEventType = useCreateEventType();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const { eventType: limits } = constraints;

  const form = useForm<EventTypeCreate>({
    initialValues: { id: "", title: "", description: "", durationMinutes: 30 },
    validate: {
      id: (value) => {
        if (!value) return t("adminEventTypes.idRequired");
        if (value.length > limits.idMaxLength) {
          return t("guestForm.tooLong", { max: limits.idMaxLength });
        }
        if (!limits.idPattern.test(value)) {
          return t("adminEventTypes.idPattern");
        }
        return null;
      },
      title: (value) => {
        if (value.trim().length < limits.titleMinLength) {
          return t("adminEventTypes.titleRequired");
        }
        if (value.length > limits.titleMaxLength) {
          return t("guestForm.tooLong", { max: limits.titleMaxLength });
        }
        return null;
      },
      description: (value) =>
        value.length > limits.descriptionMaxLength
          ? t("guestForm.tooLong", { max: limits.descriptionMaxLength })
          : null,
      durationMinutes: (value) => {
        if (value < limits.durationMin || value > limits.durationMax) {
          return t("adminEventTypes.durationRange", {
            min: limits.durationMin,
            max: limits.durationMax,
          });
        }
        return null;
      },
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    setServerErrors({});
    createEventType.mutate(values, {
      onSuccess: (created) => {
        notifications.show({
          color: "green",
          title: t("adminEventTypes.createdTitle"),
          message: `${created.title} — ${formatDuration(created.durationMinutes)}`,
        });
        form.reset();
        onCreated();
      },
      onError: (error) => {
        // Идентификатор задаёт владелец, поэтому конфликт — ошибка конкретного
        // поля, а не общий сбой формы (ADR 0002).
        if (isApiError(error) && error.code === "EVENT_TYPE_ALREADY_EXISTS") {
          form.setFieldError("id", t("adminEventTypes.idTaken"));
          return;
        }

        const fields = toFieldErrors(error);
        setServerErrors(fields);
        if (Object.keys(fields).length === 0) {
          notifications.show({
            color: "red",
            title: t("adminEventTypes.createFailedTitle"),
            message: describeError(error),
          });
        }
      },
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        <TextInput
          label={t("adminEventTypes.idLabel")}
          description={t("adminEventTypes.idDescription")}
          placeholder="intro-call"
          withAsterisk
          maxLength={limits.idMaxLength}
          {...form.getInputProps("id")}
          error={serverErrors["id"] ?? form.errors["id"]}
        />

        <TextInput
          label={t("adminEventTypes.titleLabel")}
          placeholder={t("adminEventTypes.titlePlaceholder")}
          withAsterisk
          maxLength={limits.titleMaxLength}
          {...form.getInputProps("title")}
          error={serverErrors["title"] ?? form.errors["title"]}
        />

        <Textarea
          label={t("adminEventTypes.descriptionLabel")}
          description={t("adminEventTypes.descriptionHint")}
          autosize
          minRows={2}
          maxRows={6}
          maxLength={limits.descriptionMaxLength}
          {...form.getInputProps("description")}
          error={serverErrors["description"] ?? form.errors["description"]}
        />

        <NumberInput
          label={t("adminEventTypes.durationLabel")}
          withAsterisk
          min={limits.durationMin}
          max={limits.durationMax}
          step={5}
          {...form.getInputProps("durationMinutes")}
          error={serverErrors["durationMinutes"] ?? form.errors["durationMinutes"]}
        />

        <Button type="submit" loading={createEventType.isPending} mt="xs">
          {t("adminEventTypes.submit")}
        </Button>
      </Stack>
    </form>
  );
}
