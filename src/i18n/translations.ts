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
      corporate: 'Corporativo',
    },
    footer: {
      aboutUs: 'Sobre Nosotros',
      contact: 'Contacto',
      corporate: 'Corporativo',
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
      filters: {
        title: 'Filtros',
        apply: 'Aplicar',
        clear: 'Limpiar',
      },
      sort: {
        label: 'Ordenar por',
        options: {
          featured: 'Destacados',
          priceAsc: 'Precio: Menor a Mayor',
          priceDesc: 'Precio: Mayor a Menor',
          newest: 'Más Recientes',
        },
      },
      noResults: 'No se encontraron productos',
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
      addressContent: '123 Calle Tecnología\nCiudad Innovación, CI 12345\nRepública Dominicana',
      phoneNumber: '+1 (809) 123-4567',
      emailAddress: 'contacto@cybertech.com',
      businessHoursContent: 'Lunes - Viernes: 9:00 AM - 6:00 PM\nSábado: 10:00 AM - 4:00 PM\nDomingo: Cerrado',
      form: {
        title: 'Envíenos un Mensaje',
        name: 'Nombre',
        email: 'Correo Electrónico',
        phone: 'Teléfono',
        message: 'Mensaje',
        sendMessage: 'Enviar Mensaje',
      },
    },
  },
  en: {
    navigation: {
      home: 'Home',
      shop: 'Shop',
      about: 'About Us',
      contact: 'Contact',
      corporate: 'Corporate',
    },
    footer: {
      aboutUs: 'About Us',
      contact: 'Contact',
      corporate: 'Corporate',
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
      filters: {
        title: 'Filters',
        apply: 'Apply',
        clear: 'Clear',
      },
      sort: {
        label: 'Sort by',
        options: {
          featured: 'Featured',
          priceAsc: 'Price: Low to High',
          priceDesc: 'Price: High to Low',
          newest: 'Newest',
        },
      },
      noResults: 'No products found',
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
      addressContent: '123 Technology Street\nInnovation City, IC 12345\nCountry',
      phoneNumber: '+1 (555) 123-4567',
      emailAddress: 'contact@cybertech.com',
      businessHoursContent: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
      form: {
        title: 'Send us a Message',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        message: 'Message',
        sendMessage: 'Send Message',
      },
    },
  },
} as const; 