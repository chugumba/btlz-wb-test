/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("spreadsheets")
        .insert([
            { spreadsheet_id: "1fORraLqIA7HByN_mQtUKCZgKRpZ-pRsE8VxYn4io_kQ" },
            { spreadsheet_id: "12RFq49tp_UlwJP_78fLIOIBQ_c4TfZ4XOw4hMGUE8ds" }, 
            { spreadsheet_id: "1bFnND4jXXAF46INqNIwD1MfVfYb3TFzCNQ7mLbchobQ" }
        ])
        .onConflict(["spreadsheet_id"])
        .ignore();
}
