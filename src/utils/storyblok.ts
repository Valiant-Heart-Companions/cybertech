import { ISbStoriesParams } from '@storyblok/react/rsc';

// Storyblok CDN API base URL - using US data center
const STORYBLOK_API_URL = 'https://api-us.storyblok.com/v2/cdn';

// Determine if we're in a development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Select the appropriate token based on environment
const getStoryblokToken = (forPreview = false) => {
  // In development, default to preview token unless specified otherwise
  if (isDevelopment || forPreview) {
    return process.env.STORYBLOK_PREVIEW_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN;
  }
  
  // In production, use public token for published content
  return process.env.STORYBLOK_PUBLIC_TOKEN || process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN;
};

// Create a content version (cv) timestamp for cache busting
const createCacheVersion = () => Math.floor(Date.now() / 1000);

/**
 * Fetches a story from Storyblok using direct fetch API
 * This approach is safer for server components and avoids the apiPlugin error
 * 
 * @param slug The slug of the story to fetch
 * @param params Additional parameters for the Storyblok API
 * @param preview Whether to force using the preview token (otherwise determined by environment)
 * @returns The story object or null if not found
 */
export async function fetchStoryblokStory(
  slug: string, 
  params: ISbStoriesParams = {},
  preview = false
) {
  if (!slug) {
    console.error('fetchStoryblok: No slug provided');
    return null;
  }

  // Generate a cache version (cv) parameter for cache busting
  const cv = createCacheVersion();

  try {
    // Get the token based on environment or preview mode
    const token = getStoryblokToken(preview || isDevelopment);
    if (!token) {
      console.error('fetchStoryblok: No Storyblok token available');
      return null;
    }

    // Determine if we should use draft or published version
    const apiVersion = (preview || isDevelopment) ? 'draft' : 'published';
    
    // Log the operation (partially mask the token for security)
    const maskedToken = token.length > 8 
      ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
      : '(invalid token)';
    console.log(`Fetching Storyblok story "${slug}" in ${apiVersion} mode (environment: ${process.env.NODE_ENV}, token: ${maskedToken}, cv=${cv})`);
    
    // Construct URL with query parameters
    const queryParams = new URLSearchParams({
      token: token,
      version: apiVersion,
      cv: cv.toString(),
      ...params as Record<string, string>
    });
    
    const url = `${STORYBLOK_API_URL}/stories/${slug}?${queryParams.toString()}`;
    
    // Make the fetch request
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      next: {
        // Use revalidation if not in development mode
        revalidate: isDevelopment ? 0 : 60
      }
    });
    
    if (!response.ok) {
      console.error(`Storyblok API returned ${response.status} for story "${slug}"`);
      const errorText = await response.text();
      console.error(`Response body: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data.story || null;
  } catch (error) {
    console.error(`Error fetching Storyblok story "${slug}":`, error);
    // Return null instead of throwing to prevent page crashes
    return null;
  }
} 