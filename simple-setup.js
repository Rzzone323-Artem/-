// ПРОСТАЯ НАСТРОЙКА GOOGLE SHEETS
// Вставьте только два значения ниже 👇

const GOOGLE_SHEETS_CONFIG = {
    // 1. Откройте Google Таблицу и скопируйте ID из URL
    // URL: https://docs.google.com/spreadsheets/d/ABC123XYZ/edit
    // ID: ABC123XYZ (то что между /d/ и /edit)
    SPREADSHEET_ID: 'ВАШ_ID_ТАБЛИЦЫ_ЗДЕСЬ',
    
    // 2. Создайте API ключ: https://console.cloud.google.com/apis/credentials
    API_KEY: 'ВАШ_API_КЛЮЧ_ЗДЕСЬ'
};

// Дальше ничего не трогайте! ✨
class SimpleGoogleSheets {
    constructor() {
        this.config = GOOGLE_SHEETS_CONFIG;
        this.baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.SPREADSHEET_ID}/values/`;
    }

    async saveOrder(order) {
        try {
            const row = [
                new Date().toLocaleString('ru-RU'), // Дата
                order.name || '',                    // Имя
                order.email || '',                   // Email
                order.product || '',                 // Товар
                order.message || ''                  // Сообщение
            ];

            const response = await fetch(`${this.baseUrl}Заказы!A:A:append?valueInputOption=USER_ENTERED&key=${this.config.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    range: 'Заказы!A:E',
                    values: [row]
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Ошибка сохранения заказа:', error);
            return false;
        }
    }

    async saveMessage(message) {
        try {
            const row = [
                new Date().toLocaleString('ru-RU'), // Дата
                message.author || '',                // Автор
                message.title || '',                 // Заголовок
                message.category || '',               // Категория
                message.content || ''                // Текст
            ];

            const response = await fetch(`${this.baseUrl}Сообщения!A:A:append?valueInputOption=USER_ENTERED&key=${this.config.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    range: 'Сообщения!A:E',
                    values: [row]
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Ошибка сохранения сообщения:', error);
            return false;
        }
    }

    async getOrders() {
        try {
            const response = await fetch(`${this.baseUrl}Заказы!A:E?key=${this.config.API_KEY}`);
            const data = await response.json();
            return response.ok ? (data.values || []) : [];
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            return [];
        }
    }

    async getMessages() {
        try {
            const response = await fetch(`${this.baseUrl}Сообщения!A:E?key=${this.config.API_KEY}`);
            const data = await response.json();
            return response.ok ? (data.values || []) : [];
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
            return [];
        }
    }
}

// Создаем глобальный объект
window.simpleSheets = new SimpleGoogleSheets();
