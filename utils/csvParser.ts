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
        
        // Convert to array of arrays to handle the vertical layout manually
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
        
        if (rawData.length === 0) {
          resolve([]);
          return;
        }

        // Detect if this is a "Vertical" format (Field in Col A, EN in Col B, AR in Col C)
        // Check first few rows for keywords in Col A
        const isVertical = rawData.slice(0, 5).some(row => {
          const firstCol = String(row[0] || "").toLowerCase();
          return ['title', 'user story', 'us', 'classification'].includes(firstCol) || /[\u0600-\u06FF]/.test(firstCol);
        });

        if (isVertical) {
          const row: CSVRow = { additionalData: {} };
          
          rawData.forEach(record => {
            const key = String(record[0] || "").trim();
            const valEn = String(record[1] || "").trim();
            const valAr = String(record[2] || "").trim();
            
            if (!key) return;

            const k = key.toLowerCase();
            
            // Map core fields
            if (k === 'title' || k === 'عنوان' || k === 'الموضوع') {
              row.titleEn = valEn;
              row.titleAr = valAr;
            } else if (k === 'user story' || k === 'قصة المستخدم' || k === 'وصف') {
              row.descriptionEn = valEn;
              row.descriptionAr = valAr;
            } else if (k === 'classification' || k === 'التصنيف') {
              row.classification = valEn || valAr;
            } else if (k === 'priority' || k === 'الأولوية') {
              row.priority = valEn || valAr;
            } else {
              // Store as additional data pairs
              if (row.additionalData) {
                // We use specific keys to identify language later in the UI
                if (valEn) row.additionalData[`${key} (EN)`] = valEn;
                if (valAr) row.additionalData[`${key} (AR)`] = valAr;
                // Also store the raw key if it's a single value
                if (!valAr && valEn) row.additionalData[key] = valEn;
                if (!valEn && valAr) row.additionalData[key] = valAr;
              }
            }
          });
          
          resolve([row]);
        } else {
          // Standard horizontal layout (One story per row)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const rows: CSVRow[] = jsonData.map((item: any) => {
            const row: CSVRow = { additionalData: {} };
            Object.keys(item).forEach(key => {
              const k = key.toLowerCase().trim();
              const val = String(item[key]).trim();
              
              if (k.includes('title')) {
                if (k.includes('ar')) row.titleAr = val;
                else row.titleEn = val;
              } else if (k.includes('desc') || k.includes('story')) {
                if (k.includes('ar')) row.descriptionAr = val;
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