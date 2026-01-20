
import React, { useState } from 'react';
import { Project, UserSettings, TaskPriority, Invitation } from '../types';
import { db } from '../services/instantDb';

interface SettingsPageProps {
  projects: Project[];
  settings: UserSettings;
  activeWorkspaceId: string;
  invitations: Invitation[];
  onUpdateSettings: (settings: UserSettings) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, name: string, color: string) => void;
  onResetData: () => void;
}

type TabType = 'general' | 'projects' | 'team' | 'appearance' | 'ai' | 'advanced';

const SettingsPage: React.FC<SettingsPageProps> = ({
  projects,
  settings,
  activeWorkspaceId,
  invitations,
  onUpdateSettings,
  onDeleteProject,
  onUpdateProject,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
  };

  const copyInviteLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/invite/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs: { id: TabType, label: string }[] = [
    { id: 'general', label: 'Basic Info' },
    { id: 'projects', label: 'Projects' },
    { id: 'team', label: 'Team' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'ai', label: 'AI Config' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
      <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h2>
        </div>
      </div>

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

      <div className="max-w-3xl w-full mx-auto px-8 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-400">
        {activeTab === 'general' && (
          <section className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold border border-blue-100 shadow-sm">
                {localSettings.userName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Profile Info</h3>
                <p className="text-sm text-slate-500 mb-3">Update your personal details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Full Name">
                <input 
                  type="text"
                  value={localSettings.userName}
                  onChange={(e) => setLocalSettings({...localSettings, userName: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none text-sm transition-all"
                />
              </InputGroup>
              <InputGroup label="Email Address">
                <input 
                  type="email"
                  value={localSettings.userEmail}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500"
                />
              </InputGroup>
            </div>
            <button onClick={handleSaveSettings} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              Save Profile
            </button>
          </section>
        )}

        {activeTab === 'team' && (
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Members & Invitations</h3>
              <p className="text-sm text-slate-500">Manage who has access to this workspace.</p>
            </div>

            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm bg-slate-50/30 p-2">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 divide-y divide-slate-50">
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Invitations</span>
                </div>
                {invitations.filter(i => i.workspaceId === activeWorkspaceId).map(invite => (
                  <div key={invite.id} className="px-6 py-5 flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{invite.email}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${invite.status === 'accepted' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {invite.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => copyInviteLink(invite.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${copiedId === invite.id ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
                      >
                        {copiedId === invite.id ? 'Copied Link!' : 'Copy Invite Link'}
                      </button>
                    </div>
                  </div>
                ))}
                {invitations.filter(i => i.workspaceId === activeWorkspaceId).length === 0 && (
                  <div className="px-6 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium italic">No active invitations found.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'advanced' && (
          <section className="space-y-8">
            <div className="p-8 border border-red-100 bg-red-50/20 rounded-[2rem] space-y-6">
              <div className="flex items-center space-x-3 text-red-700">
                <h3 className="text-xl font-bold tracking-tight">Danger Zone</h3>
              </div>
              <p className="text-sm text-red-900/70 font-medium">Resetting data will purge your current view. Use with caution.</p>
              <button 
                onClick={() => { if(confirm("Permanently wipe?")) onResetData(); }}
                className="text-xs font-bold text-white bg-red-600 px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg"
              >
                Wipe Workspace Data
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
