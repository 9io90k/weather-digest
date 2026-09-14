
export function printWeatherReport(reportData, fromCache = false){
    const sourceLabel = fromCache ? '[КЭШ]' : '[СЕТЬ]';
    console.log(`\n=======================================`);
    console.log(`Город: ${reportData.city}, ${reportData.country}, ${sourceLabel}`);
    console.log(`Координаты: широта ${reportData.latitude}, Долгота ${reportData.longitude}`);
    console.log(`-----------------------------------------`);
    const tableData = reportData.forecast.map(day => ({
        'Дата': day.date,
        'Мин. темп (°C)': `${day.tempMin}°C`,
        'Макс. темп (°C)': `${day.tempMax}°C`,
        'Осадки (мм)': `${day.precipitation} мм` 
    }));

    console.table(tableData);
}

export function printError(cityName, errorMessage){
    if(cityName){
        console.error(`\n[ОШИБКА] Город "${cityName}": ${errorMessage}`);
    } else {
        console.error(`\n[ОШИБКА]: ${errorMessage}`);
    }
}
