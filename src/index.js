import { parseArgs } from 'node:util';
import { printError } from './format/view.js';
import { processWeatherReport } from './services/weatherService.js';

async function main(){
    let values;
    try {
        const parsed = parseArgs({
            options: {
                city: { type: 'string' },
                days: { type: 'string', default: '3'},
                'no-cache': { type: 'boolean', default: false}
                },
            allowPositionals: false
        });
        values = parsed.values;
    }   catch(err) {
        printError(null, `Некорректные параметры запуска: ${err.message}`);
        process.exit(1);
    }

    if(!values.city || values.city.trim() === ''){
        printError(null, 'Параметр --city обязателен для указания. Пример --city "Москва"');
        process.exit(1);
    }

    const daysNum = Number(values.days);
    if(Number.isNaN(daysNum) || daysNum < 1 || daysNum > 7) {
        printError(null, 'Параметр --days должен быть в числовом диапазоне от 1 до 7');
        process.exit(1);
    }
    const cities = values.city
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
    if(cities.length === 0){
        printError(null, 'Не указано ни одного корректного города');
        process.exit(1);
    }
    const tasks = cities.map(city => 
        processWeatherReport(city, daysNum, values['no-cache'])
    );

    const results = await Promise.allSettled(tasks);

    let hasErrors = false;

    results.forEach((result, index) => {
        if(result.status === 'rejected'){
            hasErrors = true;
            printError(cities[index], result.reason.message || 'Неизвестная ошибка');
        }
    });

    if(hasErrors){
        process.exitCode = 1;
    }
}

main().catch((err) => {
    printError(null, `Критический сбой приложения: ${err.message}`);
});


