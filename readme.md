# Подготовка
Для начала следует создать ключи для подключения к Google Таблицам. 

### Создание ключей Google API
- Для этого нужно перейти по ссылке https://console.cloud.google.com/
- Нажмите на клавиатуре на кнопку "." и в появившемся меню выберите "APIs & Services", создайте проект если треубуется
- Далее выберите пункт "Enable APIs and services" и в поисковой строке найдите "Google Sheets API" и добавьте его
- Перейдите во вкладку "Credentials", нажите на "Create credentials" и выберите пункт "Service Account"
- Задайте имя аккаунта, нажмите "Done"
- На странице, на которую вас перенесло сохраните Email в из таблице Service Accounts, нажмите на этот Email
- Прокрутите вних страницы, нажмите "Create key", выберите формат JSON
- **Переименуйте сохранённый файл в "credentials.json" и положите его в корневую папку проекта**
- Зайдите на Google Таблицу, с которой будет взаимодействовать проект и предоставьте доступ пользователю с сохранённым ранее Email, дав ему права редактора

### Добавление таблиц
- Чтобы добавить таблицу, перед запуском проекта отредактируйте файл  "src/postgres/seeds/spreadsheets.js", заменив существующие входные данные формата { spreadsheet_id: "ID таблицы" }, (ID таблицы берйтся из ссылки https://docs.google.com/spreadsheets/d/**<ID таблицы>**/edit?gid=#gid=)
- Либо когда проект уже запущен, вы можете открыть базу данных Postgres (данные для подключения указаны в .env файле) (например через pgAdmin) и внести изменения в таблицу "spreadsheets", установив значение единственного поля любой записи равным ID вашей таблицы 
### Подключение к эндпоинту
- **Переименуйте файл example.env в просто .env**
- Чтобы подключится к эндпоинту ```https://common-api.wildberries.ru/api/v1/tariffs/box``` вам нужно добавить в переменную API_KEY файла .env ваш API ключ для подключения к данному эндпоинту
- Также в .env файле, вы можете регулировать частоту обновления данных (1 час по умолчанию)
  
## Запуск проекта:
Чтобы запустить проект, откройте терминал в корневой папке проета и выполните команду (должен быть установлен Docker):
```bash
docker compose up -d --build app
```
## Описание проекта
Программа каждый час подключается к эндпоинту ```https://common-api.wildberries.ru/api/v1/tariffs/box```, получает с него данные и записывает их в таблицу Postgres, а также Google Таблицы, чей ID указан в таблице spreadsheets. При этом данные в Postgres накапливаются для каждого дня, а в Google Таблицах хранятся данные, актуальные на данный момент. 
