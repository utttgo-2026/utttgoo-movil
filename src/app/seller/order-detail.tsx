import React from 'react';
import { SellerEntry } from '@/components/seller/SellerEntry';
import { AwsSellerOrderDetail } from '@/components/catalog/AwsOrderFlow';

export default function SellerOrderDetailScreen() { return <SellerEntry authorizedChildren={<AwsSellerOrderDetail />} />; }
