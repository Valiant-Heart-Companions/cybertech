export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'es';

export const translations = {
  es: {
    navigation: {
      home: 'Inicio',
      shop: 'Tienda',
      about: 'Sobre Nosotros',
      contact: 'Contacto',
      account: 'Mi Cuenta',
    },
    search: {
      placeholder: 'Buscar productos...',
      button: 'Buscar',
      noResults: 'No se encontraron resultados',
      resultsFor: 'Resultados para',
    },
    footer: {
      aboutUs: 'Sobre Nosotros',
      contact: 'Contacto',
      privacyPolicy: 'Política de Privacidad',
      termsOfService: 'Términos de Servicio',
      allRightsReserved: 'Todos los derechos reservados',
    },
    home: {
      hero: {
        title: 'Bienvenido a Cybertech',
        subtitle: 'Su tienda de confianza para soluciones tecnológicas',
        cta: 'Comprar Ahora',
      },
      featuredProducts: {
        title: 'Productos Destacados',
        viewAll: 'Ver Todos',
      },
      categories: {
        title: 'Categorías',
        viewAll: 'Ver Todas',
        electronics: 'Electrónicos',
        audio: 'Audio',
        wearables: 'Wearables',
        accessories: 'Accesorios',
      },
      promotions: {
        title: 'Ofertas Especiales',
        viewAll: 'Ver Todas',
        description: '¡Ofertas especiales en productos seleccionados!',
        cta: 'Ver Ofertas',
      },
    },
    shop: {
      title: 'Tienda',
      featured: 'Destacados',
      items: {
        singular: 'producto',
        plural: 'productos'
      },
      filters: {
        title: 'Filtros',
        apply: 'Aplicar',
        clear: 'Limpiar',
        priceRange: 'Rango de Precio',
        min: 'Mín.',
        max: 'Máx.',
        availability: 'Disponibilidad',
        inStock: 'En Stock',
        applying: 'Aplicando...'
      },
      sort: {
        label: 'Ordenar por',
        options: {
          featured: 'Destacados',
          priceAsc: 'Precio: Menor a Mayor',
          priceDesc: 'Precio: Mayor a Menor',
          newest: 'Más Recientes'
        }
      },
      noResults: 'No se encontraron productos',
      noImage: 'Sin imagen',
      categories: {
        all: 'Ver todos los productos',
        title: 'Categorías'
      }
    },
    about: {
      title: 'Sobre Cybertech',
      intro: 'Cybertech es su socio de confianza en soluciones tecnológicas. Con años de experiencia en la industria, hemos construido nuestra reputación en la provisión de productos de alta calidad y un servicio al cliente excepcional.',
      mission: {
        title: 'Nuestra Misión',
        content: 'Proporcionar soluciones tecnológicas de vanguardia mientras mantenemos los más altos estándares de satisfacción del cliente y excelencia en el servicio.',
      },
      values: {
        title: 'Nuestros Valores',
        items: [
          'Cliente Primero',
          'Excelencia en Calidad',
          'Innovación',
          'Integridad',
          'Mejora Continua',
        ],
      },
      history: {
        title: 'Nuestra Historia',
        content: 'Fundada con la visión de revolucionar el comercio minorista de tecnología, Cybertech ha crecido desde una pequeña tienda local hasta convertirse en un proveedor líder de soluciones tecnológicas. Nuestro viaje está marcado por la innovación continua y el compromiso inquebrantable con la satisfacción del cliente.',
      },
    },
    contact: {
      title: 'Contáctenos',
      getInTouch: 'Póngase en Contacto',
      address: 'Dirección',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      businessHours: 'Horario de Atención',
      addressContent: 'Calle Rosario Esquina Salome Ureña\nMoca, Espaillat\nRepública Dominicana',
      phoneNumber: '(809) 822-0511',
      emailAddress: 'contacto@cybertechrd.com',
      businessHoursContent: 'Lunes - Viernes: 9:00 AM - 6:00 PM\nSábado: 10:00 AM - 4:00 PM\nDomingo: Cerrado',
      city: 'Ciudad',
      state: 'Provincia',
      postalCode: 'Código Postal',
      form: {
        title: 'Envíenos un Mensaje',
        name: 'Nombre',
        email: 'Correo Electrónico',
        phone: 'Teléfono',
        message: 'Mensaje',
        sendMessage: 'Enviar Mensaje',
      },
    },
    account: {
      title: 'Mi Cuenta',
      welcome: 'Bienvenido',
      orders: {
        title: 'Mis Pedidos',
        noOrders: 'No tienes pedidos aún',
        notLoggedIn: 'Por favor inicia sesión para ver tus pedidos',
        fetchError: 'Error al cargar los pedidos',
        unexpectedError: 'Ocurrió un error inesperado',
        tryAgain: 'Intentar de nuevo',
        startShopping: 'Comenzar a comprar',
        productNotFound: 'Producto no encontrado',
        status: {
          pending: 'Pendiente',
          processing: 'Procesando',
          shipped: 'Enviado',
          delivered: 'Entregado',
          cancelled: 'Cancelado'
        }
      },
      profile: {
        title: 'Perfil',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        save: 'Guardar cambios'
      },
      addresses: {
        title: 'Direcciones',
        addNew: 'Agregar nueva dirección',
        edit: 'Editar',
        delete: 'Eliminar',
        default: 'Predeterminada',
        noAddresses: 'No tienes direcciones guardadas',
        defaultShipping: 'Dirección de envío predeterminada',
        defaultBilling: 'Dirección de facturación predeterminada',
        notLoggedIn: 'Por favor inicia sesión para ver tus direcciones',
        fetchError: 'Error al cargar las direcciones',
        unexpectedError: 'Ocurrió un error inesperado',
        saveError: 'Error al guardar la dirección',
        updateError: 'Error al actualizar la dirección',
        deleteError: 'Error al eliminar la dirección',
        deleteConfirmation: '¿Estás seguro de que deseas eliminar esta dirección?',
        tryAgain: 'Intentar de nuevo'
      },
      auth: {
        login: 'Iniciar sesión',
        register: 'Crear cuenta',
        logout: 'Cerrar sesión',
        forgotPassword: '¿Olvidaste tu contraseña?',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        firstName: 'Nombre',
        lastName: 'Apellido',
        phone: 'Teléfono',
        required: 'Campo requerido',
        invalidEmail: 'Correo electrónico inválido',
        passwordMismatch: 'Las contraseñas no coinciden',
        success: 'Cuenta creada exitosamente',
        error: 'Ocurrió un error'
      }
    },
    checkout: {
      shipping: 'Envío',
      billing: 'Facturación',
    },
  },
  en: {
    navigation: {
      home: 'Home',
      shop: 'Shop',
      about: 'About Us',
      contact: 'Contact',
      account: 'My Account',
    },
    search: {
      placeholder: 'Search products...',
      button: 'Search',
      noResults: 'No results found',
      resultsFor: 'Results for',
    },
    footer: {
      aboutUs: 'About Us',
      contact: 'Contact',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      allRightsReserved: 'All rights reserved',
    },
    home: {
      hero: {
        title: 'Welcome to Cybertech',
        subtitle: 'Your trusted store for technology solutions',
        cta: 'Shop Now',
      },
      featuredProducts: {
        title: 'Featured Products',
        viewAll: 'View All',
      },
      categories: {
        title: 'Categories',
        viewAll: 'View All',
        electronics: 'Electronics',
        audio: 'Audio',
        wearables: 'Wearables',
        accessories: 'Accessories',
      },
      promotions: {
        title: 'Special Offers',
        viewAll: 'View All',
        description: 'Special offers on selected products!',
        cta: 'View Offers',
      },
    },
    shop: {
      title: 'Shop',
      featured: 'Featured',
      items: {
        singular: 'product',
        plural: 'products'
      },
      filters: {
        title: 'Filters',
        apply: 'Apply',
        clear: 'Clear',
        priceRange: 'Price Range',
        min: 'Min',
        max: 'Max',
        availability: 'Availability',
        inStock: 'In Stock',
        applying: 'Applying...'
      },
      sort: {
        label: 'Sort by',
        options: {
          featured: 'Featured',
          priceAsc: 'Price: Low to High',
          priceDesc: 'Price: High to Low',
          newest: 'Newest'
        }
      },
      noResults: 'No products found',
      noImage: 'No image',
      categories: {
        all: 'View all products',
        title: 'Categories'
      }
    },
    about: {
      title: 'About Cybertech',
      intro: 'Cybertech is your trusted partner in technology solutions. With years of experience in the industry, we\'ve built our reputation on providing high-quality products and exceptional customer service.',
      mission: {
        title: 'Our Mission',
        content: 'To provide cutting-edge technology solutions while maintaining the highest standards of customer satisfaction and service excellence.',
      },
      values: {
        title: 'Our Values',
        items: [
          'Customer First',
          'Quality Excellence',
          'Innovation',
          'Integrity',
          'Continuous Improvement',
        ],
      },
      history: {
        title: 'Our History',
        content: 'Founded with a vision to revolutionize technology retail, Cybertech has grown from a small local shop to a leading technology solutions provider. Our journey is marked by continuous innovation and unwavering commitment to customer satisfaction.',
      },
    },
    contact: {
      title: 'Contact Us',
      getInTouch: 'Get in Touch',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      businessHours: 'Business Hours',
      addressContent: 'Calle Rosario Esquina Salome Ureña\nMoca, Espaillat\nDominican Republic',
      phoneNumber: '(809) 822-0511',
      emailAddress: 'contact@cybertechrd.com',
      businessHoursContent: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code',
      form: {
        title: 'Send us a Message',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        message: 'Message',
        sendMessage: 'Send Message',
      },
    },
    account: {
      title: 'My Account',
      welcome: 'Welcome',
      orders: {
        title: 'My Orders',
        noOrders: 'You have no orders yet',
        notLoggedIn: 'Please log in to view your orders',
        fetchError: 'Error loading orders',
        unexpectedError: 'An unexpected error occurred',
        tryAgain: 'Try again',
        startShopping: 'Start shopping',
        productNotFound: 'Product not found',
        status: {
          pending: 'Pending',
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        }
      },
      profile: {
        title: 'Profile',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        save: 'Save Changes'
      },
      addresses: {
        title: 'Addresses',
        addNew: 'Add New Address',
        edit: 'Edit',
        delete: 'Delete',
        default: 'Default',
        noAddresses: 'You have no saved addresses',
        defaultShipping: 'Default Shipping Address',
        defaultBilling: 'Default Billing Address',
        notLoggedIn: 'Please log in to view your addresses',
        fetchError: 'Error loading addresses',
        unexpectedError: 'An unexpected error occurred',
        saveError: 'Error saving address',
        updateError: 'Error updating address',
        deleteError: 'Error deleting address',
        deleteConfirmation: 'Are you sure you want to delete this address?',
        tryAgain: 'Try again'
      },
      auth: {
        login: 'Login',
        register: 'Create Account',
        logout: 'Logout',
        forgotPassword: 'Forgot Password?',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone',
        required: 'Required field',
        invalidEmail: 'Invalid email',
        passwordMismatch: 'Passwords do not match',
        success: 'Account created successfully',
        error: 'An error occurred'
      }
    },
    checkout: {
      shipping: 'Shipping',
      billing: 'Billing',
    },
  },
} as const; 