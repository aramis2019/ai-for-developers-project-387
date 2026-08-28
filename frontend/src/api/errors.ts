import i18n from "../i18n";
import type { components } from "./schema";

/**
 * Единое тело ошибки, общее для всех эндпоинтов контракта.
 * Ветвиться нужно по `code`, а не по HTTP-статусу и не по тексту `message`
 * — см. contracts/docs/adr/0002-error-status-codes.md.
 */
export type ApiError = components["schemas"]["ErrorBody"];

/**
 * Коды, у которых есть перевод в словарях i18n (секция `errors`).
 * Контрактные коды из TypeSpec плюс пара практических (INTERNAL_ERROR,
 * NOT_FOUND), приходящих через open-ended `string`-ветку union.
 */
const translatedCodes = [
  "SLOT_ALREADY_BOOKED",
  "SLOT_OUT_OF_WINDOW",
  "SLOT_NOT_ALIGNED",
  "SLOT_OUTSIDE_WORKING_HOURS",
  "EVENT_TYPE_NOT_FOUND",
  "EVENT_TYPE_ALREADY_EXISTS",
  "VALIDATION_FAILED",
  "BAD_REQUEST",
  "INTERNAL_ERROR",
  "NOT_FOUND",
] as const;

type TranslatedCode = (typeof translatedCodes)[number];

function isTranslatedCode(code: string): code is TranslatedCode {
  return (translatedCodes as readonly string[]).includes(code);
}

/** Похоже ли значение на тело ошибки контракта. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof (value as ApiError).message === "string"
  );
}

/**
 * Текст для пользователя на текущем языке. Незнакомый код — показываем
 * `message` сервера (он приходит на языке сервера, это осознанное ограничение).
 *
 * Функция читает i18n на каждый вызов: компоненты, подписанные на смену языка
 * через useTranslation, при перерисовке получают текст на новом языке.
 */
export function describeError(error: unknown): string {
  if (!isApiError(error)) return i18n.t("errors.network");
  if (isTranslatedCode(error.code)) {
    // Ключи секции errors совпадают с кодами контракта по построению,
    // поэтому шаблонный литерал даёт точный union существующих ключей.
    return i18n.t(`errors.${error.code}`);
  }
  return error.message;
}

/**
 * Гонка за слот: ввод гостя был корректен, состояние сервера изменилось.
 * Клиент обязан перезапросить слоты, а не просить исправить форму.
 */
export function isSlotConflict(error: unknown): boolean {
  return isApiError(error) && error.code === "SLOT_ALREADY_BOOKED";
}

/**
 * Рассинхрон UI со спекой: слот не выровнен, вне окна или вне рабочих часов.
 * Ввод формы тут ни при чём — надо обновить сетку слотов.
 */
export function isStaleSlot(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.code === "SLOT_OUT_OF_WINDOW" ||
      error.code === "SLOT_NOT_ALIGNED" ||
      error.code === "SLOT_OUTSIDE_WORKING_HOURS")
  );
}

/** Тип события исчез — гостя нужно вернуть к списку. */
export function isEventTypeGone(error: unknown): boolean {
  return isApiError(error) && error.code === "EVENT_TYPE_NOT_FOUND";
}

/**
 * Разбор `details` в ошибки на поля формы.
 *
 * Контракт описывает `details` как свободный `Record<unknown>`: конкретная
 * форма — на совести сервера. Поддерживаются два распространённых варианта:
 *
 *   { "guest.email": "неверный формат" }
 *   { "fields": { "guest.email": "неверный формат" } }
 *
 * Всё, что не разобралось, вернётся пустым объектом — тогда показывается
 * общий текст ошибки.
 */
export function toFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || !error.details) return {};

  const source =
    typeof error.details["fields"] === "object" && error.details["fields"] !== null
      ? (error.details["fields"] as Record<string, unknown>)
      : (error.details as Record<string, unknown>);

  const result: Record<string, string> = {};
  for (const [field, value] of Object.entries(source)) {
    if (typeof value === "string") result[field] = value;
    else if (Array.isArray(value) && typeof value[0] === "string") result[field] = value[0];
  }
  return result;
}
