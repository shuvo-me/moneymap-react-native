import {
  Circle,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
  styled
} from "tamagui";
// Using the Lucide icons you requested
import AppTopBar from "@/components/AppTopBar";
import { CategoryDistribution } from "@/components/CategoryDistribution";
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


        {/* Hero Spending Card: Uses Semantic primary tokens */}
        <HearthCard mb="$5" mt={"$5"}>
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
            <Text ff="$heading" fos="$8" fow="800" col="$primary">
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

        <XStack gap="$4" mb={'$5'}>
          {/* Monthly Budget Card */}
          <YStack
            f={1}
            p="$3"
            br="$7"
            bg="$background" // Using your Hearth Editorial Cream
            jc="space-between"
            elevation={2}
            shadowColor="$foreground"
            shadowOpacity={0.04}
            shadowOffset={{ width: 0, height: 4 }}
            shadowRadius={40}
          >
            <YStack>
              <Text
                ff="$body"
                fos={"$1"}
                fow="700"
                ls={1.5}
                tt="uppercase"
                col="$colorMuted"
                opacity={0.6}
              >
                Monthly Budget
              </Text>
              <Text ff="$heading" fos="$6" fow="800" mt="$1" col="$color">
                $4,000.00
              </Text>
            </YStack>

            <YStack mt="$4" gap="$2">
              {/* Progress Bar */}
              <View h={6} w="100%" bg="$primaryLow" br="$full" ov="hidden">
                <View h="100%" w="85.5%" bg="$primary" br="$full" />
              </View>
              <Text ff="$body" fos={10} fow="600" col="$colorMuted">
                85.5% utilized
              </Text>
            </YStack>
          </YStack>

          {/* Savings Rate Card */}
          <YStack
            f={1}
            p="$3"
            br="$7"
            bg="$background"
            elevation={2}
            shadowColor="$foreground"
            shadowOpacity={0.04}
            shadowOffset={{ width: 0, height: 4 }}
            shadowRadius={40}
          >
            <YStack>
              <Text
                ff="$body"
                fos={"$1"}
                fow="700"
                ls={1.5}
                tt="uppercase"
                col="$colorMuted"
                opacity={0.6}
              >
                Savings Rate
              </Text>
              <Text ff="$heading" fos="$6" fow="800" mt="$1" col="$secondary">
                14.5%
              </Text>
            </YStack>

            <Text
              ff="$body"
              fos={10}
              lh={16}
              mt="$3"
              col="$colorMuted"
              fsi="italic"
            >
              "Steady growth is the path to freedom."
            </Text>
          </YStack>
        </XStack>

        <CategoryDistribution />

        {/* Recent Activity List */}
        <YStack mt={'$5'} gap={'$3'}>
          <XStack jc="space-between" ai="center" >
            <Text ff="$heading" fos="$4" fow="800" col="$color">
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
        </YStack>

      </ScrollView>
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
      <Circle size={52} bc="$secondaryForeground" bw={1} boc="$border">
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
