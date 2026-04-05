import queryClient from "@/config/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="sign_in" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  )
}
