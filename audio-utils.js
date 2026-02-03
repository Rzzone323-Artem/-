// Утилиты для работы с аудио - решение проблем с утечками памяти
class AudioContextManager {
    constructor() {
        this.context = null;
        this.activeSources = new Set();
        this.timers = new Set();
    }

    // Получить singleton AudioContext
    getAudioContext() {
        if (!this.context) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.context = new AudioContext();
                
                // Очистка при закрытии страницы
                window.addEventListener('beforeunload', () => {
                    this.cleanup();
                });
                
                // Очистка при скрытии страницы
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        this.suspendContext();
                    } else {
                        this.resumeContext();
                    }
                });
                
            } catch (e) {
                console.error('AudioContext не поддерживается:', e);
                return null;
            }
        }
        return this.context;
    }

    // Приостановить контент для экономии ресурсов
    suspendContext() {
        if (this.context && this.context.state === 'running') {
            this.context.suspend();
        }
    }

    // Возобновить контент
    resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // Создать осциллятор с отслеживанием
    createOscillator() {
        const context = this.getAudioContext();
        if (!context) return null;

        try {
            const oscillator = context.createOscillator();
            this.activeSources.add(oscillator);
            
            // Автоочистка после окончания
            oscillator.onended = () => {
                this.activeSources.delete(oscillator);
            };
            
            return oscillator;
        } catch (e) {
            console.error('Ошибка создания осциллятора:', e);
            return null;
        }
    }

    // Создать gain node с отслеживанием
    createGain() {
        const context = this.getAudioContext();
        if (!context) return null;

        try {
            return context.createGain();
        } catch (e) {
            console.error('Ошибка создания gain node:', e);
            return null;
        }
    }

    // Создать буферный источник
    createBufferSource() {
        const context = this.getAudioContext();
        if (!context) return null;

        try {
            const source = context.createBufferSource();
            this.activeSources.add(source);
            
            source.onended = () => {
                this.activeSources.delete(source);
            };
            
            return source;
        } catch (e) {
            console.error('Ошибка создания buffer source:', e);
            return null;
        }
    }

    // Безопасное создание тона
    createTone(frequency, duration, type = 'sine', volume = 0.1) {
        const context = this.getAudioContext();
        if (!context) return null;

        try {
            const oscillator = this.createOscillator();
            const gainNode = this.createGain();
            
            if (!oscillator || !gainNode) return null;

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            // Безопасная установка громкости
            const safeVolume = Math.max(0, Math.min(1, parseFloat(volume) || 0.1));
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(safeVolume, context.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + duration);
            
            return oscillator;
        } catch (e) {
            console.error('Ошибка создания тона:', e);
            return null;
        }
    }

    // Добавить таймер для отслеживания
    addTimer(timerId) {
        this.timers.add(timerId);
        return timerId;
    }

    // Очистить конкретный таймер
    clearTimer(timerId) {
        clearTimeout(timerId);
        clearInterval(timerId);
        this.timers.delete(timerId);
    }

    // Полная очистка ресурсов
    cleanup() {
        // Остановить все активные источники
        this.activeSources.forEach(source => {
            try {
                if (source.stop) {
                    source.stop();
                }
                if (source.disconnect) {
                    source.disconnect();
                }
            } catch (e) {
                console.error('Ошибка остановки источника:', e);
            }
        });
        this.activeSources.clear();

        // Очистить все таймеры
        this.timers.forEach(timerId => {
            clearTimeout(timerId);
            clearInterval(timerId);
        });
        this.timers.clear();

        // Закрыть AudioContext
        if (this.context && this.context.state !== 'closed') {
            try {
                this.context.close();
            } catch (e) {
                console.error('Ошибка закрытия AudioContext:', e);
            }
        }
        this.context = null;
    }

    // Получить статистику
    getStats() {
        return {
            activeSources: this.activeSources.size,
            activeTimers: this.timers.size,
            contextState: this.context?.state || 'none'
        };
    }
}

// Глобальный singleton
window.audioManager = new AudioContextManager();

// Утилиты для работы с DOM
function safeCreateElement(tag, attributes = {}, textContent = '') {
    try {
        const element = document.createElement(tag);
        
        // Безопасная установка атрибутов
        Object.keys(attributes).forEach(key => {
            if (key === 'style' && typeof attributes[key] === 'object') {
                Object.assign(element.style, attributes[key]);
            } else if (key.startsWith('on') || key === 'innerHTML') {
                // Пропускаем потенциально опасные атрибуты
                console.warn(`Пропущен небезопасный атрибут: ${key}`);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    } catch (e) {
        console.error('Ошибка создания элемента:', e);
        return document.createElement(tag); // Fallback
    }
}

// Утилита для безопасного создания изображений
function safeCreateImage(src, alt = '', attributes = {}) {
    const img = safeCreateElement('img', {
        src: src,
        alt: alt,
        loading: 'lazy',
        ...attributes
    });
    
    // Обработка ошибок загрузки
    img.onerror = () => {
        console.warn(`Ошибка загрузки изображения: ${src}`);
        img.style.display = 'none';
    };
    
    return img;
}

// Утилита для debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = window.audioManager.addTimer(setTimeout(later, wait));
    };
}

// Утилита для throttle
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            window.audioManager.addTimer(setTimeout(() => inThrottle = false, limit));
        }
    };
}

// Автоматическая очистка при переходе между страницами
if (typeof window !== 'undefined') {
    // SPA navigation detection
    let lastNavigation = Date.now();
    
    const detectNavigation = () => {
        const now = Date.now();
        if (now - lastNavigation > 1000) { // Likely navigation
            window.audioManager.cleanup();
        }
        lastNavigation = now;
    };
    
    // Отслеживание изменений URL
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            detectNavigation();
            currentUrl = window.location.href;
        }
    }, 1000);
}
