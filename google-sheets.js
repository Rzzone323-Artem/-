// Google Sheets API интеграция для Чудо-Базара "Святой Алтарь"
class GoogleSheetsManager {
    constructor() {
        // ID вашей Google Таблицы (нужно будет заменить)
        this.spreadsheetId = 'YOUR_SPREADSHEET_ID';
        
        // API ключ (нужно будет заменить)
        this.apiKey = 'YOUR_API_KEY';
        
        // URL для Google Sheets API
        this.apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/`;
        
        // Имена листов
        this.ordersSheet = 'Заказы';
        this.messagesSheet = 'Сообщения';
    }

    // Инициализация таблицы (создание заголовков)
    async initSheets() {
        try {
            // Создаем заголовки для заказов
            await this.addHeaders('Заказы!A1:E1', [
                'Дата', 'Имя', 'Email', 'Товар', 'Сообщение', 'Статус'
            ]);
            
            // Создаем заголовки для сообщений
            await this.addHeaders('Сообщения!A1:F1', [
                'Дата', 'Автор', 'Заголовок', 'Категория', 'Текст', 'Статус'
            ]);
            
            console.log('✅ Таблицы инициализированы');
        } catch (error) {
            console.error('❌ Ошибка инициализации таблиц:', error);
        }
    }

    // Добавление заголовков
    async addHeaders(range, values) {
        const url = `${this.apiUrl}${range}?valueInputOption=USER_ENTERED`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                range: range,
                majorDimension: 'ROWS',
                values: [values]
            })
        });

        return response.json();
    }

    // Сохранение заказа
    async saveOrder(orderData) {
        try {
            const timestamp = new Date().toLocaleString('ru-RU');
            const values = [
                timestamp,
                orderData.name || '',
                orderData.email || '',
                orderData.product || '',
                orderData.message || '',
                'Новый'
            ];

            const url = `${this.apiUrl}Заказы!A:A:append?valueInputOption=USER_ENTERED`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    range: 'Заказы!A:F',
                    majorDimension: 'ROWS',
                    values: [values]
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Заказ сохранен в Google Sheets');
                return { success: true, data: result };
            } else {
                throw new Error(result.error?.message || 'Ошибка сохранения заказа');
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения заказа:', error);
            return { success: false, error: error.message };
        }
    }

    // Сохранение сообщения форума
    async saveMessage(messageData) {
        try {
            const timestamp = new Date().toLocaleString('ru-RU');
            const values = [
                timestamp,
                messageData.author || '',
                messageData.title || '',
                messageData.category || '',
                messageData.content || '',
                'На модерации'
            ];

            const url = `${this.apiUrl}Сообщения!A:A:append?valueInputOption=USER_ENTERED`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    range: 'Сообщения!A:F',
                    majorDimension: 'ROWS',
                    values: [values]
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Сообщение сохранено в Google Sheets');
                return { success: true, data: result };
            } else {
                throw new Error(result.error?.message || 'Ошибка сохранения сообщения');
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения сообщения:', error);
            return { success: false, error: error.message };
        }
    }

    // Получение всех заказов
    async getOrders() {
        try {
            const url = `${this.apiUrl}Заказы!A:F?key=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.values || [] };
            } else {
                throw new Error(data.error?.message || 'Ошибка загрузки заказов');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки заказов:', error);
            return { success: false, error: error.message };
        }
    }

    // Получение всех сообщений
    async getMessages() {
        try {
            const url = `${this.apiUrl}Сообщения!A:F?key=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.values || [] };
            } else {
                throw new Error(data.error?.message || 'Ошибка загрузки сообщений');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки сообщений:', error);
            return { success: false, error: error.message };
        }
    }

    // Обновление статуса заказа
    async updateOrderStatus(rowNumber, status) {
        try {
            const url = `${this.apiUrl}Заказы!F${rowNumber}?valueInputOption=USER_ENTERED`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    range: `Заказы!F${rowNumber}`,
                    majorDimension: 'ROWS',
                    values: [[status]]
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Статус заказа обновлен');
                return { success: true, data: result };
            } else {
                throw new Error(result.error?.message || 'Ошибка обновления статуса');
            }
        } catch (error) {
            console.error('❌ Ошибка обновления статуса:', error);
            return { success: false, error: error.message };
        }
    }

    // Обновление статуса сообщения
    async updateMessageStatus(rowNumber, status) {
        try {
            const url = `${this.apiUrl}Сообщения!F${rowNumber}?valueInputOption=USER_ENTERED`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    range: `Сообщения!F${rowNumber}`,
                    majorDimension: 'ROWS',
                    values: [[status]]
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Статус сообщения обновлен');
                return { success: true, data: result };
            } else {
                throw new Error(result.error?.message || 'Ошибка обновления статуса');
            }
        } catch (error) {
            console.error('❌ Ошибка обновления статуса:', error);
            return { success: false, error: error.message };
        }
    }
}

// Создаем глобальный экземпляр
window.googleSheets = new GoogleSheetsManager();
