/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductDetail from '../ProductDetail';
import { Product } from '~/lib/supabase';

// Mock the AddToCartButton component
jest.mock('~/app/_components/cart/AddToCartButton', () => {
  return function MockAddToCartButton({ product, className }: any) {
    return (
      <button className={className} data-testid="add-to-cart-button">
        Add to Cart - {product.name}
      </button>
    );
  };
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  sku: 'TEST-123',
  current_price: 99.99,
  list_price: 129.99,
  discount_percentage: 23,
  discount_label: '23% OFF',
  product_url: '/test-product',
  image_url: 'https://example.com/image.jpg',
  specifications: {
    brand: 'Test Brand',
    model: 'Test Model',
    color: 'Black',
  },
  all_specifications: {
    brand: 'Test Brand',
    model: 'Test Model',
    color: 'Black',
    weight: '1.5 kg',
    dimensions: '10x20x30 cm',
  },
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('ProductDetail', () => {
  it('renders product details correctly', () => {
    render(<ProductDetail product={mockProduct} />);

    // Check product name
    expect(screen.getByText('Test Product')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$129.99')).toBeInTheDocument();
    expect(screen.getByText('23% OFF')).toBeInTheDocument();

    // Check main image
    const mainImage = screen.getByRole('img', { name: 'Test Product' });
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg');

    // Check thumbnails
    const thumbnails = screen.getAllByRole('img', { name: /Test Product - Imagen \d/i });
    expect(thumbnails).toHaveLength(3);

    // Check specifications section title
    expect(screen.getByText('Especificaciones')).toBeInTheDocument();

    // Check specification keys and values
    expect(screen.getByText('brand')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('model')).toBeInTheDocument();
    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByText('color')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('handles image switching', async () => {
    render(<ProductDetail product={mockProduct} />);

    // Get all thumbnails
    const thumbnails = screen.getAllByRole('img', { name: /Test Product - Imagen \d/i });
    const mainImage = screen.getByRole('img', { name: 'Test Product' });

    // Click second thumbnail
    const secondThumbnail = thumbnails[1];
    if (secondThumbnail) {
      await userEvent.click(secondThumbnail);
      expect(mainImage).toHaveAttribute('src', 'https://example.com/image2.jpg');
    }

    // Click third thumbnail
    const thirdThumbnail = thumbnails[2];
    if (thirdThumbnail) {
      await userEvent.click(thirdThumbnail);
      expect(mainImage).toHaveAttribute('src', 'https://example.com/image3.jpg');
    }
  });

  it('handles products with no specifications', () => {
    const productWithoutSpecs = {
      ...mockProduct,
      specifications: null,
      all_specifications: null,
    };

    render(<ProductDetail product={productWithoutSpecs} />);

    // Check that specifications section is not rendered
    expect(screen.queryByText('Especificaciones')).not.toBeInTheDocument();
    expect(screen.queryByText('brand')).not.toBeInTheDocument();
    expect(screen.queryByText('model')).not.toBeInTheDocument();
    expect(screen.queryByText('color')).not.toBeInTheDocument();
  });

  it('handles products with no images', () => {
    const productWithoutImages = {
      ...mockProduct,
      images: null,
    };

    render(<ProductDetail product={productWithoutImages} />);

    // Check that only main image is rendered
    const mainImage = screen.getByRole('img', { name: 'Test Product' });
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image.jpg');

    // Check that thumbnails are not rendered
    expect(screen.queryByRole('img', { name: /Test Product - Imagen \d/i })).not.toBeInTheDocument();
  });

  it('handles products with a single image', () => {
    const productWithSingleImage = {
      ...mockProduct,
      images: ['https://example.com/image1.jpg'],
    };

    render(<ProductDetail product={productWithSingleImage} />);

    // Check that only main image is rendered
    const mainImage = screen.getByRole('img', { name: 'Test Product' });
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg');

    // Check that thumbnails are not rendered
    expect(screen.queryByRole('img', { name: /Test Product - Imagen \d/i })).not.toBeInTheDocument();
  });

  it('converts relative image URLs to absolute URLs', () => {
    const productWithRelativeUrls = {
      ...mockProduct,
      image_url: '/images/product.jpg',
      images: ['/images/image1.jpg', '/images/image2.jpg'],
    };

    render(<ProductDetail product={productWithRelativeUrls} />);

    // Check that URLs are converted to absolute
    const mainImage = screen.getByRole('img', { name: 'Test Product' });
    expect(mainImage).toHaveAttribute('src', 'https://www.cecomsa.com/images/image1.jpg');

    const thumbnails = screen.getAllByRole('img', { name: /Test Product - Imagen \d/i });
    expect(thumbnails[0]).toHaveAttribute('src', 'https://www.cecomsa.com/images/image1.jpg');
    expect(thumbnails[1]).toHaveAttribute('src', 'https://www.cecomsa.com/images/image2.jpg');
  });
}); 