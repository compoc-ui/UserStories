
export interface UserStory {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  classification: string;
  priority: 'High' | 'Medium' | 'Low';
  additionalData?: Record<string, string>; // Capture all other columns
}

export type LanguageFilter = 'English' | 'Arabic' | 'Both';

export interface CSVRow {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  classification?: string;
  priority?: string;
  additionalData?: Record<string, string>;
}
