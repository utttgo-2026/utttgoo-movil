import { demoFoods, demoOffers } from '@/data/demo';
import { ROUTES } from '@/navigation/routes';

describe('guest demo', () => {
  it('contains the two reference foods and local offer comparisons', () => {
    expect(demoFoods.map((food) => food.name)).toEqual([
      'Torta de milanesa',
      'Chilaquiles rojos',
    ]);
    expect(demoOffers).toHaveLength(4);
    expect(demoOffers.every((offer) => offer.rating >= 4.6)).toBe(true);
  });

  it('keeps demo navigation separate from productive buyer routes', () => {
    expect(ROUTES.auth.welcome).toBe('/welcome');
    expect(ROUTES.auth.login).toBe('/login');
    expect(ROUTES.auth.register).toBe('/register');
    expect(ROUTES.demo.first).toBe('/demo-one');
    expect(ROUTES.demo.second).toBe('/demo-two');
    expect(ROUTES.buyer.home).toBe('/buyer');
  });

  it('starts the app at Demo 1 instead of Welcome', () => {
    expect(ROUTES.demo.first).toBe('/demo-one');
    expect(ROUTES.auth.welcome).not.toBe(ROUTES.demo.first);
  });

  it('keeps the expected guest demo content', () => {
    expect(demoFoods[0].name).toBe('Torta de milanesa');
    expect(demoOffers.map((offer) => offer.seller)).toEqual([
      'Cocina de Lupita',
      'El Sabor de Toño',
      'Antojitos del Barrio',
      'La Tortería',
    ]);
  });
});
