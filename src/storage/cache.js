import fs from 'node:fs/promises'
import path from 'node:path'


const REPORTS_DIR = process.env.REPORTS_DIR || 'reports';

function getReportFilePath(cityName){
    const today = new Date().toISOString().split('T')[0];
    const fileName = '${cityName.trim()}-${today}.json';
    return path.resolve(REPORTS_DIR, fileName);
}

export async function saveReport(cityName, data){
    await fs.mkdir(REPORTS_DIR, {recursive: true});
    const filePath = getReportFilePath(cityName);
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');
}

export async function getReportFromCache(cityName){
    const filePath = getReportFilePath(cityName);
    try{
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch(error){
        if(error.code == "ENOENT"){
            return null;
        } else {
            throw error;
        }
    }
}