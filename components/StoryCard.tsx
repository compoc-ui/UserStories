
import React from 'react';
import { UserStory } from '../types.ts';

interface StoryCardProps {
  story: UserStory;
  variant: 'en' | 'ar';
  isExpanded: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, variant, isExpanded }) => {
  const isAr = variant === 'ar';
  const themeColor = isAr ? 'emerald' : 'indigo';
  const accentBorder = isAr ? 'border-emerald-500' : 'border-indigo-600';
  const barColor = isAr ? 'bg-emerald-400' : 'bg-indigo-600';
  const textColor = isAr ? 'text-emerald-600' : 'text-indigo-600';
  const bulletColor = isAr ? 'bg-emerald-400' : 'bg-indigo-600';

  const hasArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  // Fallback logic for description
  const getEffectiveDescription = () => {
    let main = isAr ? story.descriptionAr : story.descriptionEn;
    
    // If empty, try to find a matching key in additionalData
    if (!main && story.additionalData) {
      const match = Object.entries(story.additionalData).find(([k, v]) => {
        const kl = k.toLowerCase();
        const matchesType = kl.includes('desc') || kl.includes('story') || kl.includes('وصف') || kl.includes('قصة');
        const matchesLang = isAr ? hasArabic(String(v)) : !hasArabic(String(v));
        return matchesType && matchesLang;
      });
      if (match) main = String(match[1]);
    }
    
    // Last resort fallback to opposite language
    if (!main) main = isAr ? story.descriptionEn : story.descriptionAr;
    
    return main || (isAr ? 'لم يتم توفير وصف...' : 'No description provided...');
  };

  const getDisplayLabel = (key: string): string => {
    const k = key.toLowerCase();
    if (isAr) {
      if (k.includes('title') || k.includes('عنوان')) return 'العنوان';
      if (k.includes('user story') || k.includes('قصة')) return 'قصة المستخدم';
      if (k.includes('acceptance criteria') || k.includes('معايير')) return 'معايير القبول';
      if (k.includes('system messages') || k.includes('رسائل')) return 'رسائل النظام';
      if (k.includes('fields specification') || k.includes('توصيف')) return 'توصيف الحقول';
      return key;
    } else {
      if (k.includes('title')) return 'Title';
      if (k.includes('user story')) return 'USER STORY';
      if (k.includes('acceptance criteria')) return 'ACCEPTANCE CRITERIA';
      if (k.includes('system messages')) return 'SYSTEM MESSAGES';
      if (k.includes('fields specification')) return 'FIELDS SPECIFICATION';
      return key.toUpperCase();
    }
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <div className={`flex items-center gap-2 mb-3 mt-6 ${isAr ? 'flex-row' : 'flex-row'}`}>
      {!isAr && <div className={`w-1 h-4 rounded-full ${barColor}`}></div>}
      <span className={`text-[11px] font-black tracking-[0.15em] uppercase text-slate-800`}>
        {label}
      </span>
      {isAr && <div className={`w-1 h-4 rounded-full ${barColor}`}></div>}
    </div>
  );

  const formatValue = (val: any) => {
    const str = String(val);
    const isList = str.includes('\n') || str.includes('•') || str.includes('- ') || str.includes('|');
    
    if (isList) {
      const separators = /[\n|]/;
      return (
        <ul className="space-y-4">
          {str.split(separators).map((line, i) => {
            const cleanLine = line.trim().replace(/^[•\-\*]/, '').trim();
            if (!cleanLine) return null;
            return (
              <li key={i} className={`flex gap-3 items-start`}>
                <span className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${bulletColor}`}></span>
                <span className="text-slate-600 text-[13px] font-medium leading-relaxed flex-grow">
                  {cleanLine}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
    return <p className={`text-slate-600 text-[13.5px] font-medium leading-relaxed`}>{str}</p>;
  };

  const currentDesc = getEffectiveDescription();

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className={`bg-white border-2 ${accentBorder} rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'pb-10 shadow-md ring-4 ring-slate-100/50' : 'hover:bg-slate-50/50 hover:scale-[1.01]'}`}
    >
      {/* Header */}
      <div className={`p-8 lg:p-10 flex items-start justify-between gap-6 ${isExpanded ? 'pb-2' : ''}`}>
        <div className="flex-grow">
          <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-2">
            ID: {story.id}
          </div>
          <h2 className={`font-black text-slate-900 leading-tight ${isExpanded ? 'text-2xl' : 'text-xl'}`}>
            {(isAr ? story.titleAr : story.titleEn) || (isAr ? story.titleEn : story.titleAr) || 'Untitled'}
          </h2>
        </div>
        
        <div className={`mt-2 flex-shrink-0 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm bg-white`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden px-8 lg:px-10 ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="w-full">
          <SectionLabel label={isAr ? 'قصة المستخدم' : 'USER STORY'} />
          <div className={`bg-slate-100/70 border border-slate-200/60 rounded-2xl p-6 mb-2 min-h-[60px]`}>
             <p className="text-slate-600 text-[14px] italic leading-relaxed font-bold">
               {currentDesc}
             </p>
          </div>
        </div>

        {story.additionalData && Object.entries(story.additionalData).map(([key, value]) => {
          const kLower = key.toLowerCase().trim();
          const valStr = String(value);
          const valHasAr = hasArabic(valStr);
          const keyHasAr = hasArabic(key);

          if (isAr) {
            if (!valHasAr && !keyHasAr) return null;
          } else {
            if (valHasAr || keyHasAr) return null;
          }

          // Redundancy Filter: Only skip if this value is EXACTLY what is already shown in Title or US
          const valLower = valStr.toLowerCase().trim();
          const mainTitle = (isAr ? story.titleAr : story.titleEn)?.toLowerCase().trim();
          const mainDesc = currentDesc.toLowerCase().trim();

          if (valLower === mainTitle || valLower === mainDesc) return null;

          if (kLower === '#' || kLower === 'us' || kLower === 'ref' || kLower === 'no' || kLower.includes('id')) {
            return null;
          }
          
          // Labels that are redundant IF they are empty or already handled
          if ((kLower.includes('title') || kLower.includes('عنوان')) && (isAr ? story.titleAr : story.titleEn)) return null;
          if ((kLower.includes('description') || kLower.includes('story') || kLower.includes('وصف') || kLower.includes('قصة')) && currentDesc && currentDesc !== 'No description provided...') return null;

          const displayLabel = getDisplayLabel(key.replace(/\((EN|AR)\)$/i, '').trim());

          return (
            <div key={key} className="w-full">
              <SectionLabel label={displayLabel} />
              <div className={`bg-slate-100/70 border border-slate-200/60 rounded-2xl p-6 mb-2`}>
                {formatValue(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryCard;
