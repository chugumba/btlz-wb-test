import { migrate, seed } from "#postgres/knex.js";
import env from "#config/env/env.js";
import axios from 'axios';
import {UploadToGS} from "#utils/tablesService.js"
import {GetAllSpreadSheets, PostgresUpdate} from "#utils/postgresService.js"
import { ResponseData } from "#utils/interfaces.js";
// Миграции
await migrate.latest();
// Сиды
await seed.run();
// Успешная миграция и сиды
console.log("All migrations and seeds have been run");
// Обращение к API "Тарифы коробов"
async function callBoxesApi() : Promise<void> {
    try {
        // Получаем текущую дату
        const curDate:string = (new Date()).toISOString().split('T')[0];
        const response = await axios.get('https://common-api.wildberries.ru/api/v1/tariffs/box', {
        headers: {
            'Authorization': env.API_KEY,
            'Content-Type': 'application/json'
        },
        params: {
            date: curDate
        }
        });
        // Читаем данные
        const nextBos: ResponseData | undefined = response.data?.response?.data;
        // Если некорректный формат, выходим из функции
        if (!nextBos) {
            console.error('Ошибка при получении данных!');
            return;
        } else {
            // Записываем данные в БД
            await PostgresUpdate (nextBos.dtNextBox, nextBos.dtTillMax, nextBos.warehouseList, curDate)
            // Перегружаем в Google Таблицы
            await UploadToGS('credentials.json', await GetAllSpreadSheets(), curDate);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Ошибка Axios:', error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error('Ошибка при вызове API:', error.message);
        } else {
            console.error('Неизвестная ошибка:', error);
        }
    } finally {
        console.log("Сделан запрос")
    }
};
// Обращаемся к API при старте приложения
callBoxesApi();
// Определяем обращение к API с интервалом равным переменной среды
setInterval(() => {
    console.log('Вызываем API...');
    callBoxesApi();
  }, env.CALL_INTERVAL || 3600000);