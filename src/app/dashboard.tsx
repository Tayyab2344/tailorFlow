import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import DashboardScreen from '../screens/DashboardScreen';
import { useStore } from '../hooks/use-store';

export default function Dashboard() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  return isLoggedIn ? <DashboardScreen /> : null;
}
