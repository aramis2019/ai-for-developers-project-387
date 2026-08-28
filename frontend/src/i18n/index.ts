import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/de";
import "dayjs/locale/es";
import { ru } from "./ru";
import { en } from "./en";
import { de } from "./de";
import { es } from "./es";

/** Поддерживаемые языки. Порядок определяет список в переключателе. */
export const supportedLanguages = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];

/**
 * Определение языка: сначала явный выбор пользователя (localStorage),
 * затем язык браузера. Для языков вне списка — английский: показывать
 * французу русский интерфейс хуже, чем английский.
 *
 * `load: "languageOnly"` схлопывает региональные варианты: de-AT → de.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      de: { translation: de },
      es: { translation: es },
    },
    supportedLngs: supportedLanguages.map((lang) => lang.code),
    fallbackLng: "en",
    load: "languageOnly",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "meetly-language",
    },
    interpolation: {
      // React экранирует значения сам — двойное экранирование ломало бы кавычки.
      escapeValue: false,
    },
  });

/**
 * Локаль dayjs и атрибут lang держатся в одном месте — здесь.
 * dayjs.locale глобальна и не реактивна: компоненты перерисуются сами,
 * потому что подписаны на смену языка через useTranslation.
 */
function syncLocale(lng: string) {
  dayjs.locale(lng);
  document.documentElement.lang = lng;
}

syncLocale(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", syncLocale);

export default i18n;
