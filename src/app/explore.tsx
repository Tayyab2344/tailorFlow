import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import RegisterScreen from '../screens/RegisterScreen';
import { useStore } from '../hooks/use-store';

export default function Explore() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleNavigateToLogin = () => {
    router.push('/');
  };

  return <RegisterScreen onNavigateToLogin={handleNavigateToLogin} />;
}

