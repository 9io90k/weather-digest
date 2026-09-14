const GEOGODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast"
const DEFAULT_TIMEOUT_MS = Number(process.env.TIMEOUT_MS) || 5000;

//Сетевой запрос с контролем таймаута и обработкой статусов
async function fetchWithTimeout(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Ошибка клиента API (HTTP ${response.status})`);
      }
      if (response.status >= 500) {
        throw new Error(`Сервер API временно недоступен (HTTP ${response.status})`);
      }
      throw new Error(`Ошибка сети: статус HTTP ${response.status}`);
    }

    try {
      return await response.json();
    } catch {
      throw new Error('Ответ сервера API не является корректным JSON.');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Превышено время ожидания ответа от сервера (${timeoutMs} мс).`);
    }
    if (error.cause && error.cause.code) {
      throw new Error(`Сетевой сбой: ${error.cause.code}. Проверьте интернет-соединение.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}


//Парсинг координат
export async function getCoordinatesByCity(cityName) {
    const url = new URL(GEOGODING_BASE_URL);
    const params = new URLSearchParams({
        name: cityName.trim(),
        count: '1',
        language: 'ru',
        format: 'json'
    });
    url.search = params.toString();

    const data = await fetchWithTimeout(url);

    if(!data.results || data.results.length === 0){
        throw new Error(`Город "${cityName}" не найден`)
    }
    const firstResult = data.results[0];
    return {
        name: firstResult.name,
        country: firstResult.country || 'Не указана',
        latitude: firstResult.latitude,
        longitude: firstResult.longitude
    }
}

//Парсинг прогноза
export async function getWeatherForecast(lat, lon, days = 3){
    const url = new URL(FORECAST_BASE_URL);
    const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
        forecast_days: String(days),
        timezone: 'auto'
    });
    url.search = params.toString();
    
    const data = await fetchWithTimeout(url);

    if(!data.daily || !data.daily.time){
        throw new Error('Получены неполный данные о прогнозе погоды');
    }

    const forecast = data.daily.time.map((currentDate, index) => {
        return {
            data: currentDate,
            tempMax: data.daily.temperature_2m_max[index],
            tempMin: data.daily.temperature_2m_min[index],
            precipitation: data.daily.precipitation_sum[index]
        };
    });
    return forecast;
}