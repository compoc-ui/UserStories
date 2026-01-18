
import { CSVRow } from "../types.ts";
import * as XLSX from "xlsx";

export async function parseFileToRows(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("No data found in file."));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
        
        if (rawData.length === 0) {
          resolve([]);
          return;
        }

        const isVertical = rawData.slice(0, 5).some(row => {
          const firstCol = String(row[0] || "").toLowerCase();
          return ['title', 'user story', 'us', 'description', 'classification'].includes(firstCol) || /[\u0600-\u06FF]/.test(firstCol);
        });

        if (isVertical) {
          const row: CSVRow = { additionalData: {} };
          
          rawData.forEach(record => {
            const key = String(record[0] || "").trim();
            const valEn = String(record[1] || "").trim();
            const valAr = String(record[2] || "").trim();
            
            if (!key) return;

            const k = key.toLowerCase();
            
            // Map core fields with broader keywords
            if (k.includes('title') || k.includes('عنوان') || k.includes('الموضوع') || k.includes('اسم')) {
              row.titleEn = valEn || row.titleEn;
              row.titleAr = valAr || row.titleAr;
            } else if (k.includes('story') || k.includes('description') || k.includes('قصة') || k.includes('وصف') || k.includes('متطلب')) {
              row.descriptionEn = valEn || row.descriptionEn;
              row.descriptionAr = valAr || row.descriptionAr;
            } else if (k.includes('class') || k.includes('تصنيف') || k.includes('نوع')) {
              row.classification = valEn || valAr || row.classification;
            } else if (k.includes('priority') || k.includes('أولوية')) {
              row.priority = valEn || valAr || row.priority;
            } else {
              if (row.additionalData) {
                if (valEn) row.additionalData[`${key} (EN)`] = valEn;
                if (valAr) row.additionalData[`${key} (AR)`] = valAr;
                if (!valAr && valEn) row.additionalData[key] = valEn;
                if (!valEn && valAr) row.additionalData[key] = valAr;
              }
            }
          });
          
          resolve([row]);
        } else {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const rows: CSVRow[] = jsonData.map((item: any) => {
            const row: CSVRow = { additionalData: {} };
            Object.keys(item).forEach(key => {
              const k = key.toLowerCase().trim();
              const val = String(item[key]).trim();
              
              if (k.includes('title') || k.includes('عنوان')) {
                if (k.includes('ar') || /[\u0600-\u06FF]/.test(val)) row.titleAr = val;
                else row.titleEn = val;
              } else if (k.includes('desc') || k.includes('story') || k.includes('وصف') || k.includes('قصة')) {
                if (k.includes('ar') || /[\u0600-\u06FF]/.test(val)) row.descriptionAr = val;
                else row.descriptionEn = val;
              } else if (k.includes('class')) {
                row.classification = val;
              } else if (k.includes('priority')) {
                row.priority = val;
              } else {
                if (row.additionalData) row.additionalData[key] = val;
              }
            });
            return row;
          });
          resolve(rows);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
