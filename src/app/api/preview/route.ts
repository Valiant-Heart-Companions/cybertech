/* eslint-disable */
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '~/env';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug') || '';
  const sbPreviewToken = searchParams.get('token');

  // Check if the token is valid
  if (sbPreviewToken !== env.STORYBLOK_PREVIEW_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Enable Draft Mode
  try {
    const draftModeInstance = await draftMode();
    draftModeInstance.enable();
  } catch (error) {
    console.error('Error enabling draft mode:', error);
    return NextResponse.json({ error: 'Could not enable draft mode' }, { status: 500 });
  }

  // Redirect to the path provided in the query
  return redirect(slug ? `/${slug}` : '/');
} 