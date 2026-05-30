import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import MoreScreen from '../screens/MoreScreen';
import { useStore } from '../hooks/use-store';

export default function More() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  return isLoggedIn ? <MoreScreen /> : null;
}
