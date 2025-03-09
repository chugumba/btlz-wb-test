import knex, { migrate, seed } from "#postgres/knex.js";
import env from "#config/env/env.js";
import axios from 'axios';
import {UploadToGS} from "./utils/tablesService.js"
// Миграции
await migrate.latest();
// Сиды
await seed.run();
// Успешная миграция и сиды
console.log("All migrations and seeds have been run");
// Интерфейс для тарифа для коробов по складу 
interface WarehouseEx {
    boxDeliveryAndStorageExpr: string;
    boxDeliveryBase: string;
    boxDeliveryLiter: string;
    boxStorageBase: string;
    boxStorageLiter: string;
    warehouseName: string;
}
// Интерфейс для набора тарифов для коробов, сгрупированных по складам
interface ResponseData {
    dtNextBox:string;
    dtTillMax:string;
    warehouseList: Array<WarehouseEx>;
} 
// Полуаем все ID таблиц
async function getAllSpreadSheets() : Promise<Array<string>>  {
    const queryRes : Array<string> = (await knex("spreadsheets")).map(sheetId => sheetId.spreadsheet_id); 
    return queryRes
}
// Запись данных из API в PG
async function postgresUpdate(nextBox:string, tillMax:string, warehouseList:Array<WarehouseEx>, curDate:string) : Promise<void> {
    try {
        // Создаём объект для вставки в таблицу
        const insertData = warehouseList.map(data=>({
            dtNextBox: nextBox === "" ? null : nextBox,
            dtTillMax: tillMax === "" ? null : tillMax,
            ...data, 
            dtActualization:curDate === "" ? null : curDate
        }))
        // Обновляем/вставляем записи
        for(const box of insertData) {
            const updateExisting = await knex("boxes")
            .where({ 
                dtActualization: box.dtActualization,
                warehouseName: box.warehouseName
            })
            .update({...box});
            // Если нет обновлённых записей, вставляем
            if(updateExisting === 0) {
                await knex("boxes")
                .insert({...box})
            }
        }   
    } catch (error) {
        throw new Error("Ошибка при обновлении данных!")
    }
}
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
            await postgresUpdate (nextBos.dtNextBox, nextBos.dtTillMax, nextBos.warehouseList, curDate)
            // Перегружаем в Google Таблицы
            await UploadToGS('credentials.json','1fORraLqIA7HByN_mQtUKCZgKRpZ-pRsE8VxYn4io_kQ', await getAllSpreadSheets());
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Ошибка Axios:', error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error('Ошибка при вызове API:', error.message);
        } else {
            console.error('Неизвестная ошибка:', error);
        }
    }
};
// Обращаемся к API при старте приложения
callBoxesApi();
// Определяем обращение к API с интервалом равным переменной среды
setInterval(() => {
    console.log('Вызываем API...');
    callBoxesApi();
  }, env.CALL_INTERVAL || 3600000);