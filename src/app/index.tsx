import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '../screens/LoginScreen';
import { useStore } from '../hooks/use-store';

export default function Index() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleNavigateToRegister = () => {
    router.push('/explore');
  };

  return <LoginScreen onNavigateToRegister={handleNavigateToRegister} />;
}

