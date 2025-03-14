import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductGrid from '../ProductGrid';
import { useLanguage } from '~/i18n/LanguageContext';
import { supabase } from '~/lib/supabase';

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

// Mock the supabase client
jest.mock('~/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe.skip('ProductGrid', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Product 1',
      sku: 'TEST1',
      current_price: 100,
      list_price: 120,
      image_url: 'test1.jpg',
      inventory_count: 10,
    },
    {
      id: '2',
      name: 'Test Product 2',
      sku: 'TEST2',
      current_price: 200,
      list_price: 250,
      image_url: 'test2.jpg',
      inventory_count: 5,
    },
  ];

  const mockTranslations = {
    shop: {
      title: 'Shop',
      items: {
        singular: 'item',
        plural: 'items',
      },
      noResults: 'No results found',
      categories: {
        all: 'All Categories',
      },
      noImage: 'No image available',
      sort: {
        label: 'Sort by',
        options: {
          featured: 'Featured',
          priceAsc: 'Price: Low to High',
          priceDesc: 'Price: High to Low',
          newest: 'Newest',
        },
      },
    },
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock language context
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      translations: mockTranslations,
    });

    // Mock supabase query with all necessary methods
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    // Mock the from method to return our query object
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'product_categories') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return mockQuery;
    });

    // Mock successful response for products query
    mockQuery.select.mockResolvedValueOnce({
      data: mockProducts,
      error: null,
      count: mockProducts.length,
    });
  });

  it('renders loading state initially', async () => {
    const { container } = render(<ProductGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    const { getByText, container } = render(<ProductGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(getByText('Test Product 1')).toBeInTheDocument();
    expect(getByText('Test Product 2')).toBeInTheDocument();
  });

  it('displays product prices correctly', async () => {
    const { getByText, container } = render(<ProductGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(getByText('$100.00')).toBeInTheDocument();
    expect(getByText('$200.00')).toBeInTheDocument();
    expect(getByText('$120.00')).toBeInTheDocument();
    expect(getByText('$250.00')).toBeInTheDocument();
  });

  it('displays product images', async () => {
    const { getAllByRole, container } = render(<ProductGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    const images = getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'test1.jpg');
    expect(images[1]).toHaveAttribute('src', 'test2.jpg');
  });

  it('shows no results message when no products are found', async () => {
    // Mock empty response
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
    mockQuery.select.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0,
    });

    const { getByText, container } = render(<ProductGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(getByText('No results found')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock error response
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);
    mockQuery.select.mockResolvedValueOnce({
      data: null,
      error: new Error('Failed to fetch products'),
      count: 0,
    });

    const { getByText, container } = render(<ProductGrid />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    expect(getByText(/Error:/)).toBeInTheDocument();
    expect(getByText(/Failed to fetch products/)).toBeInTheDocument();
  });

  it('allows sorting products', async () => {
    const { getByLabelText, container } = render(<ProductGrid />);

    // Wait for the initial render to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    // The loading spinner should be visible in the flex container
    expect(container.querySelector('div.flex.justify-center.items-center.min-h-\\[400px\\] div.animate-spin.rounded-full.h-12.w-12.border-b-2.border-gray-900')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    // The loading spinner should be gone
    expect(container.querySelector('div.flex.justify-center.items-center.min-h-\\[400px\\] div.animate-spin.rounded-full.h-12.w-12.border-b-2.border-gray-900')).not.toBeInTheDocument();

    const sortSelect = getByLabelText('Sort by');
    await userEvent.selectOptions(sortSelect, 'price-asc');

    // Verify that the sort query was called
    const mockQuery = (supabase.from as jest.Mock)();
    expect(mockQuery.order).toHaveBeenCalledWith('current_price', { ascending: true });
  });

  it('displays product count', async () => {
    const { getByText, container } = render(<ProductGrid />);

    // Wait for the initial render to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    // The loading spinner should be visible in the flex container
    expect(container.querySelector('div.flex.justify-center.items-center.min-h-\\[400px\\] div.animate-spin.rounded-full.h-12.w-12.border-b-2.border-gray-900')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    // The loading spinner should be gone and product count should be visible
    expect(container.querySelector('div.flex.justify-center.items-center.min-h-\\[400px\\] div.animate-spin.rounded-full.h-12.w-12.border-b-2.border-gray-900')).not.toBeInTheDocument();
    expect(getByText('2 items')).toBeInTheDocument();
  });

  it('renders product links with correct SKUs', async () => {
    const { getAllByRole, container } = render(<ProductGrid />);

    // Wait for the initial render to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    // The loading spinner should be visible in the flex container
    expect(container.querySelector('div.flex.justify-center.items-center.min-h-\\[400px\\] div.animate-spin.rounded-full.h-12.w-12.border-b-2.border-gray-900')).toBeInTheDocument();

    // Wait for the data to load
    await new Promise(resolve => setTimeout(resolve, 0));

    // The loading spinner should be gone and links should be visible
    expect(container.querySelector('div.flex.justify-center.items-center.min-h-\\[400px\\] div.animate-spin.rounded-full.h-12.w-12.border-b-2.border-gray-900')).not.toBeInTheDocument();
    const links = getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/shop/TEST1');
    expect(links[1]).toHaveAttribute('href', '/shop/TEST2');
  });
}); 