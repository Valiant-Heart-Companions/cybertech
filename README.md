# Cybertech Website

This is an e-commerce application built with Next.js and Storyblok CMS for the Cecomsa clone project.

## Tech Stack

- [Next.js](https://nextjs.org) - React framework for server-rendered applications
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Storyblok](https://storyblok.com) - Headless CMS with visual editor
- [Supabase](https://supabase.io) - Open source Firebase alternative with PostgreSQL
- [tRPC](https://trpc.io) - End-to-end typesafe APIs

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables by copying `.env.example` to `.env.local` and filling in the values

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Storyblok CMS Integration

This project uses Storyblok as the headless CMS to manage content. The main components are:

- Hero Slider
- Product List
- Category Navigation
- Promotional Banner
- Feature Blocks
- Grid Layout

### Setting Up Storyblok

1. Create a Storyblok account at [storyblok.com](https://www.storyblok.com)
2. Configure your space and get API keys
3. Set up environment variables in `.env.local`
4. Run the schema creation script:

```bash
NODE_ENV=development STORYBLOK_MANAGEMENT_TOKEN=your_token node scripts/storyblok-schema.cjs
```

For detailed instructions, see [Storyblok Setup Guide](./docs/storyblok-setup.md).

## Project Structure

- `/src/app` - Next.js App Router pages and layout
- `/src/components` - Reusable components
  - `/src/components/storyblok` - Storyblok-specific components
- `/src/server` - Server-side code and API routes
- `/src/utils` - Utility functions
- `/public` - Static assets
- `/docs` - Documentation files

## Core Features

- Mobile-first responsive design
- Optimized for performance and Core Web Vitals
- Offline capabilities via service worker
- Streamlined checkout process
- Integrated payment processing

## Development Workflow

1. Create or modify components as needed
2. Update Storyblok schema when adding new content types
3. Test in development mode
4. Deploy to staging for review
5. Deploy to production

## Deployment

This application is designed to be deployed on Vercel for optimal performance.

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

## Documentation

- [Storyblok Setup Guide](./docs/storyblok-setup.md)
- [Environment Variables](./docs/environment-variables.md)
- [Component Reference](./docs/components.md)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Storyblok Documentation](https://www.storyblok.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
