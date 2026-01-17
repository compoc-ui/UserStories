import React, { useState, useMemo } from 'react';
import { UserStory, LanguageFilter } from '../types.ts';
import StoryCard from './StoryCard.tsx';

interface StoryListProps {
  stories: UserStory[];
  onReorder: (from: number, to: number) => void;
}

const StoryList: React.FC<StoryListProps> = ({ stories, onReorder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState<LanguageFilter>('Both');
  const [classFilter, setClassFilter] = useState<string>('All');
  // Track expanded state by story ID. Initialized as an empty set so all are closed by default.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Extract classifications directly from the stories (which came from Excel)
  const classifications = useMemo(() => {
    const set = new Set(stories.map(s => s.classification).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        story.titleEn.toLowerCase().includes(searchStr) ||
        story.titleAr.includes(searchTerm) ||
        story.descriptionEn.toLowerCase().includes(searchStr) ||
        story.descriptionAr.includes(searchTerm) ||
        Object.values(story.additionalData || {}).some(v => String(v).toLowerCase().includes(searchStr));
      const matchesClass = classFilter === 'All' || story.classification === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [stories, searchTerm, classFilter]);

  if (stories.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-40 bg-slate-50/30">
        <div className="w-24 h-24 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-8 border border-slate-100">
          <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Requirement Workspace Empty</h3>
        <p className="text-slate-400 mt-2 font-medium">Please upload a source file to start documenting.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50/50">
      {/* Dynamic Filter Header */}
      <div className="sticky top-[72px] z-40 w-full px-4 lg:px-8 py-4 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="w-full flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Search Box */}
          <div className="flex-grow w-full md:max-w-xl relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search requirements..."
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 bg-white p-1 rounded-2xl border border-slate-100">
            {/* Language Filter */}
            <div className="flex items-center gap-1 border-r border-slate-100 pr-2">
              {(['English', 'Arabic', 'Both'] as LanguageFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setLangFilter(f)}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                    langFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Category Filter - Styled to match screenshot */}
            <div className="flex items-center gap-3 pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">CATEGORY FILTER</span>
              <div className="relative">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border-none text-[13px] font-bold rounded-xl pl-4 pr-10 py-2 text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer min-w-[120px] shadow-sm transition-all hover:bg-slate-100"
                >
                  {classifications.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="w-full px-4 lg:px-8 py-10 relative flex-grow">
        {langFilter === 'Both' && (
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden lg:block"></div>
        )}

        <div className="space-y-4">
          {filteredStories.map((story, index) => {
            const isExpanded = expandedIds.has(story.id);
            return (
              <div key={story.id} className="group relative w-full">
                {/* Reorder Buttons */}
                <div className="absolute -left-10 lg:-left-12 top-4 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <button 
                    onClick={() => onReorder(index, index - 1)} 
                    disabled={index === 0} 
                    className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white disabled:opacity-20 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button 
                    onClick={() => onReorder(index, index + 1)} 
                    disabled={index === stories.length - 1} 
                    className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white disabled:opacity-20 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

                {/* Collapsible Wrapper */}
                <div 
                  onClick={() => toggleExpand(story.id)}
                  className={`w-full grid cursor-pointer transition-all duration-300 ${langFilter === 'Both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6 lg:gap-16`}
                >
                  {(langFilter === 'English' || langFilter === 'Both') && (
                    <StoryCard 
                      story={story} 
                      variant="en" 
                      isExpanded={isExpanded} 
                    />
                  )}
                  {(langFilter === 'Arabic' || langFilter === 'Both') && (
                    <StoryCard 
                      story={story} 
                      variant="ar" 
                      isExpanded={isExpanded} 
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoryList;