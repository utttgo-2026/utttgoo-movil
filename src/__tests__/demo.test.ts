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
    expect(ROUTES.demo.first).toBe('/demo-one');
    expect(ROUTES.demo.second).toBe('/demo-two');
    expect(ROUTES.buyer.home).toBe('/buyer');
  });
});
