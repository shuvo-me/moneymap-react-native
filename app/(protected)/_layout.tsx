import { useAuthStore } from '@/store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

const ProdectedLayout = () => {
    const session = useAuthStore((state) => state.session); // Replace with your authentication logic

    if (!session) {
        return <Redirect href="/sign_in" />;
    }

  return (
    <Stack>
         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}

export default ProdectedLayout