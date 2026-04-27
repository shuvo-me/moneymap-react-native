import { useAuthStore } from "@/store";
import { Redirect, Stack, useSegments } from "expo-router";

const ProdectedLayout = () => {
  const session = useAuthStore((state) => state.session); // Replace with your authentication logic
  const isInAuthGroup = useSegments()[0] === "(auth)";
  const isInProtectedGroup = useSegments()[0] === "(protected)";
  const isAtWelcomePage = useSegments()[0] === "welcome";

  if (!session) {
    if (!isAtWelcomePage && !isInAuthGroup) {
      return <Redirect href="/welcome" />;
    }
  } else if (session) {
    if (isAtWelcomePage || isInAuthGroup) {
      return <Redirect href="/(protected)/(tabs)" />;
    }
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProdectedLayout;
