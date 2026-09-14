import { getReportFromCache, saveReport } from "../storage/cache.js";
import { printWeatherReport } from "../format/view.js";
import { getCoordinatesByCity, getWeatherForecast } from "../api/openMeteo.js";

export async function processWeatherReport(cityName, days, noCache = false){
    if(!noCache){
        const cachedData = await getReportFromCache(cityName);
        if(cachedData){
            printWeatherReport(cachedData, true);
            return cachedData;
        }
    }

    const geo = await getCoordinatesByCity(cityName);
    const forecast = await getWeatherForecast(geo.latitude, geo.longitude, days);
    const reportData = {
        city: geo.name,
        country: geo.country,
        latitude: geo.latitude,
        longitude: geo.longitude,
        forecast
    };
    await saveReport(geo.name, reportData);
    printWeatherReport(reportData, false);
    return reportData;
}