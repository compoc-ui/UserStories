
import React from 'react';
import { UserStory } from '../types';

interface StoryCardProps {
  story: UserStory;
  variant: 'en' | 'ar';
  isExpanded: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, variant, isExpanded }) => {
  const isAr = variant === 'ar';
  const accentColor = isAr ? 'border-emerald-500' : 'border-indigo-600';

  const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  // Field Name Mapping based on user list
  const getDisplayLabel = (key: string): string => {
    const k = key.toLowerCase();
    if (isAr) {
      if (k.includes('title') || k.includes('عنوان')) return 'العنوان';
      if (k.includes('user story') || k.includes('قصة')) return 'قصة المستخدم';
      if (k.includes('acceptance criteria') || k.includes('قبول')) return 'معايير القبول';
      if (k.includes('system messages') || k.includes('نظام')) return 'رسائل النظام';
      if (k.includes('fields specification') || k.includes('مواصفات')) return 'مواصفات الحقول';
      if (k.includes('scenario') || k.includes('سيناريو')) return 'السيناريو';
      return key;
    } else {
      if (k.includes('title')) return 'Title';
      if (k.includes('user story')) return 'User Story';
      if (k.includes('acceptance criteria')) return 'Acceptance Criteria';
      if (k.includes('system messages')) return 'System Messages';
      if (k.includes('fields specification')) return 'Fields Specification';
      if (k.includes('scenario')) return 'Scenario';
      if (k.includes('classification')) return 'Classification';
      return key;
    }
  };

  const formatValue = (val: any) => {
    const str = String(val);
    const isList = str.includes('\n') || str.includes(' - ');
    
    if (isList) {
      return (
        <ul className={`list-none space-y-3 mt-2 w-full`}>
          {str.split('\n').map((line, i) => {
            const cleanLine = line.trim().replace(/^-/, '').trim();
            if (!cleanLine) return null;
            return (
              <li key={i} className={`flex gap-4 items-start ${isAr ? 'flex-row' : 'flex-row'}`}>
                {/* Bullet point position stays semantic to language direction via dir attribute */}
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]`}></span>
                <span className={`text-slate-600 text-[13px] leading-relaxed flex-grow`}>
                  {cleanLine}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
    return <p className={`text-slate-600 text-sm leading-relaxed mt-1`}>{str}</p>;
  };

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className={`bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-300 relative overflow-hidden group border-t-4 ${accentColor} ${isAr ? 'arabic-text rounded-[1.25rem]' : 'rounded-[1.25rem]'} ${isExpanded ? 'pb-8 shadow-md' : 'pb-0'}`}
    >
      {/* Header Section (Always Visible) */}
      <div className={`p-5 flex items-start justify-between gap-4 ${isExpanded ? 'border-b border-slate-50' : ''}`}>
        <div className="flex-grow">
          <div className={`flex items-center gap-3 mb-1.5`}>
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest select-none">ID: {story.id}</div>
          </div>
          <h4 className={`font-black text-slate-900 leading-tight transition-colors group-hover:text-indigo-600 ${isAr ? 'text-xl' : 'text-lg'} ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? story.titleAr : story.titleEn}
          </h4>
        </div>
        
        <div className={`mt-1 transition-transform duration-500 transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content Section */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100 p-8 pt-5' : 'max-h-0 opacity-0'}`}>
        
        {/* User Story / Story Narrative Section */}
        <div className="mb-8">
          <div className={`flex items-center gap-2 mb-3`}>
            {/* Logic to place bar on left of text for both, but respect dir context */}
            <div className={`w-1 h-3.5 rounded-full ${isAr ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>
            <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAr ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {isAr ? 'وصف المتطلبات' : 'User Story'}
            </h5>
          </div>
          <p className={`text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic opacity-90 border-l-2 border-slate-100 pl-4 py-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? story.descriptionAr : story.descriptionEn}
          </p>
        </div>

        {/* Dynamic Sections from Excel Columns */}
        {story.additionalData && Object.keys(story.additionalData).length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-100">
            {Object.entries(story.additionalData).map(([key, value]) => {
              const kLower = key.toLowerCase();
              const valStr = String(value);

              // Filtering core logic: English card shouldn't show Arabic additional keys, vice versa
              const keyHasArabic = hasArabic(key);
              const valHasArabic = hasArabic(valStr);

              if (isAr) {
                if (!keyHasArabic && !valHasArabic) return null;
              } else {
                if (keyHasArabic || valHasArabic) return null;
              }

              // Filter out already shown fields
              if (kLower.includes('title') || kLower.includes('desc') || kLower.includes('story') || kLower === 'us' || kLower === 'id') return null;
              if (!valStr || valStr === "N/A" || valStr === "-") return null;

              const displayLabel = getDisplayLabel(key.replace(/\((EN|AR)\)$/i, '').trim());

              return (
                <div key={key}>
                  <div className={`flex items-center gap-2 mb-3`}>
                    <div className={`w-1 h-3.5 rounded-full bg-emerald-400`}></div>
                    <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.15em]">{displayLabel}</h6>
                  </div>
                  
                  <div className={`bg-slate-50/40 p-6 rounded-2xl border border-slate-100/50 ${isAr ? 'text-right' : 'text-left'}`}>
                    {formatValue(value)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
