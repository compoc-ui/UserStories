
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

  const formatValue = (val: any) => {
    const str = String(val);
    if (str.includes('\n') || str.includes(' - ')) {
      return (
        <ul className={`list-none space-y-2 mt-2 ${isAr ? 'mr-0' : 'ml-0'}`}>
          {str.split('\n').map((line, i) => {
            const cleanLine = line.trim().replace(/^-/, '').trim();
            if (!cleanLine) return null;
            return (
              <li key={i} className="flex gap-3 items-start">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isAr ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
                <span className="text-slate-600 text-[13px] leading-relaxed">{cleanLine}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    return <p className="text-slate-600 text-sm leading-relaxed mt-1">{str}</p>;
  };

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className={`bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-300 relative overflow-hidden group border-t-4 ${accentColor} ${isAr ? 'arabic-text rounded-[1.25rem]' : 'rounded-[1.25rem]'} ${isExpanded ? 'pb-8 shadow-md' : 'pb-0'}`}
    >
      {/* Header Section */}
      <div className={`p-5 flex items-start justify-between gap-4 ${isExpanded ? 'border-b border-slate-50' : ''}`}>
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-1.5">
            {/* ID remains, but priority and classification badges are removed as per previous request */}
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest select-none">ID: {story.id}</div>
          </div>
          <h4 className={`font-black text-slate-900 leading-tight transition-colors group-hover:text-indigo-600 ${isAr ? 'text-xl' : 'text-lg'}`}>
            {isAr ? story.titleAr : story.titleEn}
          </h4>
        </div>
        
        <div className={`mt-1 transition-transform duration-500 transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Details Section (Hidden when collapsed) */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100 p-8 pt-5' : 'max-h-0 opacity-0'}`}>
        <div className="mb-8">
          <h5 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 ${isAr ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {isAr ? 'وصف المتطلبات' : 'Story Narrative'}
          </h5>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic opacity-90 border-l-2 border-slate-100 pl-4 py-1">
            {isAr ? story.descriptionAr : story.descriptionEn}
          </p>
        </div>

        {story.additionalData && Object.keys(story.additionalData).length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-100">
            {Object.entries(story.additionalData).map(([key, value]) => {
              const kLower = key.toLowerCase();
              const valStr = String(value);

              if (kLower.includes('title') || kLower.includes('desc') || kLower.includes('story') || kLower === 'us' || kLower === 'id' || kLower === 'classification' || kLower === 'priority') return null;
              if (!valStr) return null;

              const keyHasArabic = hasArabic(key);
              const valHasArabic = hasArabic(valStr);

              if (isAr) {
                if (!keyHasArabic && !valHasArabic) return null;
              } else {
                if (keyHasArabic || valHasArabic) return null;
              }

              const displayKey = key.replace(/\((EN|AR)\)$/i, '').trim();

              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1 h-3.5 rounded-full ${isAr ? 'bg-emerald-400' : 'bg-indigo-400'}`}></div>
                    <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{displayKey}</h6>
                  </div>
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
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
