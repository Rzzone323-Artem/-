(function () {
    function initSoundControls() {
        if (!window.soundManager) return;
        if (document.getElementById('soundControls')) return;

        const root = document.createElement('div');
        root.id = 'soundControls';
        root.style.position = 'fixed';
        root.style.top = '10px';
        root.style.left = '10px';
        root.style.zIndex = '1000';
        root.style.background = 'rgba(0,0,0,0.8)';
        root.style.border = '2px solid #4B0082';
        root.style.padding = '10px';
        root.style.borderRadius = '10px';
        root.style.fontFamily = "Times New Roman, serif";

        const currentVolume = typeof window.soundManager.volume === 'number' ? window.soundManager.volume : 0.3;
        const initialSliderValue = Math.round(currentVolume * 100);

        root.innerHTML = `
            <div style="color: #C0C0C0; font-size: 12px; margin-bottom: 5px;">🔊 ЗВУКОВОЙ ПАНЕЛЬ</div>
            <button id="soundToggleBtn" style="background: #4B0082; color: #C0C0C0; border: none; padding: 5px 10px; margin: 2px; cursor: pointer; border-radius: 5px; font-size: 11px;">
                <span id="soundToggleText">🔊 ВКЛ</span>
            </button>
            <div style="margin-top: 5px;">
                <label style="color: #C0C0C0; font-size: 10px;">ГРОМКОСТЬ:</label>
                <input type="range" id="volumeSlider" min="0" max="100" value="${initialSliderValue}" style="width: 100px; vertical-align: middle;">
            </div>
            <div style="margin-top: 5px;">
                <button data-sound="click" style="background: #333; color: #C0C0C0; border: none; padding: 2px 5px; margin: 1px; cursor: pointer; border-radius: 3px; font-size: 9px;">КЛИК</button>
                <button data-sound="mystic" style="background: #333; color: #C0C0C0; border: none; padding: 2px 5px; margin: 1px; cursor: pointer; border-radius: 3px; font-size: 9px;">МИСТИКА</button>
                <button data-sound="zone" style="background: #333; color: #C0C0C0; border: none; padding: 2px 5px; margin: 1px; cursor: pointer; border-radius: 3px; font-size: 9px;">ЗОНА</button>
            </div>
        `;

        document.body.appendChild(root);

        const toggleText = root.querySelector('#soundToggleText');
        const toggleBtn = root.querySelector('#soundToggleBtn');
        const slider = root.querySelector('#volumeSlider');

        toggleBtn.addEventListener('click', () => {
            const enabled = window.soundManager.toggle();
            toggleText.textContent = enabled ? '🔊 ВКЛ' : '🔈 ВЫКЛ';
        });

        slider.addEventListener('input', (e) => {
            const value = Number(e.target.value);
            window.soundManager.setVolume(value / 100);
        });

        root.querySelectorAll('button[data-sound]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-sound');
                if (!type) return;
                if (type === 'click') window.soundManager.playClick();
                if (type === 'mystic') window.soundManager.playMysticChime();
                if (type === 'zone') window.soundManager.playZoneAmbient();
            });
        });

        let minimized = false;
        root.addEventListener('dblclick', () => {
            const elements = root.querySelectorAll('div:not(:first-child), button:not(#soundToggleBtn), input');
            elements.forEach((el) => {
                el.style.display = minimized ? 'block' : 'none';
            });
            minimized = !minimized;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSoundControls);
    } else {
        initSoundControls();
    }
})();
