# Pretix Custom Seating Plugin

Плагин для программного создания и отрисовки схем рассадки.

## Структура
*   `management/commands/init_seating.py`: Скрипт генерации схемы и продуктов.
*   `static/pretix_custom_seating/seating.js`: Логика отрисовки SVG.
*   `templates/pretix_custom_seating/plan.html`: Контейнер для карты.
*   `signals.py`: Подключение к фронтенду Pretix.
