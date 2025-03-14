import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from '../RegisterForm';
import { supabase } from '~/utils/supabase';
import { translations } from '~/i18n/translations';

// Mock the supabase client
jest.mock('~/utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  },
}));

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'es',
    setLanguage: jest.fn(),
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(<RegisterForm />);
    
    // Check if all form elements are present with Spanish labels
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  // it('handles successful registration', async () => {
  //   // Mock successful signup
  //   (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
  //     data: { user: { id: '123' } },
  //     error: null,
  //   });
    
  //   // Mock successful user verification
  //   (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
  //     data: { user: { id: '123' } },
  //     error: null,
  //   });

  //   // Mock successful profile creation
  //   (supabase.rpc as jest.Mock).mockResolvedValueOnce({
  //     data: { success: true },
  //     error: null,
  //   });
    
  //   render(<RegisterForm />);
    
  //   // Fill in form with valid data
  //   fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
  //     target: { value: 'test@example.com' },
  //   });
  //   fireEvent.change(screen.getByLabelText(/contraseña/i), {
  //     target: { value: 'password123' },
  //   });
  //   fireEvent.change(screen.getByLabelText(/nombre/i), {
  //     target: { value: 'John' },
  //   });
  //   fireEvent.change(screen.getByLabelText(/apellido/i), {
  //     target: { value: 'Doe' },
  //   });
  //   fireEvent.change(screen.getByLabelText(/teléfono/i), {
  //     target: { value: '+1234567890' },
  //   });
    
  //   // Submit form
  //   fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    
  //   // Wait for success message
  //   await waitFor(() => {
  //     expect(screen.getByText(/por favor verifica tu correo electrónico/i)).toBeInTheDocument();
  //   });
    
  //   // Verify that signUp was called with correct data
  //   expect(supabase.auth.signUp).toHaveBeenCalledWith({
  //     email: 'test@example.com',
  //     password: 'password123',
  //     options: {
  //       data: {
  //         first_name: 'John',
  //         last_name: 'Doe',
  //         phone_number: '+1234567890',
  //       },
  //     },
  //   });
  // });

  it('handles registration error', async () => {
    // Mock failed signup
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: new Error('An error occurred during registration'),
    });
    
    render(<RegisterForm />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/apellido/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '+1234567890' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred during registration')).toBeInTheDocument();
    });
  });
}); 