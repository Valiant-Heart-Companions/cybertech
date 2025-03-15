/* eslint-disable */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShopPage from '../page';
import { useLanguage } from '~/i18n/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe.skip('ShopPage', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 100,
      image: '/test-image-1.jpg',
      category: 'test-category',
      inStock: true,
    },
    {
      id: '2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 200,
      image: '/test-image-2.jpg',
      category: 'test-category',
      inStock: false,
    },
  ];

  const mockCategories = ['Category 1', 'Category 2', 'Category 3'];

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });
  });

  it('renders shop page with all components', () => {
    render(<ShopPage />);

    // Check for main container and its classes
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer.parentElement?.parentElement).toHaveClass('min-h-screen', 'bg-gray-50');

    // Check for category and filter sections
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('handles mobile category drawer', () => {
    render(<ShopPage />);

    // Click category button
    const categoryButton = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoryButton);

    // Check if drawer is visible
    const drawer = screen.getByRole('dialog', { name: /categories/i });
    expect(drawer).toHaveClass('translate-y-0');

    // Close drawer
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(drawer).toHaveClass('translate-y-full');
  });

  it('handles mobile filter drawer', () => {
    render(<ShopPage />);

    // Click filter button
    const filterButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filterButton);

    // Check if drawer is visible
    const drawer = screen.getByRole('dialog', { name: /filters/i });
    expect(drawer).toHaveClass('translate-y-0');

    // Close drawer
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(drawer).toHaveClass('translate-y-full');
  });

  it('handles search functionality', () => {
    render(<ShopPage />);

    // Find and fill search input
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Submit search form
    const searchForm = searchInput.closest('form');
    fireEvent.submit(searchForm!);

    // Check if router was called with search params
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('search=test+search'));
  });

  it('renders in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });

    render(<ShopPage />);

    // Check for Spanish text
    expect(screen.getByText(/categorías/i)).toBeInTheDocument();
    expect(screen.getByText(/filtros/i)).toBeInTheDocument();
  });

  it('loads and displays products', async () => {
    render(<ShopPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  it('handles product filtering by category', async () => {
    render(<ShopPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: 'Category 1' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=Category 1')
      );
    });
  });

  it('handles product filtering by price range', async () => {
    render(<ShopPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const priceRangeSelect = screen.getByLabelText(/price range/i);
    fireEvent.change(priceRangeSelect, { target: { value: '0-50' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('priceRange=0-50')
      );
    });
  });

  it('handles availability filter', async () => {
    render(<ShopPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const availabilityCheckbox = screen.getByLabelText(/in stock only/i);
    fireEvent.click(availabilityCheckbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('inStockOnly=true')
      );
    });
  });

  it('handles loading state', () => {
    render(<ShopPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(<ShopPage />);

    await waitFor(() => {
      expect(screen.getByText(/error loading products/i)).toBeInTheDocument();
    });
  });

  it('handles empty product list', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ShopPage />);

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    });
  });

  it('applies correct styling to page layout', async () => {
    render(<ShopPage />);

    const mainContainer = screen.getByTestId('shop-container');
    expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    const filterBar = screen.getByTestId('filter-bar');
    expect(filterBar).toHaveClass('mb-8');

    const productGrid = screen.getByTestId('product-grid');
    expect(productGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });
}); 