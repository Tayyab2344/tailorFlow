import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import WorkforceScreen from '../screens/WorkforceScreen';
import { useStore } from '../hooks/use-store';

export default function Workforce() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  return isLoggedIn ? <WorkforceScreen /> : null;
}
