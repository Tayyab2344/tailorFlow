import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import CustomersScreen from '../screens/CustomersScreen';
import { useStore } from '../hooks/use-store';

export default function Customers() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  return isLoggedIn ? <CustomersScreen /> : null;
}
