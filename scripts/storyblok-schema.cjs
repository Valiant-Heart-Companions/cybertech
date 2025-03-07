#!/usr/bin/env node

// This script helps set up the Storyblok content structure
// Run it with your management token: NODE_ENV=development STORYBLOK_MANAGEMENT_TOKEN=your_token node scripts/storyblok-schema.cjs

const StoryblokClient = require('storyblok-js-client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Constants for component types
const COMPONENT_TYPE_NESTABLE = 'nestable';
const COMPONENT_TYPE_CONTENT = 'content';
const COMPONENT_TYPE_BLOK = 'blok';

// Create Storyblok client with management token
const Storyblok = new StoryblokClient({
  oauthToken: process.env.STORYBLOK_MANAGEMENT_TOKEN,
});

const createComponentSchema = async () => {
  try {
    console.log('Starting Storyblok component schema creation...');
    const space_id = process.env.STORYBLOK_SPACE_ID;
    
    if (!space_id) {
      throw new Error('STORYBLOK_SPACE_ID environment variable is missing');
    }
    
    if (!process.env.STORYBLOK_MANAGEMENT_TOKEN) {
      throw new Error('STORYBLOK_MANAGEMENT_TOKEN environment variable is missing');
    }
    
    // Define Page component
    const pageComponent = {
      name: 'page',
      display_name: 'Page',
      schema: {
        title: {
          type: 'text',
          pos: 0,
          display_name: 'Title',
        },
        description: {
          type: 'textarea',
          pos: 1,
          display_name: 'Description',
        },
        use_container: {
          type: 'boolean',
          default_value: true,
          pos: 2,
          display_name: 'Use Container',
        },
        container_size: {
          type: 'option',
          pos: 3,
          default_value: 'medium',
          options: [
            { name: 'Small', value: 'small' },
            { name: 'Medium', value: 'medium' },
            { name: 'Large', value: 'large' },
            { name: 'Full Width', value: 'full' },
          ],
          display_name: 'Container Size',
        },
        body: {
          type: 'bloks',
          pos: 4,
          display_name: 'Content',
          restrict_components: true,
          component_whitelist: [
            'hero',
            'product-list',
            'category-navigation',
            'promotional-banner',
            'grid',
            'feature',
          ],
        },
        seo: {
          type: 'tab',
          display_name: 'SEO',
          pos: 5,
          keys: [
            'seo_title',
            'seo_description', 
            'seo_image'
          ]
        },
        seo_title: {
          type: 'text',
          display_name: 'SEO Title',
          pos: 6,
        },
        seo_description: {
          type: 'textarea',
          display_name: 'Meta Description',
          pos: 7,
        },
        seo_image: {
          type: 'asset',
          display_name: 'Social Share Image',
          pos: 8,
        }
      },
      is_root: true,
      is_nestable: false,
      component_group_uuid: null,
    };
    
    // Hero Component
    const heroComponent = {
      name: 'hero',
      display_name: 'Hero Slider',
      schema: {
        slides: {
          type: 'bloks',
          restrict_components: true,
          component_whitelist: ['hero_slide'],
          pos: 0,
          maximum: 3, // Max 3 slides as per spec
          display_name: 'Slides',
          required: true,
        },
        autoplay: {
          type: 'boolean',
          default_value: true,
          pos: 1,
          display_name: 'Enable Autoplay',
        },
        autoplay_speed: {
          type: 'number',
          default_value: 5000,
          pos: 2,
          display_name: 'Autoplay Speed (ms)',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Hero Slide Component
    const heroSlideComponent = {
      name: 'hero_slide',
      display_name: 'Hero Slide',
      schema: {
        image: {
          type: 'asset',
          filetypes: ['images'],
          pos: 0,
          display_name: 'Background Image',
          required: true,
        },
        title: {
          type: 'text',
          pos: 1,
          display_name: 'Title',
        },
        subtitle: {
          type: 'text',
          pos: 2,
          display_name: 'Subtitle',
        },
        cta_text: {
          type: 'text',
          pos: 3,
          display_name: 'CTA Text',
        },
        cta_link: {
          type: 'link',
          pos: 4,
          display_name: 'CTA Link',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Product List Component
    const productListComponent = {
      name: 'product-list',
      display_name: 'Product List',
      schema: {
        title: {
          type: 'text',
          pos: 0,
          default_value: 'Featured Products',
          display_name: 'Title',
        },
        products: {
          type: 'text',
          pos: 1,
          display_name: 'Products Reference',
          description: 'Enter a reference string or use the Supabase datasource',
          required: true,
        },
        show_prices: {
          type: 'boolean',
          default_value: true,
          pos: 2,
          display_name: 'Show Prices',
        },
        show_cta: {
          type: 'boolean',
          default_value: true,
          pos: 3,
          display_name: 'Show CTA Button',
        },
        cta_text: {
          type: 'text',
          default_value: 'Add to Cart',
          pos: 4,
          display_name: 'CTA Text',
        },
        columns: {
          type: 'option',
          pos: 5,
          default_value: 3,
          options: [
            { name: '2 Columns', value: 2 },
            { name: '3 Columns', value: 3 },
            { name: '4 Columns', value: 4 },
          ],
          display_name: 'Columns',
        },
        view_all_link: {
          type: 'text',
          pos: 6,
          display_name: 'View All Link',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Category Navigation Component
    const categoryNavigationComponent = {
      name: 'category-navigation',
      display_name: 'Category Navigation',
      schema: {
        title: {
          type: 'text',
          pos: 0,
          default_value: 'Shop by Category',
          display_name: 'Title',
        },
        categories: {
          type: 'bloks',
          restrict_components: true,
          component_whitelist: ['category'],
          pos: 1,
          display_name: 'Categories',
          required: true,
        },
        display_type: {
          type: 'option',
          pos: 2,
          default_value: 'grid',
          options: [
            { name: 'Grid', value: 'grid' },
            { name: 'List', value: 'list' },
            { name: 'Carousel', value: 'carousel' },
          ],
          display_name: 'Display Type',
        },
        columns: {
          type: 'option',
          pos: 3,
          default_value: 4,
          options: [
            { name: '2 Columns', value: 2 },
            { name: '3 Columns', value: 3 },
            { name: '4 Columns', value: 4 },
          ],
          display_name: 'Columns (Grid Display)',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Category Item Component
    const categoryComponent = {
      name: 'category',
      display_name: 'Category',
      schema: {
        name: {
          type: 'text',
          pos: 0,
          display_name: 'Name',
          required: true,
        },
        slug: {
          type: 'text',
          pos: 1,
          display_name: 'Slug',
        },
        image: {
          type: 'asset',
          filetypes: ['images'],
          pos: 2,
          display_name: 'Image',
        },
        link: {
          type: 'link',
          pos: 3,
          display_name: 'Link',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Promotional Banner Component
    const promotionalBannerComponent = {
      name: 'promotional-banner',
      display_name: 'Promotional Banner',
      schema: {
        title: {
          type: 'text',
          pos: 0,
          display_name: 'Title',
          required: true,
        },
        subtitle: {
          type: 'text',
          pos: 1,
          display_name: 'Subtitle',
        },
        cta_text: {
          type: 'text',
          pos: 2,
          display_name: 'CTA Text',
        },
        cta_link: {
          type: 'link',
          pos: 3,
          display_name: 'CTA Link',
        },
        style: {
          type: 'option',
          pos: 4,
          default_value: 'solid',
          options: [
            { name: 'Solid Color', value: 'solid' },
            { name: 'Gradient', value: 'gradient' },
            { name: 'Background Image', value: 'image' },
          ],
          display_name: 'Banner Style',
        },
        background_color: {
          type: 'option',
          pos: 5,
          default_value: 'yellow-100',
          options: [
            { name: 'Yellow (Light)', value: 'yellow-100' },
            { name: 'Blue (Light)', value: 'blue-100' },
            { name: 'Green (Light)', value: 'green-100' },
            { name: 'Red (Light)', value: 'red-100' },
            { name: 'Blue (Default)', value: 'blue-600' },
            { name: 'Yellow (Default)', value: 'yellow-500' },
            { name: 'Green (Default)', value: 'green-600' },
            { name: 'Red (Default)', value: 'red-600' },
          ],
          display_name: 'Background Color',
        },
        background_image: {
          type: 'asset',
          filetypes: ['images'],
          pos: 6,
          display_name: 'Background Image',
        },
        text_color: {
          type: 'option',
          pos: 7,
          default_value: 'text-gray-900',
          options: [
            { name: 'Black', value: 'text-gray-900' },
            { name: 'White', value: 'text-white' },
            { name: 'Blue', value: 'text-blue-600' },
          ],
          display_name: 'Text Color',
        },
        orientation: {
          type: 'option',
          pos: 8,
          default_value: 'left',
          options: [
            { name: 'Left', value: 'left' },
            { name: 'Center', value: 'center' },
            { name: 'Right', value: 'right' },
          ],
          display_name: 'Text Alignment',
        },
        size: {
          type: 'option',
          pos: 9,
          default_value: 'medium',
          options: [
            { name: 'Small', value: 'small' },
            { name: 'Medium', value: 'medium' },
            { name: 'Large', value: 'large' },
          ],
          display_name: 'Banner Size',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Grid Component
    const gridComponent = {
      name: 'grid',
      display_name: 'Grid',
      schema: {
        columns: {
          type: 'option',
          pos: 0,
          default_value: 3,
          options: [
            { name: '2 Columns', value: 2 },
            { name: '3 Columns', value: 3 },
            { name: '4 Columns', value: 4 },
          ],
          display_name: 'Desktop Columns',
        },
        columns_tablet: {
          type: 'option',
          pos: 1,
          default_value: 2,
          options: [
            { name: '1 Column', value: 1 },
            { name: '2 Columns', value: 2 },
          ],
          display_name: 'Tablet Columns',
        },
        columns_mobile: {
          type: 'option',
          pos: 2,
          default_value: 1,
          options: [
            { name: '1 Column', value: 1 },
            { name: '2 Columns', value: 2 },
          ],
          display_name: 'Mobile Columns',
        },
        gap: {
          type: 'option',
          pos: 3,
          default_value: 'medium',
          options: [
            { name: 'Small', value: 'small' },
            { name: 'Medium', value: 'medium' },
            { name: 'Large', value: 'large' },
          ],
          display_name: 'Gap Size',
        },
        body: {
          type: 'bloks',
          pos: 4,
          display_name: 'Content',
          restrict_components: true,
          component_whitelist: [
            'feature',
            'promotional-banner',
          ],
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // Feature Component
    const featureComponent = {
      name: 'feature',
      display_name: 'Feature',
      schema: {
        name: {
          type: 'text',
          pos: 0,
          display_name: 'Title',
          required: true,
        },
        description: {
          type: 'textarea',
          pos: 1,
          display_name: 'Description',
        },
        icon: {
          type: 'asset',
          filetypes: ['images'],
          pos: 2,
          display_name: 'Icon',
        },
        link: {
          type: 'link',
          pos: 3,
          display_name: 'Link',
        },
        cta_text: {
          type: 'text',
          pos: 4,
          display_name: 'CTA Text',
        },
        style: {
          type: 'option',
          pos: 5,
          default_value: 'card',
          options: [
            { name: 'Card', value: 'card' },
            { name: 'Minimal', value: 'minimal' },
            { name: 'Highlight', value: 'highlight' },
          ],
          display_name: 'Style',
        },
        alignment: {
          type: 'option',
          pos: 6,
          default_value: 'center',
          options: [
            { name: 'Left', value: 'left' },
            { name: 'Center', value: 'center' },
            { name: 'Right', value: 'right' },
          ],
          display_name: 'Text Alignment',
        },
        icon_position: {
          type: 'option',
          pos: 7,
          default_value: 'top',
          options: [
            { name: 'Top', value: 'top' },
            { name: 'Left', value: 'left' },
          ],
          display_name: 'Icon Position',
        },
      },
      component_group_uuid: null,
      is_nestable: true,
    };
    
    // List of all components to create
    const components = [
      { type: COMPONENT_TYPE_CONTENT, data: pageComponent },
      { type: COMPONENT_TYPE_NESTABLE, data: heroComponent },
      { type: COMPONENT_TYPE_BLOK, data: heroSlideComponent },
      { type: COMPONENT_TYPE_NESTABLE, data: productListComponent },
      { type: COMPONENT_TYPE_NESTABLE, data: categoryNavigationComponent },
      { type: COMPONENT_TYPE_BLOK, data: categoryComponent },
      { type: COMPONENT_TYPE_NESTABLE, data: promotionalBannerComponent },
      { type: COMPONENT_TYPE_NESTABLE, data: gridComponent },
      { type: COMPONENT_TYPE_NESTABLE, data: featureComponent },
    ];
    
    // Create all components
    for (const component of components) {
      try {
        console.log(`Creating ${component.data.name} component...`);
        const response = await Storyblok.post(`spaces/${space_id}/components`, {
          component: component.data,
        });
        console.log(`✅ Created ${component.data.name} component`);
      } catch (error) {
        console.error(`Error creating ${component.data.name} component:`, error.message);
        if (error.response?.data) {
          console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    console.log('\n🎉 Component schema creation complete!');
    console.log('\nNext steps:');
    console.log('1. Create a "Home" story in Storyblok using the "page" component');
    console.log('2. Add the required content blocks (hero, products, categories, etc.)');
    console.log('3. Publish the content to make it visible on your site');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createComponentSchema(); 