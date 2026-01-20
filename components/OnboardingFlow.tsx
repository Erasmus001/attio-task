
import React, { useState } from 'react';
import { db, id } from '../services/instantDb';

interface OnboardingFlowProps {
  userEmail: string;
  userId: string;
  onComplete: (workspaceId: string) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userEmail, userId, onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceIcon, setWorkspaceIcon] = useState('🏠');
  const [workspaceColor, setWorkspaceColor] = useState('#3B82F6');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);

  const commonIcons = ['🏠', '🚀', '🛠️', '📈', '📁', '🎨', '🌟', '🛡️', '💬', '💡'];
  const commonColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    setIsLoading(true);

    const workspaceId = id();
    try {
      await db.transact([
        db.tx.workspaces[workspaceId].update({
          name: workspaceName.trim(),
          icon: workspaceIcon,
          color: workspaceColor,
          ownerId: userId
        }),
        db.tx.kanbanColumns[id()].update({ title: 'To Do', isDefault: true, color: '#94A3B8', workspaceId }),
        db.tx.kanbanColumns[id()].update({ title: 'In Progress', isDefault: true, color: '#3B82F6', workspaceId }),
        db.tx.kanbanColumns[id()].update({ title: 'Done', isDefault: true, color: '#10B981', workspaceId })
      ]);
      setCreatedWorkspaceId(workspaceId);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmail = () => {
    if (currentEmail && currentEmail.includes('@') && !invitedEmails.includes(currentEmail)) {
      setInvitedEmails([...invitedEmails, currentEmail]);
      setCurrentEmail('');
    }
  };

  const handleFinish = async () => {
    if (!createdWorkspaceId) return;
    setIsLoading(true);
    
    try {
      // Create invitations in DB
      const invTx = invitedEmails.map(email => 
        db.tx.invitations[id()].update({
          email,
          workspaceId: createdWorkspaceId,
          inviterEmail: userEmail,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      );
      
      if (invTx.length > 0) {
        await db.transact(invTx);
      }
      
      onComplete(createdWorkspaceId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-6 py-12">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          <div className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]' : 'bg-slate-200'}`} />
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-200/60 p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <header className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create your workspace</h2>
              <p className="text-slate-500 font-medium mt-3">Where your team's tasks and projects live.</p>
            </header>

            <form onSubmit={handleCreateWorkspace} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Workspace Name</label>
                <input
                  autoFocus
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme Corp, Engineering, etc."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none text-[15px] font-medium transition-all shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {commonIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setWorkspaceIcon(icon)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${workspaceIcon === icon ? 'bg-slate-900 text-white shadow-lg scale-110' : 'bg-slate-50 hover:bg-slate-100 text-slate-400'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Theme Color</label>
                  <div className="flex flex-wrap gap-2">
                    {commonColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setWorkspaceColor(color)}
                        className={`w-10 h-10 rounded-xl transition-all border-2 ${workspaceColor === color ? 'scale-110 border-slate-900 shadow-md ring-2 ring-white ring-inset' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !workspaceName}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span>Create and Continue</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-200/60 p-12 animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
            <header className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Invite your team</h2>
              <p className="text-slate-500 font-medium mt-3">Collaboration is at the heart of AttioTask.</p>
            </header>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Team Member Emails</label>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                    placeholder="teammate@company.com"
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none text-[15px] font-medium transition-all shadow-sm"
                  />
                  <button
                    onClick={addEmail}
                    disabled={!currentEmail || !currentEmail.includes('@')}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.95] disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {invitedEmails.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">To be invited:</div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {invitedEmails.map(email => (
                      <div key={email} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold animate-in zoom-in-50 duration-200">
                        <span>{email}</span>
                        <button onClick={() => setInvitedEmails(invitedEmails.filter(e => e !== email))} className="hover:text-blue-900">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-4 pt-4">
                <button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span>{invitedEmails.length > 0 ? 'Invite and Finish' : 'Skip and Finish'}</span>
                  )}
                </button>
                
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  You can always invite team members later from your workspace settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
