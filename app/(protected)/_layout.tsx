import { useAuthStore } from "@/store";
import { Redirect, Stack, useSegments } from "expo-router";

const ProdectedLayout = () => {
  const session = useAuthStore((state) => state.session);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasSeenWelcome = useAuthStore((state) => state.hasSeenWelcome);
  const isInAuthGroup = useSegments()[0] === "(auth)";
  const isAtOnboardingPage = useSegments()[0] === "onboarding";
  const isAtWelcomePage = useSegments()[0] === "welcome";
  const isOnboardingComplete = session?.onboardingComplete || false;

  if (!_hasHydrated) {
    return null;
  }

  if (!session) {
    if (!hasSeenWelcome && !isAtWelcomePage) {
      return <Redirect href="/welcome" />;
    }

    if (hasSeenWelcome && !isInAuthGroup && !isAtWelcomePage) {
      return <Redirect href={"/sign_in"} />;
    }
  } else {
    if (!isOnboardingComplete && !isAtOnboardingPage) {
      return <Redirect href="/onboarding" />;
    }

    if (
      isOnboardingComplete &&
      (isAtWelcomePage || isInAuthGroup || isAtOnboardingPage)
    ) {
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
