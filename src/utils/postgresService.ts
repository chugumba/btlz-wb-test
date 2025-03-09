import knex from "#postgres/knex.js";
import {WarehouseEx} from "./interfaces.js"
// Полуаем все ID таблиц
export async function GetAllSpreadSheets() : Promise<Array<string>>  {
    const queryRes : Array<string> = (await knex("spreadsheets")).map(sheetId => sheetId.spreadsheet_id); 
    return queryRes
}
// Запись данных из API в PG
export async function PostgresUpdate(nextBox:string, tillMax:string, warehouseList:Array<WarehouseEx>, curDate:string) : Promise<void> {
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

export async function DataToExport(curDate:string) : Promise <Array<any>> {
    return await knex("boxes").select(['dtNextBox', 'dtTillMax', 'boxDeliveryAndStorageExpr', 'boxDeliveryBase', 'boxDeliveryLiter', 'boxStorageBase', 'boxStorageLiter', 'warehouseName'])
    .where({dtActualization: curDate})
    .orderByRaw('CAST("boxDeliveryAndStorageExpr" AS FLOAT)');
}