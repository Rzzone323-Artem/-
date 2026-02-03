// Сервер для обработки заказов и сообщений
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Файлы для хранения данных
const ORDERS_FILE = 'data/orders.json';
const MESSAGES_FILE = 'data/messages.json';

// Создаем папку data если ее нет
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Инициализация файлов если их нет
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
}
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, '[]');
}

// API для заказов
app.post('/api/orders', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        const newOrder = {
            ...req.body,
            id: Date.now(),
            status: 'new',
            timestamp: new Date().toISOString()
        };
        
        orders.push(newOrder);
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        
        console.log(`📦 Новый заказ от ${newOrder.name}: ${newOrder.product}`);
        
        res.json({ 
            success: true, 
            message: 'Заказ успешно отправлен!',
            orderId: newOrder.id 
        });
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при сохранении заказа' 
        });
    }
});

app.get('/api/orders', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка загрузки заказов' });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        const filteredOrders = orders.filter(order => order.id != req.params.id);
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(filteredOrders, null, 2));
        res.json({ success: true, message: 'Заказ удален' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка удаления заказа' });
    }
});

// API для сообщений форума
app.post('/api/messages', (req, res) => {
    try {
        const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        const newMessage = {
            ...req.body,
            id: Date.now(),
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        messages.push(newMessage);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        
        console.log(`💬 Новое сообщение на форуме от ${newMessage.author}: ${newMessage.title}`);
        
        res.json({ 
            success: true, 
            message: 'Сообщение отправлено на модерацию!',
            messageId: newMessage.id 
        });
    } catch (error) {
        console.error('Ошибка сохранения сообщения:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при сохранении сообщения' 
        });
    }
});

app.get('/api/messages', (req, res) => {
    try {
        const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка загрузки сообщений' });
    }
});

app.put('/api/messages/:id/approve', (req, res) => {
    try {
        const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        const message = messages.find(msg => msg.id == req.params.id);
        
        if (message) {
            message.status = 'approved';
            fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
            res.json({ success: true, message: 'Сообщение одобрено' });
        } else {
            res.status(404).json({ success: false, message: 'Сообщение не найдено' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка одобрения сообщения' });
    }
});

app.delete('/api/messages/:id', (req, res) => {
    try {
        const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        const filteredMessages = messages.filter(msg => msg.id != req.params.id);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filteredMessages, null, 2));
        res.json({ success: true, message: 'Сообщение удалено' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка удаления сообщения' });
    }
});

// API для уведомлений
app.get('/api/notifications', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        
        const newOrders = orders.filter(order => order.status === 'new').length;
        const pendingMessages = messages.filter(msg => msg.status === 'pending').length;
        
        res.json({
            newOrders,
            pendingMessages,
            totalOrders: orders.length,
            totalMessages: messages.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка загрузки уведомлений' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📦 API заказов: http://localhost:${PORT}/api/orders`);
    console.log(`💬 API сообщений: http://localhost:${PORT}/api/messages`);
    console.log(`🔔 API уведомлений: http://localhost:${PORT}/api/notifications`);
});

module.exports = app;
