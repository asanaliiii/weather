// 1. Загрузка интерфейса (ядро burger.js)
document.addEventListener("DOMContentLoaded", () => {
    fetch('interface.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Сетевая ошибка при загрузке интерфейса');
            }
            return response.text();
        })
        .then(html => {
            // Вставляем интерфейс в наш контейнер (например, в body или специальный div)
            document.body.innerHTML = html;
            
            // 2. Когда интерфейс успешно загружен и появился в DOM, 
            // запускаем рендеринг нашего нового прогноза!
            renderExtendedForecast();
            
            // Здесь же можно инициализировать кнопки, если они есть
            initAppLogic();
        })
        .catch(error => {
            console.error('Ошибка burger.js:', error);
        });
});

// 3. Функция для вывода прогноза по дням
function renderExtendedForecast() {
    const forecastList = document.getElementById('forecast-list');
    if (!forecastList) return;

    // Массив с прогнозом
    const daysData = [
        { day: 'Пон, 6 июля', icon: '☀️', temp: '+29°', humidity: '40%', cond: 'Ясно' },
        { day: 'Втор, 7 июля', icon: '🌦️', temp: '+27°', humidity: '55%', cond: 'Небольшой дождь' },
        { day: 'Сред, 8 июля', icon: '⛈️', temp: '+24°', humidity: '78%', cond: 'Гроза' },
        { day: 'Четв, 9 июля', icon: '☁️', temp: '+25°', humidity: '60%', cond: 'Облачно' },
        { day: 'Пятн, 10 июля', icon: '⛅', temp: '+28°', humidity: '48%', cond: 'Переменная облачность' }
    ];

    forecastList.innerHTML = ''; // Очищаем контейнер

    daysData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'forecast-item';
        row.innerHTML = `
            <div class="forecast-day">${item.day}</div>
            <div class="forecast-details">
                <span class="forecast-pop">💧 ${item.humidity}</span>
                <span title="${item.cond}">${item.icon}</span>
                <span class="forecast-temp">${item.temp}</span>
            </div>
        `;
        forecastList.appendChild(row);
    });
}

// Дополнительная логика (поиск, обновление геопозиции и т.д.)
function initAppLogic() {
    const refreshBtn = document.getElementById('geo-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            alert('Обновление геопозиции...');
        });
    }
}