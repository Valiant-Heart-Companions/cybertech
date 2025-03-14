import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../FilterBar';
import { useLanguage } from '~/i18n/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { translations } from '~/i18n/translations';

// Mock the required hooks and modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('~/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [] }),
    })),
  },
}));

describe('FilterBar', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock search params
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    // Mock language context with translations
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
    });

    // Reset URL parameters
    mockGet.mockImplementation((param) => {
      switch (param) {
        case 'minPrice': return '';
        case 'maxPrice': return '';
        case 'inStock': return null;
        case 'category': return '';
        case 'search': return '';
        default: return null;
      }
    });
  });

  it('renders filter options', () => {
    render(<FilterBar />);

    // First click the filter button to show options
    fireEvent.click(screen.getByText(translations.en.shop.filters.title));

    // Check for filter sections based on translations
    expect(screen.getByText(translations.en.shop.filters.priceRange)).toBeInTheDocument();
    expect(screen.getByLabelText(translations.en.shop.filters.min)).toBeInTheDocument();
    expect(screen.getByLabelText(translations.en.shop.filters.max)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: translations.en.shop.filters.inStock })).toBeInTheDocument();
  });

  it('applies price filters', () => {
    render(<FilterBar />);

    // Open filters
    fireEvent.click(screen.getByText(translations.en.shop.filters.title));

    // Set price range
    fireEvent.change(screen.getByLabelText(translations.en.shop.filters.min), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(translations.en.shop.filters.max), { target: { value: '500' } });
    
    // Apply filters
    fireEvent.click(screen.getByRole('button', { name: translations.en.shop.filters.apply }));

    // Verify URL parameters
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('minPrice=100'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('maxPrice=500'));
  });

  it('applies stock filter', () => {
    render(<FilterBar />);

    // Open filters
    fireEvent.click(screen.getByText(translations.en.shop.filters.title));

    // Toggle in-stock filter
    fireEvent.click(screen.getByRole('checkbox', { name: translations.en.shop.filters.inStock }));
    
    // Apply filters
    fireEvent.click(screen.getByRole('button', { name: translations.en.shop.filters.apply }));

    // Verify URL parameters
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('inStock=true'));
  });

  it('preserves existing search and category parameters', () => {
    // Mock existing URL parameters
    mockGet.mockImplementation((param) => {
      switch (param) {
        case 'category': return 'electronics';
        case 'search': return 'laptop';
        default: return null;
      }
    });

    render(<FilterBar />);

    // Open filters
    fireEvent.click(screen.getByText(translations.en.shop.filters.title));

    // Apply new price filter
    fireEvent.change(screen.getByLabelText(translations.en.shop.filters.min), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: translations.en.shop.filters.apply }));

    // Verify all parameters are preserved
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('category=electronics'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('search=laptop'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('minPrice=100'));
  });

  it('renders in mobile drawer mode', () => {
    render(<FilterBar isMobileDrawer={true} />);
    
    // Verify mobile-specific elements
    expect(screen.getByText(translations.en.shop.filters.priceRange)).toBeInTheDocument();
    expect(screen.getByText(translations.en.shop.filters.availability)).toBeInTheDocument();
  });

  it('clears all filters', () => {
    render(<FilterBar />);

    // Open filters
    fireEvent.click(screen.getByText(translations.en.shop.filters.title));

    // Set some filters first
    fireEvent.change(screen.getByLabelText(translations.en.shop.filters.min), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(translations.en.shop.filters.max), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('checkbox', { name: translations.en.shop.filters.inStock }));

    // Clear filters
    fireEvent.click(screen.getByRole('button', { name: translations.en.shop.filters.clear }));

    // Verify URL is reset
    expect(mockPush).toHaveBeenCalledWith('/shop?');
  });

  it('renders in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
    });

    render(<FilterBar />);

    // Open filters
    fireEvent.click(screen.getByText(translations.es.shop.filters.title));

    // Verify Spanish translations
    expect(screen.getByText(translations.es.shop.filters.priceRange)).toBeInTheDocument();
    expect(screen.getByLabelText(translations.es.shop.filters.min)).toBeInTheDocument();
    expect(screen.getByLabelText(translations.es.shop.filters.max)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: translations.es.shop.filters.inStock })).toBeInTheDocument();
  });
}); 