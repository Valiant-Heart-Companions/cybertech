import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const draftModeInstance = await draftMode();
    draftModeInstance.disable();
  } catch (error) {
    console.error('Error disabling draft mode:', error);
    return NextResponse.json({ error: 'Could not disable draft mode' }, { status: 500 });
  }
  
  return redirect('/');
} 