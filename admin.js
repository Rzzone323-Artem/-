// Глобальные переменные для администрирования
let isAdmin = false;
let postingEnabled = true;
let topics = [];
let pendingMessages = [];
let snakeGame = null;

// Функция входа в админ-панель
function showAdminLogin() {
    const code = prompt("Введите код посвященного:");
    if (code === "BABOOIN785DSFBEBRACYKAKALJORDANRZZONEZHEK") {
        isAdmin = true;
        alert("🔐 Доступ разрешен! Права администратора активированы.");
        updateNavigation();
        enableAdminFeatures();
        localStorage.setItem('adminAuth', 'true');
        checkPendingMessages();
    } else {
        alert("❌ Неверный код! Доступ запрещен.");
    }
}

// Проверка авторизации при загрузке страницы
function checkAdminAuth() {
    if (localStorage.getItem('adminAuth') === 'true') {
        isAdmin = true;
        updateNavigation();
        enableAdminFeatures();
        checkPendingMessages();
    }
}

// Обновление навигации для админа
function updateNavigation() {
    if (isAdmin) {
        const menuElements = document.querySelectorAll('.menu');
        menuElements.forEach(menu => {
            // Удаляем старую ссылку если есть
            const oldAdminLink = menu.querySelector('.admin-link');
            if (oldAdminLink) {
                oldAdminLink.remove();
            }
            
            // Добавляем новую ссылку
            if (!menu.querySelector('.admin-link')) {
                const separator = document.createTextNode(' | ');
                menu.appendChild(separator);
                
                const adminLink = document.createElement('a');
                adminLink.href = '#';
                adminLink.className = 'admin-link';
                adminLink.textContent = '🔐 АДМИНИСТРАТОР';
                adminLink.onclick = function(e) {
                    e.preventDefault();
                    showAdminPanel();
                };
                menu.appendChild(adminLink);
                
                // Добавляем кнопку выхода
                const logoutSeparator = document.createTextNode(' | ');
                menu.appendChild(logoutSeparator);
                
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.className = 'logout-link';
                logoutLink.textContent = '🚪 ВЫХОД';
                logoutLink.style.cssText = 'color: #F00; font-weight: bold;';
                logoutLink.onclick = function(e) {
                    e.preventDefault();
                    logoutAdmin();
                };
                menu.appendChild(logoutLink);
            }
        });
    }
}

// Включение админ-функций
function enableAdminFeatures() {
    // Добавляем кнопки редактирования к товарам
    const products = document.querySelectorAll('.product');
    products.forEach(product => {
        if (!product.querySelector('.edit-btn')) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = '✏️ РЕДАКТИРОВАТЬ';
            editBtn.onclick = function() {
                editProduct(product);
            };
            product.appendChild(editBtn);
        }
    });
}

// Проверка ожидающих сообщений
function checkPendingMessages() {
    if (pendingMessages.length > 0) {
        alert(`🔔 У вас ${pendingMessages.length} сообщений на модерации!`);
    }
}

// Редактирование товара
function editProduct(productElement) {
    if (!isAdmin) {
        alert("Требуются права администратора!");
        return;
    }
    
    const title = productElement.querySelector('h2');
    const content = productElement.innerHTML;
    
    const newTitle = prompt("Введите новое название:", title.textContent);
    if (newTitle) {
        title.textContent = newTitle;
    }
    
    const newContent = prompt("Введите новое описание (HTML):", content);
    if (newContent) {
        productElement.innerHTML = newContent;
        // Возвращаем кнопку редактирования
        enableAdminFeatures();
    }
}

// Показ админ-панели
function showAdminPanel() {
    // Удаляем старую панель если есть
    const oldModal = document.getElementById('adminPanelModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminPanelModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAdminPanel()">&times;</span>
            <h2>🔐 ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
            
            <div class="admin-controls">
                <button class="admin-btn" onclick="toggleForumPosting()">🚫 ЗАПРЕТИТЬ ПОСТИНГ</button>
                <button class="admin-btn" onclick="enableForumPosting()">✅ РАЗРЕШИТЬ ПОСТИНГ</button>
                <button class="admin-btn" onclick="clearAllForumTopics()">🗑️ ОЧИСТИТЬ ФОРУМ</button>
                <button class="admin-btn" onclick="deleteAllProducts()">📦 УДАЛИТЬ ВСЕ ТОВАРЫ</button>
                <button class="admin-btn" onclick="backupSite()">� СОХРАНИТЬ РЕЗЕРВ</button>
                <button class="admin-btn" onclick="startSnakeGame()">🐍 ИГРАТЬ В ЗМЕЙКУ</button>
                <button class="admin-btn" onclick="showUserList()">👴 СПИСОК ПОЛЬЗОВАТЕЛЕЙ</button>
                <button class="admin-btn" onclick="logoutAdmin()" style="background: linear-gradient(45deg, #F00, #800);">🚪 ВЫЙТИ ИЗ АДМИНКИ</button>
            </div>
            
            <div class="admin-status">
                <p>Статус постинга: <span id="forumPostingStatus" style="color: #0F0;">РАЗРЕШЕН</span></p>
                <p>Текущий пользователь: <span style="color: #FF0;">АДМИНИСТРАТОР</span></p>
                <p>Ожидающих сообщений: <span id="pendingCount" style="color: #FF0;">${pendingMessages.length}</span></p>
            </div>
            
            <div class="admin-moderation">
                <h3>📋 СООБЩЕНИЯ НА МОДЕРАЦИИ</h3>
                <div class="moderation-list">
                    ${pendingMessages.length === 0 ? 
                        '<p style="color: #FF0;">Нет сообщений на модерации</p>' :
                        pendingMessages.map((msg, index) => `
                            <div class="moderation-item" style="border: 1px solid #FF0; padding: 10px; margin: 10px 0; background: rgba(255, 0, 102, 0.1);">
                                <p><strong>Автор:</strong> ${msg.author}</p>
                                <p><strong>Тема:</strong> ${msg.title}</p>
                                <p><strong>Сообщение:</strong> ${msg.content}</p>
                                <p><strong>Дата:</strong> ${msg.date}</p>
                                <div style="margin-top: 10px;">
                                    <button class="admin-btn" onclick="approveMessage(${index})" style="background: #0A0; padding: 5px 10px; font-size: 12px;">✅ ОДОБРИТЬ</button>
                                    <button class="admin-btn" onclick="rejectMessage(${index})" style="background: #A00; padding: 5px 10px; font-size: 12px;">❌ ОТКЛОНИТЬ</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    updateAdminStatus();
}

// Закрытие админ-панели
function closeAdminPanel() {
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
        modal.remove();
    }
}

// Панель модерации
function showModerationPanel() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'moderationModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModerationPanel()">&times;</span>
            <h2>📋 МОДЕРАЦИЯ СООБЩЕНИЙ</h2>
            <div class="moderation-list">
                ${pendingMessages.length === 0 ? 
                    '<p style="color: #FF0;">Нет сообщений на модерации</p>' :
                    pendingMessages.map((msg, index) => `
                        <div class="moderation-item" style="border: 1px solid #FF0; padding: 10px; margin: 10px 0;">
                            <p><strong>Автор:</strong> ${msg.author}</p>
                            <p><strong>Тема:</strong> ${msg.title}</p>
                            <p><strong>Сообщение:</strong> ${msg.content}</p>
                            <div style="margin-top: 10px;">
                                <button class="admin-btn" onclick="approveMessage(${index})" style="background: #0A0;">✅ ОДОБРИТЬ</button>
                                <button class="admin-btn" onclick="rejectMessage(${index})" style="background: #A00;">❌ ОТКЛОНИТЬ</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeModerationPanel() {
    const modal = document.getElementById('moderationModal');
    if (modal) {
        modal.remove();
    }
}

function approveMessage(index) {
    const message = pendingMessages[index];
    alert(`✅ Сообщение от ${message.author} одобрено и опубликовано на форуме!`);
    pendingMessages.splice(index, 1);
    // Обновляем админ-панель
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
        modal.remove();
        showAdminPanel();
    }
}

function rejectMessage(index) {
    const message = pendingMessages[index];
    alert(`❌ Сообщение от ${message.author} отклонено!`);
    pendingMessages.splice(index, 1);
    // Обновляем админ-панель
    const modal = document.getElementById('adminPanelModal');
    if (modal) {
        modal.remove();
        showAdminPanel();
    }
}

// Дополнительные админ-функции
function deleteAllProducts() {
    if (confirm('⚠️ ВЫ УВЕРЕНЫ? ЭТО УДАЛИТ ВСЕ ТОВАРЫ САЙТА!')) {
        if (confirm('🚨 ЭТО ДЕЙСТВИТЕЛЬНО УДАЛИТ ВСЕ ТОВАРЫ! НАЗАД ПУТИ НЕ БУДЕТ!')) {
            const products = document.querySelectorAll('.product');
            products.forEach(product => product.remove());
            alert('🗑️ Все товары удалены!');
        }
    }
}

function backupSite() {
    alert('💦 Резервная копия сайта создана!\n\n(Это симуляция - в реальности здесь был бы бэкап)');
}

function showUserList() {
    const users = [
        'Исследователь_2024',
        'Любопытный_Журналист', 
        'Энтузиаст_Легенд',
        'Фотограф_Природы',
        'Научный_Сотрудник',
        'Книголюб_Исследователь',
        'Первый_Раз_В_Зоне',
        'Здоровье_Прежде_Всего'
    ];
    
    alert(`👴 АКТИВНЫЕ ПОЛЬЗОВАТЕЛИ:\n\n${users.join('\n')}\n\nВсего: ${users.length} пользователей`);
}

// Управление постингом на форуме
function toggleForumPosting() {
    postingEnabled = false;
    updateAdminStatus();
    alert('🚫 Постинг на форуме запрещен!');
}

function enableForumPosting() {
    postingEnabled = true;
    updateAdminStatus();
    alert('✅ Постинг на форуме разрешен!');
}

function clearAllForumTopics() {
    if (confirm('⚠️ Вы уверены, что хотите удалить все темы на форуме?')) {
        topics = [];
        alert('🗑️ Все темы удалены!');
        if (typeof updateTopicsList === 'function') {
            updateTopicsList();
        }
    }
}

function updateAdminStatus() {
    const statusElement = document.getElementById('forumPostingStatus');
    if (statusElement) {
        statusElement.textContent = postingEnabled ? 'РАЗРЕШЕН' : 'ЗАПРЕЩЕН';
        statusElement.style.color = postingEnabled ? '#0F0' : '#F00';
    }
    
    const pendingElement = document.getElementById('pendingCount');
    if (pendingElement) {
        pendingElement.textContent = pendingMessages.length;
    }
}

// Выход из админки
function logoutAdmin() {
    if (confirm('🚪 Выйти из панели администратора?')) {
        isAdmin = false;
        localStorage.removeItem('adminAuth');
        location.reload();
    }
}

// Игра в змейку
function startSnakeGame() {
    const gameModal = document.createElement('div');
    gameModal.className = 'modal';
    gameModal.id = 'snakeGameModal';
    gameModal.innerHTML = `
        <div class="modal-content" style="width: 400px;">
            <span class="close" onclick="closeSnakeGame()">&times;</span>
            <h2>🐍 ЗМЕЙКА</h2>
            <p>Используйте стрелки для управления</p>
            <canvas id="snakeCanvas" width="300" height="300" style="border: 2px solid #FF0; background: #000;"></canvas>
            <p>Счёт: <span id="snakeScore">0</span></p>
            <button class="admin-btn" onclick="resetSnakeGame()">🔄 НАЧАТЬ ЗАНОВО</button>
        </div>
    `;
    
    document.body.appendChild(gameModal);
    gameModal.style.display = 'block';
    
    initSnakeGame();
}

function closeSnakeGame() {
    const modal = document.getElementById('snakeGameModal');
    if (modal) {
        modal.remove();
        if (snakeGame) {
            clearInterval(snakeGame);
            snakeGame = null;
        }
    }
}

function initSnakeGame() {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('snakeScore');
    
    let snake = [{x: 150, y: 150}];
    let direction = {x: 0, y: 0};
    let food = {x: Math.floor(Math.random() * 15) * 20, y: Math.floor(Math.random() * 15) * 20};
    let score = 0;
    
    function draw() {
        // Очистка canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 300, 300);
        
        // Рисование змейки
        ctx.fillStyle = '#0F0';
        snake.forEach(segment => {
            ctx.fillRect(segment.x, segment.y, 18, 18);
        });
        
        // Рисование еды
        ctx.fillStyle = '#F00';
        ctx.fillRect(food.x, food.y, 18, 18);
    }
    
    function update() {
        // Движение змейки
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
        
        // Проверка границ
        if (head.x < 0 || head.x >= 300 || head.y < 0 || head.y >= 300) {
            gameOver();
            return;
        }
        
        // Проверка самопересечения
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }
        
        snake.unshift(head);
        
        // Проверка еды
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            food = {x: Math.floor(Math.random() * 15) * 20, y: Math.floor(Math.random() * 15) * 20};
        } else {
            snake.pop();
        }
        
        draw();
    }
    
    function gameOver() {
        clearInterval(snakeGame);
        alert(`Игра окончена! Счёт: ${score}`);
    }
    
    function resetSnakeGame() {
        snake = [{x: 150, y: 150}];
        direction = {x: 0, y: 0};
        food = {x: Math.floor(Math.random() * 15) * 20, y: Math.floor(Math.random() * 15) * 20};
        score = 0;
        scoreElement.textContent = score;
        
        if (snakeGame) {
            clearInterval(snakeGame);
        }
        
        snakeGame = setInterval(update, 100);
    }
    
    // Управление
    document.addEventListener('keydown', function(e) {
        if (!snakeGame) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (direction.y === 0) {
                    direction = {x: 0, y: -20};
                }
                break;
            case 'ArrowDown':
                if (direction.y === 0) {
                    direction = {x: 0, y: 20};
                }
                break;
            case 'ArrowLeft':
                if (direction.x === 0) {
                    direction = {x: -20, y: 0};
                }
                break;
            case 'ArrowRight':
                if (direction.x === 0) {
                    direction = {x: 20, y: 0};
                }
                break;
        }
    });
    
    draw();
    snakeGame = setInterval(update, 100);
}

function resetSnakeGame() {
    if (snakeGame) {
        clearInterval(snakeGame);
        snakeGame = null;
    }
    initSnakeGame();
}

// Секретная комбинация для змейки (↑↑↓↓←→←→BA)
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.slice(-8).join(',') === konamiPattern.join(',')) {
        startSnakeGame();
        konamiCode = [];
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    
    // Добавляем кнопку входа в админку
    const header = document.querySelector('.header');
    if (header && !header.querySelector('.admin-login-btn')) {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'admin-login-btn';
        loginBtn.textContent = '🔐';
        loginBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: #FF0; font-size: 20px; cursor: pointer;';
        loginBtn.onclick = showAdminLogin;
        header.appendChild(loginBtn);
    }
});

// Глобальные функции для доступа из других скриптов
window.isAdmin = function() { return isAdmin; };
window.postingEnabled = function() { return postingEnabled; };
window.showAdminLogin = showAdminLogin;
window.startSnakeGame = startSnakeGame;
window.addPendingMessage = function(message) {
    pendingMessages.push(message);
    if (isAdmin) {
        alert(`🔔 Новое сообщение на модерации от ${message.author}!`);
    }
};
