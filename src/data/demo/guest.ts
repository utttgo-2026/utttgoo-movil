export interface DemoFood {
  id: string;
  name: string;
  seller: string;
  price: number;
  image: string;
}

export interface DemoOffer {
  id: string;
  seller: string;
  price: number;
  rating: number;
  comment: string;
}

export const demoFoods: DemoFood[] = [
  {
    id: 'demo-torta',
    name: 'Torta de milanesa',
    seller: 'Cocina de Lupita',
    price: 48,
    image:
      'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'demo-chilaquiles',
    name: 'Chilaquiles rojos',
    seller: 'Cocina de Lupita',
    price: 60,
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=85',
  },
];

export const demoOffers: DemoOffer[] = [
  {
    id: 'lupita',
    seller: 'Cocina de Lupita',
    price: 42,
    rating: 4.8,
    comment: 'Sabor casero y entrega rápida',
  },
  {
    id: 'tono',
    seller: 'El Sabor de Toño',
    price: 51,
    rating: 4.9,
    comment: 'Porciones abundantes',
  },
  {
    id: 'barrio',
    seller: 'Antojitos del Barrio',
    price: 39,
    rating: 4.6,
    comment: 'Muy buena opción para el recreo',
  },
  {
    id: 'torteria',
    seller: 'La Tortería',
    price: 48.5,
    rating: 4.7,
    comment: 'Pan recién tostado',
  },
];
