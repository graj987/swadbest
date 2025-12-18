// File: src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import API from '@/api';


export default function ChangePassword(){
const [email, setEmail] = useState('');
const [otp, setOtp] = useState('');
const [password, setPassword] = useState('');
const [confirm, setConfirm] = useState('');
const [error, setError] = useState(null);
const [message, setMessage] = useState(null);
const [loading, setLoading] = useState(false);
const navigate = useNavigate();
async function onSubmit(e){
e.preventDefault(); setError(null); setMessage(null);
if(!email || !otp || !password) return setError('Complete all fields');
if(password !== confirm) return setError('Passwords do not match');
setLoading(true);
const { ok, data } = await API('/api/users/change-password/' + encodeURIComponent(email), { method: 'POST', body: JSON.stringify({ otp, password }) });
setLoading(false);
if(!ok) return setError(data?.message || 'Change password failed');
setMessage('Password changed. You can now login.');
setTimeout(()=>navigate('/login'), 1200);
}
return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-6">
<Card className="w-full max-w-md">
<CardHeader><CardTitle>Reset password</CardTitle></CardHeader>
<CardContent>
{error && <Alert className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
{message && <Alert className="mb-4"><AlertTitle>Success</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>}
<form onSubmit={onSubmit} className="space-y-4">
<div><Label>Email</Label><Input value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
<div><Label>OTP</Label><Input value={otp} onChange={(e)=>setOtp(e.target.value)} /></div>
<div><Label>New password</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></div>
<div><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} /></div>
<div className="flex justify-end"><Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Change password'}</Button></div>
</form>
</CardContent>
</Card>
</div>
);
}