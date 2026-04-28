import { useAuthStore } from "@/store";
import { Redirect, Stack, useSegments } from "expo-router";

const ProdectedLayout = () => {
  const session = useAuthStore((state) => state.session); // Replace with your authentication logic
  const isInAuthGroup = useSegments()[0] === "(auth)";
  const isAtOnboardingPage = useSegments()[0] === "onboarding";
  const isAtWelcomePage = useSegments()[0] === "welcome";
  const isOnboardingComplete = session?.onboardingComplete || false; // Example flag, replace with your actual logic

  if (!session) {
    if (!isAtWelcomePage && !isInAuthGroup) {
      return <Redirect href="/welcome" />;
    }
  } else if (session) {
    if (!isOnboardingComplete) {
      return <Redirect href="/onboarding" />;
    }
    if (isAtWelcomePage || isInAuthGroup || isAtOnboardingPage) {
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
