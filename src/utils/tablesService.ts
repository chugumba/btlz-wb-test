import { google } from 'googleapis';
import { sheets_v4, Auth } from 'googleapis';

export async function UploadToGS(file: string, sheetId: string, sheets: Array<string>): Promise<void> {
    try {
        // Записываем данные для подключения
        const auth: Auth.GoogleAuth = new google.auth.GoogleAuth({
            keyFile: file,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client: any = await auth.getClient();
        const googleSheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: client });

        // Проверяем наличие листа 'stocks_coefs'
        const sheetsResponse = await googleSheets.spreadsheets.get({
            spreadsheetId: sheetId
        });

        const sheetsList = sheetsResponse.data.sheets?.map(sheet => sheet.properties?.title);
        if (!sheetsList?.includes('stocks_coefs')) {
            // Создаем лист 'stocks_coefs', если его нет
            await googleSheets.spreadsheets.batchUpdate({
                spreadsheetId: sheetId,
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
        
    } catch (error) {
        console.error('Error in NodeGoogleSheets:', error);
    }
}
