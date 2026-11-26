import React from 'react';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { AwsSellerOrders } from '@/components/catalog/AwsOrderFlow';

export default function SellerOrdersScreen() { return <SellerEntry authorizedChildren={<AwsSellerOrders />} />; }
