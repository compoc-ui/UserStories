
import React from 'react';
import { UserStory } from '../types';

interface ManageStoriesProps {
  stories: UserStory[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

const ManageStories: React.FC<ManageStoriesProps> = ({ stories, onDelete, onDeleteAll }) => {
  if (stories.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-40 bg-slate-50/50">
        <h3 className="text-2xl font-black text-slate-300 italic uppercase tracking-widest">Inventory Empty</h3>
      </div>
    );
  }

  const allKeys: string[] = Array.from(new Set(stories.flatMap(s => Object.keys(s.additionalData || {}))));

  return (
    <div className="w-full px-4 lg:px-8 py-12">
      <div className="w-full flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Master Inventory</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Direct control over source data rows</p>
        </div>
        <button 
          onClick={onDeleteAll}
          className="group flex items-center gap-3 px-8 py-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Purge Entire Inventory
        </button>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Delete</th>
                {allKeys.map(key => (
                  <th key={key} className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stories.map(story => (
                <tr key={story.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="p-8 text-center">
                    <button 
                      onClick={() => onDelete(story.id)}
                      className="text-slate-300 hover:text-rose-500 transition-all transform hover:scale-125"
                      title="Delete this row"
                    >
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </td>
                  {allKeys.map(key => (
                    <td key={key} className="p-8 text-sm font-bold text-slate-600 max-w-lg">
                      <div className="truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                        {story.additionalData?.[key as string] || '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStories;
