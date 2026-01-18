
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
  // State to track expanded stories. Empty by default so all are collapsed.
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
        <div className="w-20 h-20 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
          <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Workspace is empty</h3>
        <p className="text-slate-400 mt-2 font-medium">Upload a requirements file to see them here.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50/20">
      {/* Control Bar */}
      <div className="sticky top-[72px] z-40 w-full px-6 lg:px-10 py-4 bg-white border-b border-slate-200">
        <div className="w-full flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-grow w-full md:max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search requirements..."
              className="block w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['English', 'Arabic', 'Both'] as LanguageFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setLangFilter(f)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    langFilter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CATEGORY</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-4 py-2 text-slate-700 outline-none cursor-pointer"
              >
                {classifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="w-full px-6 lg:px-10 py-10 flex-grow">
        <div className="space-y-6 max-w-[1920px] mx-auto">
          {filteredStories.map((story, index) => {
            const isExpanded = expandedIds.has(story.id);
            return (
              <div 
                key={story.id} 
                className="w-full group cursor-pointer"
                onClick={() => toggleExpand(story.id)}
              >
                <div className={`grid gap-6 lg:gap-10 transition-all duration-300 ${langFilter === 'Both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {(langFilter === 'English' || langFilter === 'Both') && (
                    <StoryCard story={story} variant="en" isExpanded={isExpanded} />
                  )}
                  {(langFilter === 'Arabic' || langFilter === 'Both') && (
                    <StoryCard story={story} variant="ar" isExpanded={isExpanded} />
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
