import React, { useState, useEffect } from 'react';
import { UserStory } from './types.ts';
import CSVUploader from './components/CSVUploader.tsx';
import StoryList from './components/StoryList.tsx';
import ManageStories from './components/ManageStories.tsx';

const App: React.FC = () => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'stories'>('upload');

  // Load from persistent storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('storyflow_persistent_data');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStories(parsed);
          setActiveTab('stories');
        }
      } catch (e) {
        console.error("Failed to parse saved stories", e);
      }
    }
  }, []);

  // Save to persistent storage on every change
  useEffect(() => {
    localStorage.setItem('storyflow_persistent_data', JSON.stringify(stories));
  }, [stories]);

  const handleUploadComplete = (newStories: UserStory[]) => {
    setStories(prev => [...prev, ...newStories]);
    setActiveTab('stories');
  };

  const handleDeleteStory = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all user stories? This cannot be undone.")) {
      setStories([]);
      localStorage.removeItem('storyflow_persistent_data');
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= stories.length) return;
    const newStories = [...stories];
    const [moved] = newStories.splice(fromIndex, 1);
    newStories.splice(toIndex, 0, moved);
    setStories(newStories);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full shadow-sm">
        <div className="w-full px-4 lg:px-8">
          <div className="flex justify-between h-18 items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 leading-none">StoryFlow <span className="text-indigo-600">Pro</span></h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Requirement Engine</span>
              </div>
            </div>
            
            <nav className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'upload' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Upload
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'manage' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Inventory
                {stories.length > 0 && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[9px] ml-1">{stories.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('stories')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'stories' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                Viewer
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {activeTab === 'upload' && (
          <div className="w-full flex justify-center py-20 px-6">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Bilingual Documentation Engine</h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Upload your Excel requirements. Our AI automatically extracts, translates, and formats them into professional English-Arabic specifications.
                </p>
              </div>
              <CSVUploader onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        )}
        {activeTab === 'manage' && (
          <div className="w-full">
            <ManageStories 
              stories={stories} 
              onDelete={handleDeleteStory} 
              onDeleteAll={handleDeleteAll} 
            />
          </div>
        )}
        {activeTab === 'stories' && (
          <div className="w-full">
            <StoryList 
              stories={stories} 
              onReorder={handleReorder}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;