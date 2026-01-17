import { GoogleGenAI, Type } from "@google/genai";
import { UserStory, CSVRow } from "../types.ts";

export async function processAndEnrichStories(rows: CSVRow[]): Promise<UserStory[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing in process.env.API_KEY");
    // We return original rows if enrichment fails due to missing key
    return rows.map(row => ({
      id: Math.random().toString(36).substr(2, 9),
      titleEn: row.titleEn || row.titleAr || 'Untitled',
      titleAr: row.titleAr || row.titleEn || 'بدون عنوان',
      descriptionEn: row.descriptionEn || '',
      descriptionAr: row.descriptionAr || '',
      classification: row.classification || 'Uncategorized',
      priority: 'Medium',
      additionalData: row.additionalData
    }));
  }

  const ai = new GoogleGenAI({ apiKey });
  const stories: UserStory[] = [];
  
  for (const row of rows) {
    const prompt = `
      You are a professional product owner. Translate and enrich this user story. 
      Input Story:
      Title (EN): ${row.titleEn || 'N/A'}
      Title (AR): ${row.titleAr || 'N/A'}
      Description (EN): ${row.descriptionEn || 'N/A'}
      Description (AR): ${row.descriptionAr || 'N/A'}
      Current Classification: ${row.classification || 'Uncategorized'}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleEn: { type: Type.STRING },
              titleAr: { type: Type.STRING },
              descriptionEn: { type: Type.STRING },
              descriptionAr: { type: Type.STRING },
              classification: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            },
            required: ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr', 'classification', 'priority']
          }
        }
      });

      const data = JSON.parse(response.text.trim());
      stories.push({
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        // Prioritize original classification from Excel if it exists
        classification: row.classification || data.classification || 'Uncategorized',
        additionalData: row.additionalData
      });
    } catch (error) {
      stories.push({
        id: Math.random().toString(36).substr(2, 9),
        titleEn: row.titleEn || row.titleAr || 'Untitled',
        titleAr: row.titleAr || row.titleEn || 'بدون عنوان',
        descriptionEn: row.descriptionEn || '',
        descriptionAr: row.descriptionAr || '',
        classification: row.classification || 'Uncategorized',
        priority: (row.priority as any) || 'Medium',
        additionalData: row.additionalData
      });
    }
  }
  
  return stories;
}