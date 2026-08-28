import { Button, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { constraints, emailPattern } from "../../api/constraints";
import type { Guest } from "../../api/client";

interface GuestFormProps {
  disabled: boolean;
  submitting: boolean;
  onSubmit: (guest: Guest) => void;
  /** Ошибки полей, пришедшие от сервера в `ErrorBody.details`. */
  serverErrors: Record<string, string>;
}

/**
 * Контактные данные гостя.
 *
 * Клиентская валидация повторяет границы из контракта (см. api/constraints.ts)
 * ради мгновенной обратной связи. Последнее слово всегда за сервером:
 * его `422 VALIDATION_FAILED` раскладывается по полям через `serverErrors`.
 */
export function GuestForm({ disabled, submitting, onSubmit, serverErrors }: GuestFormProps) {
  const { t } = useTranslation();
  const { guest } = constraints;

  const form = useForm<Guest>({
    initialValues: { name: "", email: "", note: "" },
    validate: {
      name: (value) => {
        if (value.trim().length < guest.nameMinLength) return t("guestForm.nameRequired");
        if (value.length > guest.nameMaxLength) {
          return t("guestForm.tooLong", { max: guest.nameMaxLength });
        }
        return null;
      },
      email: (value) => {
        if (!value.trim()) return t("guestForm.emailRequired");
        if (!emailPattern.test(value)) return t("guestForm.emailInvalid");
        if (value.length > guest.emailMaxLength) {
          return t("guestForm.tooLong", { max: guest.emailMaxLength });
        }
        return null;
      },
      note: (value) =>
        (value?.length ?? 0) > guest.noteMaxLength
          ? t("guestForm.tooLong", { max: guest.noteMaxLength })
          : null,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      // Пустой комментарий не отправляем: поле в контракте необязательное.
      ...(values.note?.trim() ? { note: values.note.trim() } : {}),
    });
  });

  return (
    // noValidate отключает встроенную проверку браузера: иначе на `type="email"`
    // Chrome перехватывает отправку раньше Mantine и показывает собственное
    // сообщение на языке браузера вместо наших локализованных текстов.
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="sm">
        <TextInput
          label={t("guestForm.nameLabel")}
          placeholder={t("guestForm.namePlaceholder")}
          withAsterisk
          disabled={disabled}
          maxLength={guest.nameMaxLength}
          {...form.getInputProps("name")}
          error={serverErrors["guest.name"] ?? form.errors["name"]}
        />

        <TextInput
          label={t("guestForm.emailLabel")}
          placeholder={t("guestForm.emailPlaceholder")}
          type="email"
          withAsterisk
          disabled={disabled}
          maxLength={guest.emailMaxLength}
          {...form.getInputProps("email")}
          error={serverErrors["guest.email"] ?? form.errors["email"]}
        />

        <Textarea
          label={t("guestForm.noteLabel")}
          description={t("guestForm.noteDescription")}
          autosize
          minRows={2}
          maxRows={6}
          disabled={disabled}
          maxLength={guest.noteMaxLength}
          {...form.getInputProps("note")}
          error={serverErrors["guest.note"] ?? form.errors["note"]}
        />

        <Button type="submit" disabled={disabled} loading={submitting} mt="xs">
          {t("guestForm.submit")}
        </Button>
      </Stack>
    </form>
  );
}
