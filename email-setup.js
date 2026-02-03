// ПРОСТАЯ ОТПРАВКА ЗАКАЗОВ НА EMAIL - EmailJS
// Вставьте только три значения ниже 👇

const EMAILJS_CONFIG = {
    // 1. Ваш ID сервиса (получите на emailjs.com)
    SERVICE_ID: 'service_iv8lbek',
    
    // 2. ID шаблона письма (создадим вместе)
    TEMPLATE_ID: 'template_x2d1n9b', 
    
    // 3. Ваш публичный ключ (получите на emailjs.com)
    PUBLIC_KEY: '3GFbTAo1xRLbgY1BY'
};

// Дальше ничего не трогайте! ✨
class EmailOrderManager {
    constructor() {
        this.config = EMAILJS_CONFIG;
        this.initEmailJS();
    }

    // Инициализация EmailJS
    initEmailJS() {
        // Загружаем EmailJS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            emailjs.init(this.config.PUBLIC_KEY);
            console.log('✅ EmailJS инициализирован');
        };
        document.head.appendChild(script);
    }

    // Отправка заказа на email
    async sendOrder(order) {
        try {
            const templateParams = {
                to_name: 'Администратор Чудо-Базара',
                from_name: order.name,
                from_email: order.email,
                product: order.product,
                message: order.message,
                date: new Date().toLocaleString('ru-RU'),
                reply_to: order.email
            };

            const response = await emailjs.send(
                this.config.SERVICE_ID,
                this.config.TEMPLATE_ID,
                templateParams
            );

            console.log('✅ Заказ отправлен на email:', response);
            return true;
        } catch (error) {
            console.error('❌ Ошибка отправки заказа:', error);
            return false;
        }
    }

    // Отправка сообщения форума на email
    async sendForumMessage(message) {
        try {
            const templateParams = {
                to_name: 'Администратор Чудо-Базара',
                from_name: message.author,
                title: message.title,
                category: message.category,
                content: message.content,
                date: new Date().toLocaleString('ru-RU'),
                type: 'forum_message'
            };

            const response = await emailjs.send(
                this.config.SERVICE_ID,
                this.config.TEMPLATE_ID,
                templateParams
            );

            console.log('✅ Сообщение форума отправлено на email:', response);
            return true;
        } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            return false;
        }
    }
}

// Создаем глобальный объект
window.emailManager = new EmailOrderManager();
