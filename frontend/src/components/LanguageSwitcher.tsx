import { Button, Menu } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../i18n";

/**
 * Переключатель языка интерфейса.
 *
 * Выбор сохраняется в localStorage (ключ meetly-language) детектором i18next
 * и переживает перезагрузку. До первого явного выбора язык берётся из браузера.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? "en";

  return (
    <Menu position="bottom-end" width={160}>
      <Menu.Target>
        {/* Код языка вместо названия: компактно и одинаково по ширине. */}
        <Button variant="subtle" size="compact-sm" c="dimmed" aria-label="Language">
          {current.toUpperCase()}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {supportedLanguages.map((lang) => (
          <Menu.Item
            key={lang.code}
            onClick={() => void i18n.changeLanguage(lang.code)}
            fw={lang.code === current ? 600 : undefined}
          >
            {lang.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
