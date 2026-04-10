import {
  Button,
  Circle,
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
  styled,
} from "tamagui";
// Using the Lucide icons you requested
import AppTopBar from "@/components/AppTopBar";
import { useAuthStore } from "@/store";
import {
  ArrowRight,
  Coffee,
  Dumbbell,
  ShoppingBag,
  TrendingUp,
} from "@tamagui/lucide-icons-2";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Styled Components (Using your Config Shorthands & Tokens) ---

const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: "$background",
  px: "$4", // shorthand for paddingHorizontal from your config
});

const HearthCard = styled(YStack, {
  backgroundColor: "$primaryLow",
  br: "$9", // Mapping to a large border radius token
  p: "$6",
  // shadowColor: '$border',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
});

// --- Main Screen ---

export default function HearthDashboard() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.session);
  return (
    <ScreenContainer
      style={{
        paddingTop: insets.top + 20,
      }}
    >
      <AppTopBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* Segmented Control: Consistent with Surface-Container-Low */}
        <XStack
          bc="$card"
          p="$1.5"
          br="$9"
          jc={"center"}
          gap="$1"
          bw={1}
          boc="$border"
          mt={"$6"}
        >
          <Button
            flex={1}
            size="$3"
            br="$9"
            bg="$background"
            fow="700"
            px="$6"
            elevation={2}
          >
            <Text ff="$body" fos="$2">
              All
            </Text>
          </Button>
          <Button size="$3" br="$9" bg="transparent" px="$6">
            <Text ff="$body" fos="$2" col="$colorMuted">
              Personal
            </Text>
          </Button>
          <Button flex={1} size="$3" br="$9" bg="transparent" px="$6">
            <Text ff="$body" fos="$2" col="$colorMuted">
              Family
            </Text>
          </Button>
        </XStack>

        {/* Hero Spending Card: Uses Semantic primary tokens */}
        <HearthCard mb="$10" mt={"$4"}>
          <Text
            ff="$body"
            fos="$1"
            fow="700"
            col="$primary"
            ls={2}
            mb="$2"
            opacity={0.7}
          >
            SPENDING • THIS WEEK
          </Text>
          <XStack ai="baseline" gap="$2">
            <Text ff="$heading" fos="$9" fow="800" col="$primary">
              $1,248
            </Text>
            <Text ff="$heading" fos="$6" fow="700" col="$primary" opacity={0.6}>
              .60
            </Text>
          </XStack>

          <YStack mt="$4" gap="$2">
            <XStack ai="center" gap="$2">
              <TrendingUp size={16} color="$primary" />
              <Text ff="$body" fos="$1" fow="700" col="$primary">
                12% from last week
              </Text>
            </XStack>
            <View h={6} w="100%" bc="$primaryForeground" br="$full">
              <View h="100%" w="75%" bc="$primary" br="$full" />
            </View>
          </YStack>
        </HearthCard>

        {/* Recent Activity List */}
        <XStack jc="space-between" ai="center" mb="$5">
          <Text ff="$heading" fos="$6" fow="800" col="$color">
            Recent Activity
          </Text>
          <XStack ai="center" gap="$2">
            <Text col="$primary" fow="700" fos="$3" ff="$body">
              View All
            </Text>
            <ArrowRight size={16} color="$primary" />
          </XStack>
        </XStack>

        <YStack gap="$3">
          <TransactionRow
            title="Whole Foods"
            category="Family"
            amount="-$45.00"
            Icon={ShoppingBag}
            iconCol="$primary"
          />
          <TransactionRow
            title="Iron Paradise"
            category="Personal"
            amount="-$15.00"
            Icon={Dumbbell}
            iconCol="$secondary"
          />
          <TransactionRow
            title="Blue Bottle"
            category="Personal"
            amount="-$6.50"
            Icon={Coffee}
            iconCol="$tertiary"
          />
        </YStack>

        {/* Budgets Section */}
        <YStack mt="$6" gap={"$3"}>
          <Text ff="$heading" fos="$5" fow="800">
            Budgets
          </Text>
          <YStack p="$6" bc="$card" br="$9" bw={1} boc="$border">
            <BudgetProgress
              label="Home & Garden"
              progress="85%"
              colToken="$primary"
            />
            <Separator my="$5" boc="$border" opacity={0.5} />
            <BudgetProgress
              label="Entertainment"
              progress="42%"
              colToken="$secondary"
            />
          </YStack>
        </YStack>
      </ScrollView>

      {/* FAB: Uses primary and medium animation from config */}
      {/* <Button
        position="absolute"
        bottom={40}
        alignSelf="center"
        w={64}
        h={64}
        br="$6" // Based on your DEFAULT 0.25rem scaling
        bg="$primary"
        pressStyle={{ scale: 0.9, opacity: 0.9 }}
        shadowColor="$primary"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.3}
        icon={<Plus size={32} color="$primaryForeground" />}
      /> */}
    </ScreenContainer>
  );
}

// --- Internal Helper Components (Scoped to Theme Tokens) ---

const TransactionRow = ({ title, category, amount, Icon, iconCol }: any) => (
  <XStack
    jc="space-between"
    ai="center"
    p="$4"
    br="$4"
    bg={"$card"}
    pressStyle={{ bg: "$card", scale: 0.99 }}
    animation="fast"
  >
    <XStack ai="center" gap="$4">
      <Circle size={52} bc="$card" bw={1} boc="$border">
        <Icon
          size={20}
          color={iconCol.replace("$", "") === "primary" ? "#546354" : iconCol}
        />
      </Circle>
      <YStack>
        <Text ff="$body" fow="700" fos="$4" col="$color">
          {title}
        </Text>
        <XStack ai="center" gap="$2">
          <Circle size={6} bc={iconCol} />
          <Text ff="$body" col="$colorMuted" fos="$1" fow="600">
            {category} • 2:30 PM
          </Text>
        </XStack>
      </YStack>
    </XStack>
    <Text ff="$heading" fow="800" fos="$4" col="$color">
      {amount}
    </Text>
  </XStack>
);

const BudgetProgress = ({ label, progress, colToken }: any) => (
  <YStack gap="$2.5">
    <XStack jc="space-between">
      <Text ff="$body" fos="$1" fow="800" col="$colorMuted" ls={1.5}>
        {label.toUpperCase()}
      </Text>
      <Text ff="$heading" fow="800" fos="$2">
        {progress}
      </Text>
    </XStack>
    <View h={8} w="100%" bc="$background" br="$full">
      <View h="100%" w={progress} bc={colToken} br="$full" />
    </View>
  </YStack>
);
