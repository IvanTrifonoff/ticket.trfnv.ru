# Реализация интерактивной схемы рассадки для Pretix

## Обзор
Этот документ описывает успешную реализацию интерактивного выбора мест (Seating Plan) для Community Edition версии Pretix. Реализация включает в себя бэкенд-генерацию мест и фронтенд-компоненты для отображения и взаимодействия.

## Архитектура

### 1. Бэкенд (Python)
Файл: `plugins/pretix-custom-seating/pretix_custom_seating/management/commands/init_seating.py`

*   **Задача:** Инициализация события, создание схемы рассадки, товаров (Items) и генерация объектов мест (Seats) в базе данных.
*   **Ключевые моменты:**
    *   Создается JSON-структура схемы с зонами, рядами и местами.
    *   Для каждого места генерируется уникальный `seat_guid` (формат `row-number`) и привязывается `item_id`.
    *   Используется `SeatingPlan.objects.get_or_create` для сохранения схемы.
    *   **Важно:** Вызывается `generate_seats(event, None, plan, mapping_dict)` из `pretix.base.services.seating`. Это критический шаг, который создает физические записи в таблице `pretix_base_seat`, необходимые для работы корзины. Без этого шага валидация корзины не проходит.

### 2. Фронтенд (HTML/JS/CSS)

#### Шаблон
Файл: `plugins/pretix-custom-seating/pretix_custom_seating/templates/pretix_custom_seating/plan.html`

*   Содержит контейнер для схемы и SVG-элемент.
*   Использует фильтр `{{ layout_json|json_script:"seating-data" }}` для безопасной передачи JSON-данных из Django в JavaScript. Это предотвращает проблемы с кавычками и XSS.
*   Подключает статические файлы CSS и JS.

#### Стилизация
Файл: `plugins/pretix-custom-seating/pretix_custom_seating/static/pretix_custom_seating/seating.css`

*   Содержит все стили для схемы.
*   Использование отдельного CSS-файла вместо инлайн-стилей необходимо для соблюдения Content Security Policy (CSP), которая запрещает `unsafe-inline` стили.

#### Логика
Файл: `plugins/pretix-custom-seating/pretix_custom_seating/static/pretix_custom_seating/seating.js`

*   Парсит JSON-данные из тега скрипта.
*   Рендерит SVG-кружки для мест.
*   **Добавление в корзину:**
    *   При клике отправляет AJAX POST-запрос на endpoint `/cart/add`.
    *   **Параметры запроса:**
        *   `csrfmiddlewaretoken`: Токен CSRF.
        *   `seat_{item_id}`: Значение `seat_guid`. Это специфический формат параметра, который ожидает Pretix для добавления конкретного места. Стандартный `item_{id}=1` здесь не подходит.
    *   При успехе перезагружает страницу для обновления виджета корзины.

## Процесс развертывания
Изменения требуют пересборки Docker-контейнера, так как плагин устанавливается в `site-packages` образа.

1.  Обновление файлов плагина.
2.  `docker compose up -d --build pretix`
3.  `docker exec -it pretix-fork-pretix-1 pretix init_seating` (для генерации/обновления мест в БД).

## Решенные проблемы
1.  **Ошибка "Пожалуйста, выберите действительное место":**
    *   *Причина:* Отсутствовали объекты `Seat` в базе данных (была только JSON-схема), и использовались неверные параметры POST-запроса.
    *   *Решение:* Добавлен вызов `generate_seats` в скрипт инициализации и исправлен формат параметров в JS (`seat_<id>=<guid>`).
2.  **Ошибка парсинга JSON:**
    *   *Причина:* Прямой вывод `{{ layout_json }}` приводил к использованию одинарных кавычек Python.
    *   *Решение:* Использование `json_script`.
3.  **Ошибки CSP (Refused to apply stylesheet):**
    *   *Причина:* Инлайн-стили в JS и HTML.
    *   *Решение:* Вынос всех стилей в `seating.css` и использование классов.
