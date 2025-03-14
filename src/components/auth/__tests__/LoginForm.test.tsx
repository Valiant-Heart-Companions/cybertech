import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import { supabase } from '~/utils/supabase';
import { useLanguage } from '~/i18n/LanguageContext';
import userEvent from '@testing-library/user-event';

// Mock the supabase client
jest.mock('~/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

// Mock the language context
jest.mock('~/i18n/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
    });
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    // Check if all form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.click(submitButton);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Use native form validation attributes
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('validates email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    
    // Check that input has email type for native validation
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('handles successful login', async () => {
    // Mock successful login
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null,
    });
    
    render(<LoginForm />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Verify that signIn was called with correct data
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles login error', async () => {
    // Mock failed login
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid credentials' },
    });
    
    render(<LoginForm />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    // Mock delayed login response
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    
    render(<LoginForm />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check for loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    
    // Wait for loading state to clear
    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });
  });

  it('renders in Spanish when language is set to Spanish', () => {
    (useLanguage as jest.Mock).mockReturnValue({
      language: 'es',
      setLanguage: jest.fn(),
    });

    render(<LoginForm />);
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
  });

  it('applies correct styling to form elements', () => {
    render(<LoginForm />);
    
    // Get form element by its class instead of role
    const form = screen.getByTestId('login-form');
    expect(form).toHaveClass('bg-white', 'p-8', 'rounded-lg', 'shadow-md');
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    expect(emailInput).toHaveClass('shadow', 'appearance-none', 'border', 'rounded');
    expect(passwordInput).toHaveClass('shadow', 'appearance-none', 'border', 'rounded');
    expect(submitButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('disables form during submission', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
}); 