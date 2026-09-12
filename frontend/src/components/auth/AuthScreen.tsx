import React, { FormEvent, useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login({ username, password });
      else await register({ username, email, password });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md border border-white/10 bg-white/[0.04] p-8 rounded-xl shadow-2xl">
        <h1 className="font-serif text-3xl text-[#D4AF37] mb-2">AetherMail</h1>
        <p className="text-white/50 mb-8">{mode === 'login' ? 'Sign in to your delivery console.' : 'Create an administrator account.'}</p>
        <div className="space-y-4">
          <input required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-[#D4AF37]" />
          {mode === 'register' && <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-[#D4AF37]" />}
          <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 outline-none focus:border-[#D4AF37]" />
        </div>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        <button disabled={busy} className="mt-6 w-full bg-[#D4AF37] text-black font-bold rounded-lg p-3 flex items-center justify-center gap-2 disabled:opacity-50">
          {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
          {busy ? 'Working...' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full mt-4 text-sm text-white/60 hover:text-white">
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}
        </button>
      </form>
    </main>
  );
}
