import { http, HttpResponse } from 'msw';

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface CheckoutRequest {
  items: Array<{
    id: string;
    quantity: number;
  }>;
  shipping: {
    address: string;
    city: string;
    country: string;
    postal_code: string;
  };
  contact: {
    email: string;
    phone: string;
    name: string;
  };
}

export const handlers = [
  // Mock registration endpoint
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    const { email, password, first_name, last_name, phone_number } = body;

    // Simulate validation
    if (!email || !password || !first_name || !last_name || !phone_number) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate successful registration
    return HttpResponse.json({
      user: {
        id: '123',
        email,
        first_name,
        last_name,
        phone_number,
      },
    });
  }),

  // Mock login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    // Simulate validation
    if (!email || !password) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate successful login
    return HttpResponse.json({
      user: {
        id: '123',
        email,
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1234567890',
      },
      token: 'mock-jwt-token',
    });
  }),

  // Mock product listing endpoint
  http.get('/api/products', () => {
    return HttpResponse.json({
      products: [],
      total: 0,
    });
  }),

  // Mock checkout endpoint
  http.post('/api/checkout', async ({ request }) => {
    const body = await request.json() as CheckoutRequest;
    const { items, shipping, contact } = body;

    // Simulate validation
    if (!items?.length || !shipping || !contact) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate successful order creation
    return HttpResponse.json({
      orderId: '12345',
      status: 'pending',
      total: 99.99,
    });
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json({
      categories: [],
    });
  }),
]; 