# Реализация кастомной рассадки (Custom Seating)

## Проблема
В Pretix Community Edition отсутствует визуальный редактор схем рассадки и JS-модуль для их отрисовки на фронтенде (это функции Enterprise версии).

## Решение
Мы реализовали собственный плагин `pretix-custom-seating`, который использует штатные механизмы расширения Pretix для восстановления этой функциональности.

### Архитектура
1.  **Бэкенд (Создание схемы):**
    *   Используется Management Command: `pretix init_seating`.
    *   Файл: `plugins/pretix-custom-seating/.../management/commands/init_seating.py`.
    *   Логика: Генерирует JSON-структуру схемы, создает объекты `SeatingPlan`, `Item` (Билет), `Quota` и связывает их.

2.  **Фронтенд (Отрисовка):**
    *   Используется сигнал `render_seating_plan` из `pretix.presale.signals`.
    *   Файл: `plugins/pretix-custom-seating/.../signals.py`.
    *   Логика: Перехватывает запрос на отрисовку схемы и возвращает наш HTML-шаблон.

3.  **Рендеринг (SVG):**
    *   Кастомный JS-скрипт парсит JSON схемы и рисует SVG карту "на лету".
    *   Файл: `static/pretix_custom_seating/seating.js`.
    *   Особенности: Скрипт подключен как внешний статический файл для обхода CSP (Content Security Policy).

### Как использовать
1.  **Сборка:**
    ```bash
    docker compose build pretix
    docker compose up -d
    ```

2.  **Инициализация (при первом запуске или изменении схемы):**
    ```bash
    docker compose exec pretix pretix init_seating
    ```

3.  **Активация:**
    *   Убедитесь, что плагин **Custom Seating Helper** включен в настройках события (Settings -> Plugins).
    *   Убедитесь, что событие активно (Live).

### Структура JSON
Схема рассадки задается в `init_seating.py` в переменной `layout_data`.
