/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("spreadsheets", (table) => {
        table.string("spreadsheet_id").primary();
    })
    .createTable("boxes", (table) => {
        table.increments("boxId").primary().comment("ID");
        table.date("dtNextBox").comment("Дата начала следующего тарифа");
        table.date("dtTillMax").comment("Дата окончания последнего установленного тарифа");
        table.decimal("boxDeliveryAndStorageExpr").comment("Тарифы для коробов, сгруппированные по складам");
        table.decimal("boxDeliveryBase").comment("Коэффициент, %. На него умножается стоимость доставки и хранения. Во всех тарифах этот коэффициент уже учтён");
        table.decimal("boxDeliveryLiter").comment("Доставка 1 литра, ₽");
        table.decimal("boxStorageBase").comment("Доставка каждого дополнительного литра, ₽");
        table.decimal("boxStorageLiter").comment("Хранение 1 литра, ₽");
        table.string("warehouseName").comment("Хранение каждого дополнительного литра, ₽");
        table.date("dtActualization").comment("Название склада");              
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("spreadsheets")
    .dropTable("boxes");
}
