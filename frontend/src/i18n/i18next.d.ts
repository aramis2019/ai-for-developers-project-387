import "i18next";
import type { en } from "./en";

/**
 * Типизация ключей для t(): автокомплит и ошибка компиляции при опечатке.
 * Эталон — en: у него канонические плюральные суффиксы (_one/_other).
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}
