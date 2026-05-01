import AppTopBar from "@/components/AppTopBar";
import { CategoryDistribution } from "@/components/CategoryDistribution";
import { ALL_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { logService } from "@/services/log.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store";
import { ArrowRight, Coins, ShoppingBag } from "@tamagui/lucide-icons-2";
import { useQuery } from "@tanstack/react-query";
import { format, isToday } from "date-fns";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Circle,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
  styled,
} from "tamagui";

const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: "$background",
  px: "$4",
});

const HearthCard = styled(YStack, {
  backgroundColor: "$primaryLow",
  br: "$9",
  p: "$6",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
});

export default function HearthDashboard() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.session);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: settings,
    refetch: refetchSettings,
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: ["userSettings", user?.uid],
    queryFn: () => userService.getSettings(user?.uid || ""),
    enabled: !!user?.uid,
  });

  const {
    data: logStats,
    refetch: refetchLogs,
    isLoading: logsLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["logs", "month", user?.uid],
    queryFn: () =>
      logService.fetchLogs(
        { categoryType: "all", timeRange: "month" },
        user?.uid as string,
      ),
    enabled: !!user?.uid,
    select: (logs) => {
      const total = logs.reduce((sum, log) => sum + (log.amount || 0), 0);
      return {
        all: logs,
        totalSpending: total,
        recent: logs.slice(0, 5),
      };
    },
  });

  const {
    monthlyBudget,
    utilization,
    savingsRate,
    currencySymbol,
    monthlySpending,
  } = useMemo(() => {
    const budget = settings?.monthlyBudget || 0;
    const spending = logStats?.totalSpending || 0;
    const util = budget > 0 ? (spending / budget) * 100 : 0;

    const currency = settings?.currency || "USD";
    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

    return {
      monthlyBudget: budget,
      utilization: util,
      savingsRate: Math.max(0, 100 - util),
      currencySymbol: symbol,
      monthlySpending: spending,
    };
  }, [settings, logStats]);

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();
  const today = new Date().getDate();
  const daysLeft = daysInMonth - today;
  const remainingBudget = Math.max(0, monthlyBudget - monthlySpending);
  const dailyAllowance =
    daysLeft > 0 ? remainingBudget / daysLeft : remainingBudget;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSettings(), refetchLogs()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  if ((settingsLoading || logsLoading) && !isRefetching) {
    return (
      <ScreenContainer jc="center" ai="center">
        <Spinner size="large" color="$primary" />
        <Text mt="$4" ff="$body" col="$colorMuted">
          Loading your data....
        </Text>
      </ScreenContainer>
    );
  }

  const getIconForCategory = (category: string) => {
    const icon = ALL_CATEGORIES.find((c) => c.id === category)?.icon;
    if (icon) {
      return icon;
    }
    return ShoppingBag;
  }

  const formatLogDate = (timeStamp: any) => {
    const date = timeStamp.toDate ? timeStamp.toDate() : new Date(timeStamp);
    if (isToday(date)) {
      return "Today";
    }

    return format(date, 'dd mm yyyy');
  }

  return (
    <ScreenContainer style={{ paddingTop: insets.top + 20 }}>
      <AppTopBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#546354"
          />
        }
      >
        {/* Main Spending Card */}
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
            SPENDING • THIS MONTH
          </Text>
          <XStack ai="baseline" gap="$2">
            <Text ff="$heading" fos="$8" fow="800" col="$primary">
              {formatCurrency(logStats?.totalSpending || 0)}
            </Text>
          </XStack>

          <YStack mt="$2" gap="$1">
            <XStack ai="center" gap="$2">
              <View p="$1.5" br="$full" bg="$primaryForeground">
                <Coins size={14} color="$primary" />
              </View>
              <Text ff="$body" fos="$2" fow="600" col="$primary">
                {formatCurrency(dailyAllowance)} / day left
              </Text>
            </XStack>
            <Text ff="$body" fos="$1" col="$primary" opacity={0.6} ml="$7">
              To stay within your {formatCurrency(monthlyBudget)} budget
            </Text>
          </YStack>
        </HearthCard>

        {/* Budget & Savings Info */}
        <XStack gap="$4" mb={"$5"}>
          <MetricCard
            label="Monthly Budget"
            value={formatCurrency(monthlyBudget)}
            subtext={`${utilization.toFixed(1)}% utilized`}
            progress={utilization}
          />
          <MetricCard
            label="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            subtext='"Steady growth is freedom."'
            isSavings
          />
        </XStack>

        <CategoryDistribution logs={logStats?.all || []} />

        {/* Recent Activity */}
        <YStack mt={"$5"} gap={"$3"}>
          <XStack jc="space-between" ai="center">
            <Text ff="$heading" fos="$4" fow="800" col="$color">
              Recent Activity
            </Text>
            <XStack ai="center" gap="$2" pressStyle={{ opacity: 0.7 }}>
              <Text col="$primary" fow="700" fos="$3" ff="$body">
                View All
              </Text>
              <ArrowRight size={16} color="$primary" />
            </XStack>
          </XStack>

          <YStack gap="$3">
            {logStats?.recent && logStats.recent.length > 0 ? (
              logStats.recent.map((log: any) => (
                <TransactionRow
                  key={log.id}
                  title={log.title || ''}
                  category={log.category}
                  amount={`-${formatCurrency(log.amount)}`}
                  Icon={getIconForCategory(log.category)}
                  iconCol="$primary"
                  time={formatLogDate(log.date)}
                />
              ))
            ) : (
              <Text ff="$body" col="$colorMuted" fos="$3" ta="center" py="$10">
                MoneyMap is quiet. No logs found. Start by logging your first expense.
              </Text>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}

// --- Internal Helper Components ---

const MetricCard = ({ label, value, subtext, progress, isSavings }: any) => (
  <YStack
    f={1}
    p="$4"
    br="$7"
    bg="$card"
    jc="space-between"
    elevation={2}
    shadowOpacity={0.04}
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
        {label}
      </Text>
      <Text
        ff="$heading"
        fos="$6"
        fow="800"
        mt="$1"
        col={isSavings ? "$secondary" : "$color"}
      >
        {value}
      </Text>
    </YStack>
    {progress !== undefined ? (
      <YStack mt="$4" gap="$2">
        <View h={6} w="100%" bg="$primaryLow" br="$full" ov="hidden">
          <View
            h="100%"
            w={`${Math.min(progress, 100)}%`}
            bg="$primary"
            br="$full"
          />
        </View>
        <Text ff="$body" fos={10} fow="600" col="$colorMuted">
          {subtext}
        </Text>
      </YStack>
    ) : (
      <Text ff="$body" fos={10} lh={14} mt="$4" col="$colorMuted" fsi="italic">
        {subtext}
      </Text>
    )}
  </YStack>
);



const TransactionRow = ({
  title,
  category,
  amount,
  Icon,
  iconCol,
  time,
}: any) => (
  <XStack
    jc="space-between"
    ai="center"
    p="$3"
    br="$4"
    bg={"$card"}
    pressStyle={{ scale: 0.98 }}
  >
    <XStack ai="center" gap="$4">
      <Circle size={52} bc="$secondaryForeground" bw={1} boc="$border">
        <Icon size={20} color={iconCol === "$primary" ? "#546354" : iconCol} />
      </Circle>
      <YStack>
        <Text
          ff="$body"
          fow="700"
          fos="$4"
          col="$color"
          textTransform="capitalize"
        >
          {title}
        </Text>
        <XStack ai="center" gap="$2">
          <Text ff="$body" col="$colorMuted" fos="$1" fow="600" >
            • {category?.split("-")[0].charAt(0).toUpperCase() + category?.split("-")[0].slice(1)} • {time}
          </Text>
        </XStack>
      </YStack>
    </XStack>
    <Text ff="$heading" fow="800" fos="$4" col="$color">
      {amount}
    </Text>
  </XStack>
);
