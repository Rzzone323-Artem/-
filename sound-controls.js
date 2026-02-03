(function () {
    function initSoundControls() {
        if (!window.soundManager && !window.audioManager) return;
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

        // Безопасное создание контента
        const titleDiv = safeCreateElement('div');
        titleDiv.textContent = '🔊 ЗВУКОВОЙ ПАНЕЛЬ';
        titleDiv.style.cssText = 'color: #C0C0C0; font-size: 12px; margin-bottom: 5px;';
        root.appendChild(titleDiv);

        const toggleBtn = safeCreateElement('button');
        toggleBtn.id = 'soundToggleBtn';
        toggleBtn.textContent = '🔊 ВКЛ';
        toggleBtn.style.cssText = 'background: #4B0082; color: #C0C0C0; border: none; padding: 5px 10px; margin: 2px; cursor: pointer; border-radius: 5px; font-size: 11px;';
        root.appendChild(toggleBtn);

        const volumeContainer = safeCreateElement('div');
        volumeContainer.style.cssText = 'margin-top: 5px;';
        
        const volumeLabel = safeCreateElement('label');
        volumeLabel.textContent = 'ГРОМКОСТЬ:';
        volumeLabel.style.cssText = 'color: #C0C0C0; font-size: 10px;';
        volumeContainer.appendChild(volumeLabel);
        
        const slider = safeCreateElement('input');
        slider.id = 'volumeSlider';
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = initialSliderValue;
        slider.style.cssText = 'width: 100px; vertical-align: middle;';
        volumeContainer.appendChild(slider);
        
        root.appendChild(volumeContainer);

        const buttonsContainer = safeCreateElement('div');
        buttonsContainer.style.cssText = 'margin-top: 5px;';
        
        const clickBtn = safeCreateElement('button');
        clickBtn.textContent = 'КЛИК';
        clickBtn.setAttribute('data-sound', 'click');
        clickBtn.style.cssText = 'background: #333; color: #C0C0C0; border: none; padding: 2px 5px; margin: 1px; cursor: pointer; border-radius: 3px; font-size: 9px;';
        buttonsContainer.appendChild(clickBtn);
        
        const mysticBtn = safeCreateElement('button');
        mysticBtn.textContent = 'МИСТИКА';
        mysticBtn.setAttribute('data-sound', 'mystic');
        mysticBtn.style.cssText = 'background: #333; color: #C0C0C0; border: none; padding: 2px 5px; margin: 1px; cursor: pointer; border-radius: 3px; font-size: 9px;';
        buttonsContainer.appendChild(mysticBtn);
        
        const zoneBtn = safeCreateElement('button');
        zoneBtn.textContent = 'ЗОНА';
        zoneBtn.setAttribute('data-sound', 'zone');
        zoneBtn.style.cssText = 'background: #333; color: #C0C0C0; border: none; padding: 2px 5px; margin: 1px; cursor: pointer; border-radius: 3px; font-size: 9px;';
        buttonsContainer.appendChild(zoneBtn);
        
        root.appendChild(buttonsContainer);

        document.body.appendChild(root);

        const toggleText = root.querySelector('#soundToggleText');
        const toggleBtnElement = root.querySelector('#soundToggleBtn');
        const sliderElement = root.querySelector('#volumeSlider');

        toggleBtnElement.addEventListener('click', () => {
            const enabled = window.soundManager.toggle();
            toggleBtnElement.textContent = enabled ? '🔊 ВКЛ' : '🔈 ВЫКЛ';
        });

        sliderElement.addEventListener('input', (e) => {
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
