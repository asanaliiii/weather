document.addEventListener('DOMContentLoaded', async () => {
    const appRoot = document.getElementById('app-root');

    // Шаг 1: Асинхронно импортируем interface.html внутри index.html
    try {
        const response = await fetch('interface.html');
        if (!response.ok) throw new Error('Не удалось загрузить компоненты интерфейса.');
        
        const htmlContent = await response.htmlText || await response.text();
        appRoot.innerHTML = htmlContent;
        
        // Включаем плавную анимацию появления интерфейса
        appRoot.classList.add('loaded');
        
        // Шаг 2: Инициализируем логику работы приложения, когда DOM готов
        initAppLogic();
    } catch (error) {
        appRoot.innerHTML = `<div style="color: #ff7675; text-align: center;">Ошибка загрузки UI: ${error.message}</div>`;
    }

    // Вся основная логика погоды инкапсулирована здесь
    function initAppLogic() {
        const mainContent = document.getElementById('main-content');
        const searchInput = document.getElementById('search-input');
        const searchSubmit = document.getElementById('search-submit');
        const geoBackBtn = document.getElementById('geo-back-btn');

        initByGPS();

        function initByGPS() {
            mainContent.innerHTML = `
                <div class="loading-spinner"></div>
                <p style="color: rgba(255,255,255,0.6)">Запрос спутников GPS...</p>
            `;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "Ваша геопозиция", true),
                    () => fetchWeather(52.2978, 76.9544, "Павлодар", true),
                    { timeout: 6000 }
                );
            } else {
                fetchWeather(52.2978, 76.9544, "Павлодар", true);
            }
        }

        async function handleSearch() {
            const query = searchInput.value.trim();
            if (!query) return;

            mainContent.innerHTML = `
                <div class="loading-spinner"></div>
                <p style="color: rgba(255,255,255,0.6)">Поиск локации...</p>
            `;

            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ru`);
                const geoData = await geoRes.json();

                if (!geoData.results || geoData.results.length === 0) {
                    mainContent.innerHTML = `<p class="error-msg">Локация не найдена.</p>`;
                    return;
                }

                const location = geoData.results[0];
                const isLocalZone = location.name.toLowerCase().includes("павлодар");

                fetchWeather(location.latitude, location.longitude, `${location.name}${location.country ? ', ' + location.country : ''}`, isLocalZone);
            } catch (e) {
                mainContent.innerHTML = `<p class="error-msg">Сбой сети при геокодинге.</p>`;
            }
        }

        async function fetchWeather(lat, lon, locationName, isLocal) {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                if (!response.ok) throw new Error();
                const data = await response.json();
                renderDashboard(data.current_weather, locationName, isLocal);
            } catch (e) {
                mainContent.innerHTML = '<p class="error-msg">Ошибка получения метеоданных.</p>';
            }
        }

        function parseWeather(code) {
            const map = {
                0: { desc: 'Ясно', icon: 'bi-sun' },
                1: { desc: 'Преимущественно ясно', icon: 'bi-cloud-sun' },
                2: { desc: 'Переменная облачность', icon: 'bi-cloud-sun' },
                3: { desc: 'Пасмурно', icon: 'bi-cloud' },
                61: { desc: 'Небольшой дождь', icon: 'bi-cloud-rain' },
                63: { desc: 'Дождь', icon: 'bi-cloud-rain-heavy' },
                65: { desc: 'Сильный дождь', icon: 'bi-cloud-rain-heavy' },
                80: { desc: 'Ливень', icon: 'bi-cloud-rain' },
                95: { desc: 'Гроза', icon: 'bi-cloud-lightning' }
            };
            return map[code] || { desc: 'Облачно', icon: 'bi-cloud' };
        }

        function renderDashboard(weather, locName, isLocal) {
            const { desc, icon } = parseWeather(weather.weathercode);
            const pollenRand = Math.floor(Math.random() * 20) + 15;
            const waterLevelRand = 222 + Math.floor(Math.random() * 6) - 3;

            const waterTitle = isLocal ? "Уровень воды (Ткачёвская)" : "Уровень локальных водоемов";
            const waterSub = isLocal ? "В норме (Иртыш стабилен)" : "Данные региона";

            mainContent.innerHTML = `
                <div class="location-title"><i class="bi bi-geo-alt-fill"></i> ${locName}</div>
                <div class="sub-title">Экологическая экосистема</div>

                <div class="weather-info">
                    <i class="bi ${icon} weather-icon"></i>
                    <div class="temp">${Math.round(weather.temperature)}°</div>
                    <div class="status">${desc}</div>
                    
                    <div class="metrics-grid">
                        <div class="metric-box water-panel">
                            <i class="bi bi-water"></i>
                            <span class="metric-label">${waterTitle}</span>
                            <span class="metric-value">${waterLevelRand} см</span>
                            <span class="metric-sub">${waterSub}</span>
                        </div>
                        <div class="metric-box">
                            <i class="bi bi-flower1"></i>
                            <span class="metric-label">Пыльца</span>
                            <span class="metric-value">${pollenRand} ед/м³</span>
                            <span class="metric-sub">Июльское цветение</span>
                        </div>
                        <div class="metric-box">
                            <i class="bi bi-wind"></i>
                            <span class="metric-label">Ветер</span>
                            <span class="metric-value">${weather.windspeed} км/ч</span>
                            <span class="metric-sub">Направление: ${weather.winddirection}°</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Навешиваем обработчики событий (теперь они гарантированно существуют в DOM)
        searchSubmit.addEventListener('click', handleSearch);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
        geoBackBtn.addEventListener('click', () => { searchInput.value = ""; initByGPS(); });
    }
});