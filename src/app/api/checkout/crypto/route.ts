import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Crypto gateway is under development and coming soon.' },
    { status: 501 }
  );
}