// Система звуковых эффектов для сайта "Святой Алтарь"
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
        this.audioContext = null;
        this.initAudioContext();
    }

    // Инициализация Audio Context
    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log('Web Audio API не поддерживается');
        }
    }

    // Создание звука с помощью Web Audio API
    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return oscillator;
    }

    // Различные звуковые эффекты
    playClick() {
        if (!this.enabled) return;
        this.createTone(800, 0.1, 'square');
    }

    playHover() {
        if (!this.enabled) return;
        this.createTone(600, 0.05, 'sine');
    }

    playMysticChime() {
        if (!this.enabled) return;
        setTimeout(() => this.createTone(523.25, 0.3, 'sine'), 0);   // C5
        setTimeout(() => this.createTone(659.25, 0.3, 'sine'), 100); // E5
        setTimeout(() => this.createTone(783.99, 0.4, 'sine'), 200); // G5
    }

    playZoneAmbient() {
        if (!this.enabled) return;
        const frequencies = [100, 150, 200, 250];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.5, 'sawtooth');
            }, index * 100);
        });
    }

    playAlert() {
        if (!this.enabled) return;
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createTone(440, 0.2, 'square'), i * 200);
        }
    }

    playSuccess() {
        if (!this.enabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
            setTimeout(() => this.createTone(note, 0.2, 'sine'), index * 100);
        });
    }

    playError() {
        if (!this.enabled) return;
        this.createTone(200, 0.3, 'sawtooth');
    }

    playMystery() {
        if (!this.enabled) return;
        const frequencies = [440, 554.37, 659.25, 554.37]; // A4, C#5, E5, C#5
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.createTone(freq, 0.2, 'triangle'), index * 150);
        });
    }

    playTeleport() {
        if (!this.enabled) return;
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const freq = Math.random() * 1000 + 200;
                this.createTone(freq, 0.05, 'square');
            }, i * 25);
        }
    }

    // Управление звуком
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Инициализация звуков на странице
    initPageSounds() {
        // Звуки для всех кнопок и ссылок
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.type === 'submit') {
                this.playClick();
            }
        });

        // Звуки при наведении на меню
        document.querySelectorAll('.menu a, .product').forEach(element => {
            element.addEventListener('mouseenter', () => this.playHover());
        });

        // Звук при загрузке страницы
        setTimeout(() => this.playMysticChime(), 500);

        // Звук для форм
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('focus', () => this.playHover());
        });
    }
}

// Создаем глобальный экземпляр
window.soundManager = new SoundManager();

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Ждем первого взаимодействия пользователя для инициализации Audio Context
    const initAudio = () => {
        window.soundManager.initPageSounds();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
});

// Дополнительные функции для конкретных страниц
function playOrderSound() {
    window.soundManager.playSuccess();
    setTimeout(() => window.soundManager.playTeleport(), 300);
}

function playForumSound() {
    window.soundManager.playMystery();
}

function playCatalogSound() {
    window.soundManager.playZoneAmbient();
}

function playErrorSound() {
    window.soundManager.playError();
}

function playAlertSound() {
    window.soundManager.playAlert();
}
