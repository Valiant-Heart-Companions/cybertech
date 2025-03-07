# Storyblok Setup Guide

This document provides instructions on how to set up and use Storyblok with the Cecomsa e-commerce application.

## Initial Setup

1. Create a Storyblok account at [https://www.storyblok.com/](https://www.storyblok.com/)
2. Create a new space for the project
3. Get your API keys from the Settings > API Keys section
4. Add the keys to your `.env.local` file:

```
STORYBLOK_PREVIEW_TOKEN=your_preview_token
STORYBLOK_PUBLIC_TOKEN=your_public_token
NEXT_PUBLIC_STORYBLOK_API_TOKEN=your_public_token
STORYBLOK_SPACE_ID=your_space_id
```

## Content Structure Setup

We've created a script to automatically set up all the required components in your Storyblok space:

1. Generate a Management Token in Storyblok (Settings > Access Tokens > Create a personal access token)
2. Add it to your `.env.local` file or use it directly in the command:

```bash
# Using the token from .env.local (uncomment the STORYBLOK_MANAGEMENT_TOKEN line first)
NODE_ENV=development node scripts/storyblok-schema.cjs

# OR using the token directly
NODE_ENV=development STORYBLOK_MANAGEMENT_TOKEN=your_token node scripts/storyblok-schema.cjs
```

3. This will create all the components in your Storyblok space with the correct configuration

## Creating the Homepage Content

Once the components are set up, you need to create the homepage content:

1. In your Storyblok admin panel, create a new Story
2. Set the slug to `home` (important for routing)
3. Select the `Page` component as the content type
4. Add the following blocks to the content area:

### Hero Slider

The hero slider displays a carousel of images with text and call-to-action buttons.

1. Add a `Hero Slider` block
2. Click "Add Slide" to add up to 3 slides
3. For each slide:
   - Upload a background image (recommended size: 1800×600px)
   - Add a title and subtitle
   - Add CTA text and link if needed
4. Enable autoplay if desired

### Featured Products

Display a grid of products from your catalog.

1. Add a `Product List` block
2. Set a title (e.g., "Featured Products")
3. For testing, enter "featured" in the Products Reference field
   - Later, this can be connected to Supabase products
4. Configure display options:
   - Show/hide prices
   - Show/hide CTA button
   - Customize CTA text
   - Set number of columns
5. Add a View All link if desired

### Category Navigation

Create a grid of categories for easy browsing.

1. Add a `Category Navigation` block
2. Set a title (e.g., "Shop by Category")
3. Add categories:
   - Click "Add Category" for each category
   - Set name, slug, and upload an image
   - Add a link to the category page
4. Choose a display type:
   - Grid: Traditional grid layout
   - List: Vertical list format
   - Carousel: Horizontal scrollable list
5. Configure number of columns for grid display

### Promotional Banner

Create attention-grabbing promotional banners.

1. Add a `Promotional Banner` block
2. Set a title (e.g., "Special Offer") and subtitle
3. Add CTA text and link
4. Choose a style:
   - Solid Color: Uses a single background color
   - Gradient: Creates a gradient effect
   - Background Image: Uses an image with overlay
5. Configure colors, alignment, and size

### Feature Grid

Display features or benefits in a grid layout.

1. Add a `Grid` block
2. Configure columns for desktop, tablet, and mobile
3. Add `Feature` blocks inside the grid:
   - Set name and description
   - Upload an icon
   - Configure style, alignment, and icon position
   - Add a link and CTA text if needed

## Preview Mode

To enable preview mode for Storyblok editing:

1. Make sure the Storyblok Visual Editor is set to use your development URL (e.g., http://localhost:3000)
2. Within Storyblok Editor, changes will automatically appear on your development site

## Publishing Content

When you're ready to publish:

1. Review your content in the Storyblok Editor
2. Click "Publish" to make the content available to the public
3. In your production environment, the site will fetch the published content

## Troubleshooting

### Common Issues

- **No Content Displayed**: 
  - Verify that you've created a story with the slug `home` in Storyblok
  - Check your API keys in `.env.local` are correct
  - Make sure your Page component has content blocks added to it

- **Image Loading Problems**: 
  - Verify the domains in `next.config.js` include `a.storyblok.com`
  - Check that images have been uploaded to Storyblok properly
  - Try clearing your browser cache

- **Console Errors**: 
  - "Error fetching Storyblok story": Check your API tokens and space ID
  - "Component not found": Ensure all component mappings in `StoryblokProvider.tsx` match what's in Storyblok
  - "Draft mode errors": Make sure your preview routes are configured correctly

- **Draft/Preview Mode Issues**:
  - Verify the preview token in `.env.local` matches Storyblok
  - Check that the preview URL is configured correctly in Storyblok settings
  - Clear your cookies and try again

### Advanced Debugging

1. **Checking Network Requests**:
   - Open browser dev tools and look at network calls to the Storyblok API
   - Verify the correct version (draft/published) is being requested
   - Check for error status codes and response bodies

2. **Verifying Component Schema**:
   - Compare the component schema in Storyblok to your React components
   - Make sure required fields match between both systems
   - Check for any mismatched field types

3. **API Key Validation**:
   - Test your API key with a direct fetch to the Storyblok API
   - `curl -H "Content-Type: application/json" -X GET "https://api.storyblok.com/v2/cdn/stories/home?token=YOUR_TOKEN&version=published"`

4. **Content Fallbacks**:
   - The app is designed to show fallback content if Storyblok data isn't available
   - Check if the fallback is displaying, indicating a connectivity issue

## Component Reference

For a detailed reference of all available components and their properties, refer to the component files in `src/components/storyblok/`.

## Additional Resources

- [Storyblok Documentation](https://www.storyblok.com/docs)
- [Next.js with Storyblok](https://www.storyblok.com/tc/nextjs)
- [@storyblok/react](https://github.com/storyblok/storyblok-react) 