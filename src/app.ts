import knex, { migrate, seed } from "#postgres/knex.js";
import env from "#config/env/env.js";
import axios from 'axios';
// Миграции
await migrate.latest();
// Сиды
await seed.run();
// Успешная миграция и сиды
console.log("All migrations and seeds have been run");
// Обращение к API "Тарифы коробов"
const callBoxesApi = async () => {
    try {
      const response = await axios.get('https://common-api.wildberries.ru/api/v1/tariffs/box', {
        headers: {
          'Authorization': env.API_KEY,
          'Content-Type': 'application/json'
        },
        params: {
            date: "2025-03-08"
        }
      });
      console.log('Ответ:', response.data);
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
// Определяем обращение к API с интервалом равным переменной среды
setInterval(() => {
    console.log('Вызываем API...');
    callBoxesApi();
  }, env.CALL_INTERVAL || 3600000);