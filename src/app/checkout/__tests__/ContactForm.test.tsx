import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';
import { useLanguage } from '~/i18n/LanguageContext';

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn();
  const mockInitialData = {
    email: 'test@example.com',
    phone: '1234567890',
  };

  beforeEach(() => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });
  });

  it('renders contact form with all fields', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it('pre-fills form with initial data', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByLabelText(/email address/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('1234567890');
  });

  it('validates required fields', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    // Clear all fields
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '' } });

    // Submit form
    fireEvent.click(screen.getByText(/continue to shipping/i));

    // Check for validation messages
    const emailError = screen.getByText(/email is required/i);
    const phoneError = screen.getByText(/phone number is required/i);

    expect(emailError).toBeInTheDocument();
    expect(emailError.tagName).toBe('P');
    expect(emailError).toHaveClass('mt-1', 'text-sm', 'text-red-600');

    expect(phoneError).toBeInTheDocument();
    expect(phoneError.tagName).toBe('P');
    expect(phoneError).toHaveClass('mt-1', 'text-sm', 'text-red-600');
  });

  // it('validates email format', async () => {
  //   render(
  //     <ContactForm
  //       onSubmit={mockOnSubmit}
  //       initialData={{ ...mockInitialData, email: 'invalid-email@' }}
  //     />
  //   );

  //   // Submit form to trigger validation
  //   fireEvent.click(screen.getByText(/continue to shipping/i));

  //   // Wait for the error message to appear
  //   const errorMessage = await screen.findByText(/please enter a valid email address/i);
  //   expect(errorMessage).toBeInTheDocument();
  //   expect(errorMessage.tagName).toBe('P');
  //   expect(errorMessage).toHaveClass('mt-1', 'text-sm', 'text-red-600');
  // });

  it('validates phone number format', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    const phoneInput = screen.getByLabelText(/phone number/i);
    fireEvent.change(phoneInput, { target: { value: 'invalid' } });

    fireEvent.click(screen.getByText(/continue to shipping/i));

    const errorMessage = screen.getByText(/please enter a valid phone number/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.tagName).toBe('P');
    expect(errorMessage).toHaveClass('mt-1', 'text-sm', 'text-red-600');
  });

  it('handles successful form submission', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    fireEvent.click(screen.getByText(/continue to shipping/i));

    expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialData);
  });

  it('renders in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });

    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número de teléfono/i)).toBeInTheDocument();
    expect(screen.getByText(/continuar a envío/i)).toBeInTheDocument();
  });

  it('applies correct styling to form elements', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    // Find the form by its heading and then get the parent form element
    const heading = screen.getByText(/contact information/i);
    const form = heading.closest('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('p-6', 'space-y-6');

    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveClass('mt-1', 'block', 'w-full', 'rounded-md', 'shadow-sm');
    expect(emailInput).toHaveClass('border-gray-300');

    const phoneInput = screen.getByLabelText(/phone number/i);
    expect(phoneInput).toHaveClass('mt-1', 'block', 'w-full', 'rounded-md', 'shadow-sm');
    expect(phoneInput).toHaveClass('border-gray-300');

    const button = screen.getByText(/continue to shipping/i);
    expect(button).toHaveClass('inline-flex', 'justify-center', 'rounded-md', 'border', 'border-transparent', 'bg-indigo-600', 'py-2', 'px-4', 'text-sm', 'font-medium', 'text-white', 'shadow-sm');
  });

  it('displays validation messages in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });

    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    // Clear email field
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: '' } });

    // Submit form
    fireEvent.click(screen.getByText(/continuar a envío/i));

    expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
  });

  it('handles phone number formatting', () => {
    render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    const phoneInput = screen.getByLabelText(/phone number/i);
    
    // Test phone number formatting
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput).toHaveValue('1234567890');

    // Test invalid input
    fireEvent.change(phoneInput, { target: { value: 'abc' } });
    expect(phoneInput).toHaveValue('abc');
  });

  it('preserves form data when switching languages', () => {
    const { rerender } = render(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);

    // Change values
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    // Switch to Spanish
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
      languages: { en: 'English', es: 'Español' },
    });

    // Re-render with Spanish language
    rerender(
      <ContactForm
        onSubmit={mockOnSubmit}
        initialData={mockInitialData}
      />
    );

    // Check if values are preserved
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('new@example.com');
    expect(screen.getByLabelText(/número de teléfono/i)).toHaveValue('9876543210');
  });
}); 