import { Suspense } from 'react';
import { StoryblokComponent } from '@storyblok/react';
import { fetchStoryblokStory } from '~/utils/storyblok';
import StoryblokContentWrapper from '~/components/StoryblokContentWrapper';

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

// Skeleton loading state
function HomePageSkeleton() {
  return (
    <div className="animate-pulse container mx-auto px-4 py-8">
      <div className="h-64 bg-gray-200 rounded-md mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-md"></div>
        ))}
      </div>
      <div className="h-40 bg-gray-200 rounded-md mt-8"></div>
    </div>
  );
}

// Fallback content when Storyblok data isn't available
function FallbackHomeContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cecomsa E-commerce</h1>
      
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-blue-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Welcome to Cecomsa</h2>
          <p className="mb-6">Your one-stop shop for all your technology needs</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium">
            Shop Now
          </button>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-md p-4">
              <div className="bg-gray-200 h-40 mb-4 rounded-md"></div>
              <h3 className="font-medium mb-2">Product Name</h3>
              <p className="text-gray-600 mb-2">$99.99</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Alert about Storyblok not being available */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Storyblok content is not available. This is a fallback display. Please check your Storyblok setup and API configuration.
            </p>
          </div>
        </div>
      </div>
      
      {/* Environment indicator */}
      {isDevelopment && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Development Environment:</strong> The application will automatically use the preview token
                to display draft content in development mode.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fetch the homepage content from Storyblok
async function fetchHomePageContent() {
  // We'll let the utility function handle the environment-based token selection
  try {
    return await fetchStoryblokStory('home', {
      resolve_links: 'url',
      resolve_relations: 'product-list.products',
    });
  } catch (error) {
    console.error('Error in fetchHomePageContent:', error);
    return null;
  }
}

// Set revalidation time for ISR (Incremental Static Regeneration)
export const revalidate = isDevelopment ? 10 : 60; // More frequent revalidation in development

export default async function HomePage() {
  // Try to fetch story content with error handling
  let story = null;
  try {
    story = await fetchHomePageContent();
    console.log('HomePage: Loaded content from Storyblok');
  } catch (error) {
    console.error('Error rendering HomePage:', error);
    // Continue to render fallback content
  }
  
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      {/* Render content based on whether Storyblok data is available */}
      {story && story.content ? (
        <div className="container mx-auto px-4 py-8">
          {isDevelopment && (
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 text-sm">
              <strong>Development Mode:</strong> Using preview token to display draft content.
            </div>
          )}
          <StoryblokContentWrapper content={story.content} />
        </div>
      ) : (
        <FallbackHomeContent />
      )}
    </Suspense>
  );
}

// Generate metadata for the page
export async function generateMetadata() {
  try {
    const story = await fetchHomePageContent();
    
    if (!story) {
      return {
        title: 'Home - Cecomsa',
        description: 'Welcome to Cecomsa E-commerce',
      };
    }
    
    return {
      title: story.content?.seo_title || 'Home - Cecomsa',
      description: story.content?.seo_description || 'Welcome to Cecomsa E-commerce',
      openGraph: {
        title: story.content?.seo_title || 'Home - Cecomsa',
        description: story.content?.seo_description || 'Welcome to Cecomsa E-commerce',
        images: story.content?.seo_image?.filename ? [{ url: story.content.seo_image.filename }] : [],
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Home - Cecomsa',
      description: 'Welcome to Cecomsa E-commerce',
    };
  }
} 