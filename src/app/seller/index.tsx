import React from 'react';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { usesProductMediaDemo } from '@/config/productMedia';
import SellerProductsScreen from './products';

export default function BusinessScreen() { return usesProductMediaDemo() ? <SellerProductsScreen /> : <SellerEntry />; }
