import { google } from 'googleapis';
import { sheets_v4, Auth } from 'googleapis';
import {DataToExport} from './postgresService.js'
 // Заголовки таблицы
 const headers = ['Дата начала следующего тарифа', 'Дата окончания последнего установленного тарифа', 'Коэффициент',
    'Доставка 1 литра, ₽','Доставка каждого дополнительного литра, ₽','Хранение 1 литра, ₽',
    'Хранение каждого дополнительного литра, ₽','Название склада'
 ];

export async function UploadToGS(file: string, tables: Array<string>, curDate: string): Promise<void> {
    try {
        // Записываем данные для подключения
        const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
            keyFile: file,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client: any = await auth.getClient();
        const googleSheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: client });

        const dataToinsert = await DataToExport(curDate);

        for (const table of tables) {
            // Проверяем наличие листа 'stocks_coefs'
            const sheetsResponse = await googleSheets.spreadsheets.get({
                spreadsheetId: table
            });
            
            const sheetsList = sheetsResponse.data.sheets?.map(sheet => sheet.properties?.title);
            if (!sheetsList?.includes('stocks_coefs')) {
                // Создаем лист 'stocks_coefs', если его нет
                await googleSheets.spreadsheets.batchUpdate({
                    spreadsheetId: table,
                    requestBody: {
                        requests: [{
                            addSheet: {
                                properties: { title: 'stocks_coefs' }
                            }
                        }]
                    }
                });
                console.log('Лист "stocks_coefs" был создан.');
            }
            // Очищаем лист
            await googleSheets.spreadsheets.values.clear({
                spreadsheetId: table,
                range: 'stocks_coefs',
            });

            // Заполняем лист 
            await googleSheets.spreadsheets.values.append({
                spreadsheetId: table,
                range: 'stocks_coefs',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [headers, ...dataToinsert.map(row => Object.values(row))]
                }
            });
        };
        
    } catch (error) {
        console.error('Error in NodeGoogleSheets:', error);
    }
}
