import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import OrdersScreen from '../screens/OrdersScreen';
import { useStore } from '../hooks/use-store';

export default function Orders() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  return isLoggedIn ? <OrdersScreen /> : null;
}
