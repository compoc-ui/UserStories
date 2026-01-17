import React, { useState, useRef } from 'react';
import { UserStory } from '../types.ts';
import { parseFileToRows } from '../utils/csvParser.ts';
import { processAndEnrichStories } from '../services/geminiService.ts';

interface CSVUploaderProps {
  onUploadComplete: (stories: UserStory[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUploadComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      setError("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls).");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const rows = await parseFileToRows(file);
      
      if (!rows || rows.length === 0) {
        throw new Error("The file seems empty or could not be read.");
      }

      // Filter out rows that have no meaningful data
      const validRows = rows.filter(r => 
        (r.titleEn && r.titleEn.length > 1) || 
        (r.titleAr && r.titleAr.length > 1) || 
        (r.descriptionEn && r.descriptionEn.length > 1) || 
        (r.descriptionAr && r.descriptionAr.length > 1)
      );
      
      if (validRows.length === 0) {
        setError("Could not find any user stories. Please check your column headers (e.g., use 'Title', 'Description').");
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const enrichedStories = await processAndEnrichStories(validRows);
      onUploadComplete(enrichedStories);
    } catch (err: any) {
      console.error("Upload process error:", err);
      setError(err.message || "An error occurred while processing your file.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isProcessing ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {isProcessing ? 'Processing with AI...' : 'Click or drag to upload CSV or Excel'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Supports .csv, .xlsx, and .xls formats
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Common Header Keywords</h4>
        <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600 border border-slate-100">
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">Title Field</span>
            <span>Title, Story, Subject</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">Description Field</span>
            <span>Description, Content, Body</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">Categorization</span>
            <span>Classification, Priority</span>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-slate-400 italic">
          * AI will automatically translate and fill in missing fields for you, even if you only provide one language.
        </p>
      </div>
    </div>
  );
};

export default CSVUploader;