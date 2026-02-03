// Глобальные переменные для администрирования
let isAdmin = false;
let postingEnabled = true;
let topics = [];
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
    }
}

// Обновление навигации для админа
function updateNavigation() {
    if (isAdmin) {
        const menuElements = document.querySelectorAll('.menu');
        menuElements.forEach(menu => {
            if (!menu.querySelector('.admin-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = '#';
                adminLink.className = 'admin-link';
                adminLink.textContent = '🔐 АДМИНИСТРАТОР';
                adminLink.onclick = function(e) {
                    e.preventDefault();
                    showAdminPanel();
                };
                menu.appendChild(document.createTextNode(' | '));
                menu.appendChild(adminLink);
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
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminPanelModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAdminPanel()">&times;</span>
            <h2>🔐 ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
            <div class="admin-controls">
                <button class="admin-btn" onclick="toggleForumPosting()">🚫 ЗАПРЕТИТЬ ПОСТИНГ НА ФОРУМЕ</button>
                <button class="admin-btn" onclick="enableForumPosting()">✅ РАЗРЕШИТЬ ПОСТИНГ НА ФОРУМЕ</button>
                <button class="admin-btn" onclick="clearAllForumTopics()">🗑️ ОЧИСТИТЬ ФОРУМ</button>
                <button class="admin-btn" onclick="startSnakeGame()">🐍 ИГРАТЬ В ЗМЕЙКУ</button>
                <button class="admin-btn" onclick="logoutAdmin()">🚪 ВЫЙТИ ИЗ АДМИНКИ</button>
            </div>
            <div class="admin-status">
                <p>Статус постинга на форуме: <span id="forumPostingStatus" style="color: #0F0;">РАЗРЕШЕН</span></p>
                <p>Текущий пользователь: <span style="color: #FF0;">АДМИНИСТРАТОР</span></p>
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
}

// Выход из админки
function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem('adminAuth');
    location.reload();
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
