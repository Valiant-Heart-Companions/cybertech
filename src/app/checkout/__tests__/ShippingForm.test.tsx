import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ShippingForm from '../ShippingForm';
import { useLanguage } from '~/i18n/LanguageContext';

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

describe('ShippingForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnBack = jest.fn();
  const mockInitialData = {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    apartment: 'Apt 4B',
    city: 'Santo Domingo',
    province: 'Distrito Nacional',
    sector: 'Piantini',
    references: 'Near the park',
    country: 'República Dominicana'
  };

  beforeAll(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      languages: ['en', 'es']
    });
  });

  afterEach(() => {
    cleanup();
    jest.resetModules();
    localStorage.clear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders shipping form with all fields', () => {
    render(
      <ShippingForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        initialData={mockInitialData}
      />
    );

    // Check for all required fields
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apartment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reference points/i)).toBeInTheDocument();
  });

  it('pre-fills form with initial data', () => {
    render(
      <ShippingForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue(mockInitialData.firstName);
    expect(screen.getByLabelText(/last name/i)).toHaveValue(mockInitialData.lastName);
    expect(screen.getByLabelText(/street address/i)).toHaveValue(mockInitialData.address);
    expect(screen.getByLabelText(/apartment/i)).toHaveValue(mockInitialData.apartment);
    expect(screen.getByLabelText(/city/i)).toHaveValue(mockInitialData.city);
    expect(screen.getByLabelText(/province/i)).toHaveValue(mockInitialData.province);
    expect(screen.getByLabelText(/sector/i)).toHaveValue(mockInitialData.sector);
    expect(screen.getByLabelText(/reference points/i)).toHaveValue(mockInitialData.references);
  });

  it('validates required fields', () => {
    render(
      <ShippingForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        initialData={mockInitialData}
      />
    );

    // Clear required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/street address/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/province/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/sector/i), { target: { value: '' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));

    // Check for validation messages
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/city is required/i)).toBeInTheDocument();
    expect(screen.getByText(/province is required/i)).toBeInTheDocument();
    expect(screen.getByText(/sector is required/i)).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(
      <ShippingForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        initialData={mockInitialData}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /back to contact/i }));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('renders in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
      languages: ['en', 'es']
    });

    render(
      <ShippingForm
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByText('Dirección de Envío')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/provincia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sector/i)).toBeInTheDocument();
  });
}); 