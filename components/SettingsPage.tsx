
import React, { useState } from 'react';
import { Project, UserSettings, TaskPriority } from '../types';

interface SettingsPageProps {
  projects: Project[];
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, name: string, color: string) => void;
  onResetData: () => void;
}

type TabType = 'general' | 'projects' | 'appearance' | 'ai' | 'advanced';

const SettingsPage: React.FC<SettingsPageProps> = ({
  projects,
  settings,
  onUpdateSettings,
  onDeleteProject,
  onUpdateProject,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
  };

  const tabs: { id: TabType, label: string }[] = [
    { id: 'general', label: 'Basic Info' },
    { id: 'projects', label: 'Projects' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'ai', label: 'Integrations' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
      {/* Settings Header */}
      <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
            <span className="text-blue-600 text-xs font-bold">{localSettings.userName.charAt(0)}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation */}
      <div className="px-8 border-b border-slate-100 bg-white sticky top-0 z-10">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-xs font-bold tracking-tight transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'text-slate-900 border-slate-900' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl w-full mx-auto px-8 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-400">
        {activeTab === 'general' && (
          <>
            <section className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold border border-blue-100 shadow-sm overflow-hidden">
                    {localSettings.userName.charAt(0)}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Profile Picture</h3>
                  <p className="text-sm text-slate-500 mb-3">Upload a new avatar or use a default one.</p>
                  <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <InputGroup label="Full Name">
                  <input 
                    type="text"
                    value={localSettings.userName}
                    onChange={(e) => setLocalSettings({...localSettings, userName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
                  />
                </InputGroup>
                <InputGroup label="Email Address">
                  <input 
                    type="email"
                    value={localSettings.userEmail}
                    onChange={(e) => setLocalSettings({...localSettings, userEmail: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
                  />
                </InputGroup>
              </div>
            </section>

            <div className="pt-4">
              <button 
                onClick={handleSaveSettings}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center"
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Workspace Projects</h3>
                <p className="text-sm text-slate-500">Manage all existing projects and their configurations.</p>
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Color</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-5 h-5 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: p.color }}></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onDeleteProject(p.id)}
                          className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'appearance' && (
          <section className="space-y-8">
             <div className="space-y-4">
               <h3 className="text-lg font-bold text-slate-900">Theme Preference</h3>
               <div className="grid grid-cols-3 gap-4">
                  {(['light', 'dark', 'system'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setLocalSettings({...localSettings, theme})}
                      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all space-y-3 ${
                        localSettings.theme === theme 
                        ? 'border-slate-900 bg-slate-50 shadow-inner' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-full aspect-video rounded-lg ${
                        theme === 'light' ? 'bg-slate-200' : theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-slate-200 to-slate-800'
                      }`}></div>
                      <span className="text-xs font-bold capitalize">{theme}</span>
                    </button>
                  ))}
               </div>
             </div>

             <div className="pt-4">
              <button 
                onClick={handleSaveSettings}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
              >
                Update Appearance
              </button>
            </div>
          </section>
        )}

        {activeTab === 'ai' && (
          <section className="space-y-8">
            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-4 shadow-sm relative overflow-hidden">
               {/* Decorative Background Icon */}
               <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-5 rotate-12 scale-150">
                <svg className="w-64 h-64 text-indigo-900" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               
               <div className="flex items-center space-x-3 text-indigo-900">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Gemini Integration</h3>
              </div>
              <p className="text-indigo-800/80 leading-relaxed font-medium">
                Unlock high-fidelity workspace intelligence. Gemini 2.5 Pro manages your task logic, refines vague goals, and provides executive-level summaries.
              </p>
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
                <span>Model Active: Gemini 2.5 Flash</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group cursor-pointer" onClick={() => setLocalSettings({...localSettings, enableAISummaries: !localSettings.enableAISummaries})}>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Task Summarization</h4>
                  <p className="text-xs text-slate-500">Automatically generate professional summaries for every task.</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${localSettings.enableAISummaries ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${localSettings.enableAISummaries ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>

              <InputGroup label="Default Task Priority">
                <select 
                  value={localSettings.defaultPriority}
                  onChange={(e) => setLocalSettings({...localSettings, defaultPriority: e.target.value as TaskPriority})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <option value={TaskPriority.LOW}>Low Intensity</option>
                  <option value={TaskPriority.MEDIUM}>Moderate Intensity</option>
                  <option value={TaskPriority.HIGH}>Urgent / Critical</option>
                </select>
              </InputGroup>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSaveSettings}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
              >
                Save AI Config
              </button>
            </div>
          </section>
        )}

        {activeTab === 'advanced' && (
          <section className="space-y-8">
            <div className="p-8 border border-red-100 bg-red-50/20 rounded-[2rem] space-y-6">
              <div className="flex items-center space-x-3 text-red-700">
                <div className="p-2 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight">Danger Zone</h3>
              </div>
              <p className="text-sm text-red-900/70 leading-relaxed font-medium">
                Resetting your workspace will permanently purge all tasks, sub-tasks, and custom project data. This action is irreversible.
              </p>
              <button 
                onClick={() => {
                  if(confirm("Permanently wipe workspace?")) {
                    onResetData();
                  }
                }}
                className="text-xs font-bold text-white bg-red-600 px-6 py-3 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Wipe Workspace Data
              </button>
            </div>

            <div className="p-8 border border-slate-100 bg-slate-50/50 rounded-[2rem] space-y-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Data Integrity</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Ensure your data is portable. Download your entire workspace state as a verified JSON manifest.
              </p>
              <button className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
                Download Workspace Manifest
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
