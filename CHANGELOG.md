# Changelog

## [0.1.2](https://github.com/aramis2019/ai-for-developers-project-387/compare/v0.1.1...v0.1.2) (2026-08-28)


### Функциональность

* **frontend:** добавить текст для кода INTERNAL_ERROR ([d7749e6](https://github.com/aramis2019/ai-for-developers-project-387/commit/d7749e6cde1d6a4dc3b2487c92f6a5fa71b82473))
* **frontend:** добавить текст для кода INTERNAL_ERROR ([b139d03](https://github.com/aramis2019/ai-for-developers-project-387/commit/b139d03b78c0b5223f81327941131691f262c842))
* **frontend:** интерфейс на четырёх языках — de, en, es, ru ([f3cd0af](https://github.com/aramis2019/ai-for-developers-project-387/commit/f3cd0af1cfb652d4fa3f09962cc66e8e63780dfe))
* **frontend:** футер с версией задеплоенной сборки ([2cffaff](https://github.com/aramis2019/ai-for-developers-project-387/commit/2cffaff1a930b92c85e4e1874c16896ad597c6fb))
* **infra:** перевести прод на хостовый PostgreSQL вместо контейнера ([c96f1e8](https://github.com/aramis2019/ai-for-developers-project-387/commit/c96f1e8c347091d5226358b7ab6565a7ef5fd4e3))


### Исправления

* **ci:** вернуть OPENCODE_API_KEY ([3383317](https://github.com/aramis2019/ai-for-developers-project-387/commit/33833170c8a8f6b009025f6d24d2dd3b41a7eaf4))
* **ci:** использовать OPENAI_API_KEY и модель opencode/claude-sonnet-4 ([f05dff6](https://github.com/aramis2019/ai-for-developers-project-387/commit/f05dff636faf04e0436cc83f27169510a6d345d0))
* **ci:** использовать актуальную модель claude-sonnet-4-6 ([f2f60c0](https://github.com/aramis2019/ai-for-developers-project-387/commit/f2f60c0cd0b17c53fb5982282f545c486bd890e0))
* **ci:** использовать провайдер opencode и актуальную модель gpt-5.3-codex ([597be57](https://github.com/aramis2019/ai-for-developers-project-387/commit/597be570222d1aabf5d1cfee425610088de236f7))
* **ci:** обновить модель до gpt-5.3-codex ([c2d0c0a](https://github.com/aramis2019/ai-for-developers-project-387/commit/c2d0c0a7f6c04cf85205aceeb2a51b1852c62cad))
* **ci:** перезамерить baseline на раннере и учесть холодный старт ([3432ce0](https://github.com/aramis2019/ai-for-developers-project-387/commit/3432ce05d1bed0f86d61173260d8c8e643659bb2))
* **ci:** переключить на anthropic/claude-sonnet-4-5 ([b3b48be](https://github.com/aramis2019/ai-for-developers-project-387/commit/b3b48bee5fd6b52509ac80bdd6c3d653c7897569))
* **ci:** переключить на opencode/gpt-5.6-luna ([ac20896](https://github.com/aramis2019/ai-for-developers-project-387/commit/ac2089664ea2b5377cbae95eb343e339c2c37049))
* **ci:** убрать невалидный префикс opencode/ из имени модели ([065a8c5](https://github.com/aramis2019/ai-for-developers-project-387/commit/065a8c58bfd7f16ab5ea6c4b4fe97fc68778723d))
* **ci:** указать полный ID модели claude-sonnet-4-5-20250929 ([f9ed162](https://github.com/aramis2019/ai-for-developers-project-387/commit/f9ed162a4b1d69bdd5b8eb5b67cb6578a5de9ffd))
* **ci:** указать провайдер openai в имени модели ([a02e499](https://github.com/aramis2019/ai-for-developers-project-387/commit/a02e4995865fae34305d5ea5e274eac2e2c2730f))
* **infra:** передавать пароль в psql через stdin, а не аргументом ([f982102](https://github.com/aramis2019/ai-for-developers-project-387/commit/f982102ccf96a4ba7a8003ce63fddca2a13f05b4))


### Документация

* **ci:** описать назначение opencode-interactive workflow ([155079b](https://github.com/aramis2019/ai-for-developers-project-387/commit/155079b3344e8fd038cfce2c9e9a36ad6080461f))
* сборка в Jenkins запускается только вручную ([d1f0666](https://github.com/aramis2019/ai-for-developers-project-387/commit/d1f0666a746c6a6292e08502985269368a1d0e33))
* уточнить, чем на самом деле запускается сборка в Jenkins ([efdd23d](https://github.com/aramis2019/ai-for-developers-project-387/commit/efdd23db7fe8603ced1a18a7f6bc05d07e7e6e63))


### CI

* добавить workflow инвентаризации TODO/FIXME по расписанию ([7fb5d08](https://github.com/aramis2019/ai-for-developers-project-387/commit/7fb5d0829a7a7f9a8fe6a204bc2448d40d442b6a))
* добавить ночной аудит производительности через Lighthouse ([7572d20](https://github.com/aramis2019/ai-for-developers-project-387/commit/7572d20fbc7a45493c1f2e525fe0a0783f12e98d))
* переименовать opencode workflow и добавить write-права для создания PR ([1b77d8a](https://github.com/aramis2019/ai-for-developers-project-387/commit/1b77d8aa525be5cee3a689fe8c6698e2b8c5140b))

## [0.1.1](https://github.com/aramis2019/ai-for-developers-project-386/compare/v0.1.0...v0.1.1) (2026-08-23)


### CI

* вернуть release-please вместо commit-and-tag-version ([7de2f80](https://github.com/aramis2019/ai-for-developers-project-386/commit/7de2f80b1af4615397021dda743daf470a88ce6a))
* мигрировать с Gitea на GitHub ([77f9a96](https://github.com/aramis2019/ai-for-developers-project-386/commit/77f9a96b7d58c9eef96e3d72f45765c30bc05049))
* разрешить release-please работать от отдельного токена ([815e3da](https://github.com/aramis2019/ai-for-developers-project-386/commit/815e3daad1144e8b2c64bad922c821ee314e28de))
