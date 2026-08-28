import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import i18n from "../i18n";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

/**
 * Работа со временем.
 *
 * API отдаёт всё в UTC (ISO 8601 с `Z`) — см. contracts/docs/domain.md, раздел 2.
 * Локализация целиком на клиенте: пользователь видит время своего браузера,
 * а в API уходит исходная UTC-строка, полученная из ответа сервера.
 *
 * Важное правило: обратно в API отправляется **та же строка**, что пришла
 * в слоте. Никаких пересборок даты из компонентов — иначе легко потерять
 * выравнивание по сетке и получить `422 SLOT_NOT_ALIGNED`.
 *
 * Локаль dayjs выставляет i18n (см. i18n/index.ts) при старте и смене языка.
 * Функции ниже читают её на каждый вызов: компоненты, подписанные на смену
 * языка через useTranslation, при перерисовке получают свежие форматы.
 */

/** Часовой пояс браузера, например `Europe/Moscow`. */
export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Смещение от UTC в читаемом виде: `UTC+3`. */
export function timeZoneLabel(): string {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "−";
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

/** `2026-08-17T09:30:00Z` → `12:30` (или `12:30 PM` для en) в местном времени. */
export function formatTime(utcIso: string): string {
  return dayjs(utcIso).format("LT");
}

/** `2026-08-17T09:30:00Z` → `17 августа, понедельник` / `Monday, August 17`. */
export function formatDateLong(utcIso: string | Date): string {
  return dayjs(utcIso).format(i18n.t("dateFormats.long"));
}

/**
 * `2026-08-17T09:30:00Z` → `17.08.2026, 12:30` (ru/de), `08/17/2026, 12:30 PM` (en).
 * Локализованные токены плагина localizedFormat: L — дата, LT — время.
 */
export function formatDateTime(utcIso: string): string {
  return dayjs(utcIso).format("L, LT");
}

/** Интервал встречи одной строкой: `12:30 – 13:00`. */
export function formatRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
}

/** Ключ локального дня `YYYY-MM-DD` — по нему группируются слоты. */
export function localDayKey(value: string | Date): string {
  return dayjs(value).format("YYYY-MM-DD");
}

/** `YYYY-MM-DD` → `Date` в локальной полуночи, для Mantine DatePicker. */
export function dayKeyToDate(dayKey: string): Date {
  return dayjs(dayKey).startOf("day").toDate();
}

/** Слот в том виде, в каком его отдаёт API. */
export interface SlotLike {
  start: string;
  end: string;
}

/** День со слотами. */
export interface SlotDay<T extends SlotLike> {
  /** Локальный день `YYYY-MM-DD`. */
  dayKey: string;
  /** Слоты этого дня, порядок сохраняется как пришёл с сервера. */
  slots: T[];
}

/**
 * Группировка слотов по **локальным** дням.
 *
 * Именно локальным, а не UTC: слот `2026-08-17T22:00:00Z` для гостя из Москвы —
 * это уже 18 августа. Календарь должен показать его на 18-м.
 */
export function groupSlotsByLocalDay<T extends SlotLike>(slots: readonly T[]): SlotDay<T>[] {
  const byDay = new Map<string, T[]>();

  for (const slot of slots) {
    const key = localDayKey(slot.start);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(slot);
    else byDay.set(key, [slot]);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, daySlots]) => ({ dayKey, slots: daySlots }));
}

/** Продолжительность в минутах человеческим текстом: `1 ч 30 мин` / `1 h 30 min`. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return i18n.t("duration.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? i18n.t("duration.hours", { count: hours })
    : i18n.t("duration.hoursMinutes", { hours, minutes: rest });
}
