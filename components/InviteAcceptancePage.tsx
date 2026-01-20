
import React, { useState, useEffect } from 'react';
import { db } from '../services/instantDb';
import { Invitation, Workspace } from '../types';

interface InviteAcceptancePageProps {
  inviteId: string;
  userEmail: string;
  onComplete: (workspaceId: string) => void;
}

const InviteAcceptancePage: React.FC<InviteAcceptancePageProps> = ({ inviteId, userEmail, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoading: queryLoading, data, error: queryError } = db.useQuery({
    invitations: {
      $: { where: { id: inviteId } }
    }
  });

  const invite = data?.invitations?.[0] as Invitation | undefined;
  
  // Need to query workspace separately once we have workspaceId
  const { data: wsData } = db.useQuery(invite ? {
    workspaces: {
      $: { where: { id: invite.workspaceId } }
    }
  } : null);

  const workspace = wsData?.workspaces?.[0] as Workspace | undefined;

  const handleAccept = async () => {
    if (!invite || !workspace) return;
    setIsLoading(true);
    
    try {
      // Logic for "joining": In this simple app, we just accept the invite.
      // In a real app with proper multi-tenancy, you'd add the user to a memberships table.
      await db.transact([
        db.tx.invitations[invite.id].update({ status: 'accepted' })
      ]);
      onComplete(invite.workspaceId);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  if (queryLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <svg className="animate-spin h-10 w-10 text-slate-900" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Verifying Invitation...</p>
      </div>
    );
  }

  if (!invite || invite.status === 'accepted' || invite.email !== userEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] px-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto border border-red-100 shadow-sm">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Invitation Invalid</h2>
          <p className="text-slate-500 font-medium leading-relaxed">This invitation may have already been used, expired, or was sent to a different email address.</p>
          <a href="/" className="inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-200/60 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
          <div 
            className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl font-bold border-4 border-white shadow-2xl mx-auto mb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
            style={{ backgroundColor: `${workspace?.color}20`, color: workspace?.color }}
          >
            {workspace?.icon || workspace?.name?.charAt(0)}
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Workspace Invitation</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
            <span className="text-slate-900 font-bold">{invite.inviterEmail}</span> has invited you to join <span className="text-slate-900 font-bold">{workspace?.name}</span>.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>Accept and Join</span>
              )}
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full px-5 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors uppercase tracking-[0.2em] text-[10px]"
            >
              Decline Invitation
            </button>
          </div>
          
          {error && <p className="mt-6 text-red-600 text-xs font-bold animate-in shake duration-300">{error}</p>}
        </div>

        <p className="mt-10 text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
          Signed in as <span className="text-slate-600">{userEmail}</span>
        </p>
      </div>
    </div>
  );
};

export default InviteAcceptancePage;
