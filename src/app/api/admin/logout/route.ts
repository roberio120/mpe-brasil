import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/server/auth';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return res;
}
