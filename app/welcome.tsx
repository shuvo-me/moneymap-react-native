import { ShieldCheck, Wallet, Zap } from "@tamagui/lucide-icons-2";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as RNScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  H2,
  ScrollView,
  styled,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

// 1. Get Screen Width to calculate card snapping
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 2. Define Styled Containers
const StepContainer = styled(YStack, {
  width: SCREEN_WIDTH,
  px: "$6",
  jc: "center",
  ai: "center",
  gap: "$5",
});

const Dot = styled(View, {
  h: 8,
  br: "$full",
  animation: "quick", // Adds a smooth transition when resizing
});

// 3. Define Carousel Content
const DATA = [
  {
    title: "Take Control of Your Money",
    description:
      "Stop wondering where your money went. MoneyMap categorizes your spending automatically.",
    icon: Wallet,
    color: "$primary",
  },
  {
    title: "Track in Two Seconds",
    description:
      "We know you're busy. Log an expense faster than you can order a coffee. No spreadsheets, no stress, no friction.",
    icon: Zap,
    color: "$secondary",
  },
  {
    title: "Your Daily Safety Net",
    description:
      "See exactly how much you can spend today without touching your savings. It's like a GPS for your bank account.",
    icon: ShieldCheck,
    color: "$primary",
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // 4. Handle Scroll to update active dot
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    console.log("Scroll Offset:", scrollOffset, "Calculated Index:", index); // Debugging log
    setActiveIndex(index);
  };

  return (
    <YStack f={1} bg="$background" pt={insets.top} pb={insets.bottom + 20}>
      {/* 5. Swipeable ScrollView (Paging Enabled) */}
      <RNScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {DATA.map((item, index) => (
          <StepContainer key={index}>
            {/* Icon Container */}
            <View
              h={180}
              w={180}
              ai="center"
              jc="center"
              bg="$primaryLow"
              br="$full"
              mb="$4"
            >
              <item.icon
                size={80}
                color={item.color as any}
                strokeWidth={1.5}
              />
            </View>

            <YStack gap="$2" px="$4">
              <H2 ta="center" ff={"$body"} fow="900" ls={-1.5} col="$color">
                {item.title}
              </H2>
              <Text
                ta="center"
                col="$colorMuted"
                fos="$4"
                lh={24}
                opacity={0.8}
              >
                {item.description}
              </Text>
            </YStack>
          </StepContainer>
        ))}
      </RNScrollView>

      {/* 6. Pagination Dots (Progress Indicator) */}
      <XStack jc="center" gap="$2" mb="$8">
        {DATA.map((_, i) => (
          <Dot
            key={i}
            w={i === activeIndex ? 24 : 8} // Active dot is wider
            bg={i === activeIndex ? "$primary" : "$primaryLow"}
          />
        ))}
      </XStack>

      {/* 7. Action Buttons */}
      <YStack px="$6" gap="$3">
        <Button
          size="$5"
          bg="$primary"
          br="$4"
          // This must point to your Registration screen
          onPress={() => router.push("/sign_up")}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
        >
          <Text col="white" fow="700" fos="$4">
            Get Started
          </Text>
        </Button>

        <Button
          size="$5"
          variant="outlined"
          borderWidth={0}
          // This must point to your Login screen
          onPress={() => router.push("/sign_in")}
        >
          <Text col="$colorMuted" fow="600">
            Already have an account? Log In
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}
