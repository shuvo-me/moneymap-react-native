import AppTopBar from "@/components/AppTopBar";
import { CategoryDistribution } from "@/components/CategoryDistribution";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import TransactionRow from "@/components/TransactionRow";

import { CURRENCIES } from "@/lib/constants";
import {
  describeArc,
  formatCurrency,
  formatLogDate,
  getIconForCategory,
  getPastelAlphaColor,
  groupLogsByDate,
} from "@/lib/utils";
import { logService } from "@/services/log.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store";
import { ArrowRight, Coins, Wallet } from "@tamagui/lucide-icons-2";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import { Spinner, Text, View, XStack, YStack, styled, useTheme } from "tamagui";

const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: "$background",
  px: "$4",
});

const HearthCard = styled(YStack, {
  br: "$9",
  p: "$4",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
});

export default function HearthDashboard() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.session);
  const [refreshing, setRefreshing] = useState(false);
  const [editLogId, setEditLogId] = useState<string | null>(null);
  const theme = useTheme();
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
    queryKey: ["logs", user?.uid],
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
    mutate: deleteLog,
    isPending: deletePending,
    variables: deletingId,
  } = useMutation({
    mutationKey: ["deleteLogs", user?.uid],
    mutationFn: (logId: string) => logService.deleteLog(logId),
    onSuccess: async () => {
      await refetchLogs();
    },
    onError: (error) => {
      console.error("Delete Error:", error);
      Alert.alert("Error", "Failed to delete transaction.");
    },
  });

  const {
    monthlyBudget,
    utilization,
    savingsRate,
    currencySymbol,
    monthlySpending,
    exceededAmount,
    isOverBudget,
  } = useMemo(() => {
    const budget = settings?.monthlyBudget || 0;
    const spending = logStats?.totalSpending || 0;
    const util = budget > 0 ? (spending / budget) * 100 : 0;

    const currency = settings?.currency || "USD";
    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

    const isOverBudget = logStats?.totalSpending! > budget;
    const exceededAmount = isOverBudget ? logStats?.totalSpending! - budget : 0;

    return {
      monthlyBudget: budget,
      utilization: util,
      savingsRate: Math.max(0, 100 - util),
      currencySymbol: symbol,
      monthlySpending: spending,
      exceededAmount,
      isOverBudget,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await Promise.all([refetchSettings(), refetchLogs()]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRefreshing(false);
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
        {/* Unified Budget Card with Semi-Circular Gauge */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <HearthCard
            mb="$5"
            mt="$5"
            bg={
              isOverBudget
                ? getPastelAlphaColor(theme.error.get())
                : "$primaryLow"
            }
            gap="$2"
          >
            {/* Header row */}
            <XStack jc="space-between" ai="center">
              <Text
                ff="$body"
                fos="$1"
                fow="700"
                col="$primary"
                ls={2}
                opacity={0.7}
              >
                SPENDING THIS MONTH
              </Text>
              <Text
                ff="$heading"
                fos="$5"
                fow="800"
                col={isOverBudget ? theme.error.get() : "$color"}
              >
                {formatCurrency(logStats?.totalSpending || 0, currencySymbol)}
              </Text>
            </XStack>

            {/* Semi-Circular Gauge */}
            <SemiCircularGauge
              progress={Math.min(utilization, 100)}
              isOverBudget={isOverBudget}
              dailyAllowance={formatCurrency(dailyAllowance, currencySymbol)}
              daysLeft={daysLeft}
            />

            {/* Separator */}
            <View
              h={1}
              bg={isOverBudget ? "$error" : "$primary"}
              opacity={0.15}
              mx="$-2"
            />

            {/* Compact Stats Row */}
            <XStack py="$1" px="$2">
              <YStack f={1} ai="center" gap="$1">
                <Text ff="$body" fos={9} col="$colorMuted" tt="uppercase">
                  Budget
                </Text>
                <Text ff="$heading" fos="$3" fow="700" col="$color">
                  {formatCurrency(monthlyBudget, currencySymbol)}
                </Text>
              </YStack>
              <View w={1} bg="$borderColor" />
              <YStack f={1} ai="center" gap="$1">
                <Text ff="$body" fos={9} col="$colorMuted" tt="uppercase">
                  Days Left
                </Text>
                <Text
                  ff="$heading"
                  fos="$3"
                  fow="700"
                  col={isOverBudget ? "$error" : "$color"}
                >
                  {daysLeft.toFixed(0)}
                </Text>
              </YStack>
              <View w={1} bg="$borderColor" />
              <YStack f={1} ai="center" gap="$1">
                <Text ff="$body" fos={9} col="$colorMuted" tt="uppercase">
                  {isOverBudget ? "Over" : "Save"}
                </Text>
                <Text
                  ff="$heading"
                  fos="$3"
                  fow="700"
                  col={isOverBudget ? "$error" : "$primary"}
                >
                  {isOverBudget
                    ? formatCurrency(exceededAmount, currencySymbol)
                    : `${savingsRate.toFixed(0)}%`}
                </Text>
              </YStack>
            </XStack>
          </HearthCard>
        </Animated.View>

        <CategoryDistribution
          logs={logStats?.all || []}
          monthlyBudget={monthlyBudget}
          currencySymbol={currencySymbol}
        />

        {/* Recent Activity */}
        <YStack mt="$5" gap="$3">
          <XStack jc="space-between" ai="center">
            <Text ff="$heading" fos="$4" fow="800" col="$color">
              Recent Activity
            </Text>
            <XStack
              ai="center"
              gap="$2"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => router.push("/history")}
            >
              <Text col="$primary" fow="700" fos="$3" ff="$body">
                View All
              </Text>
              <ArrowRight size={16} color="$primary" />
            </XStack>
          </XStack>

          {logStats?.recent && logStats.recent.length > 0 ? (
            <YStack gap="$4">
              {groupLogsByDate(logStats.recent).map(([dateLabel, logs]) => (
                <YStack key={dateLabel} gap="$2">
                  <Text
                    ff="$body"
                    fos="$1"
                    fow="600"
                    col="$colorMuted"
                    ls={1}
                    tt="uppercase"
                    ml="$1"
                  >
                    {dateLabel}
                  </Text>
                  <YStack gap="$2">
                    {logs.map((log: any) => (
                      <TransactionRow
                        key={log.id}
                        title={log.title || ""}
                        category={log.category}
                        amount={`-${formatCurrency(log.amount, currencySymbol)}`}
                        Icon={getIconForCategory(log.category)}
                        time={formatLogDate(log.date)}
                        loading={deletePending && deletingId === log.id}
                        onDelete={() => {
                          console.log("delete", log.id);
                          deleteLog(log.id);
                        }}
                        onPress={() => setEditLogId(log.id)}
                      />
                    ))}
                  </YStack>
                </YStack>
              ))}
            </YStack>
          ) : (
            <YStack
              ai="center"
              gap="$3"
              py="$8"
              px="$6"
              bg="$card"
              br="$7"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <View
                w={56}
                h={56}
                br="$full"
                bg="$primaryLow"
                ai="center"
                jc="center"
              >
                <Wallet size={28} color="$primary" />
              </View>
              <YStack ai="center" gap="$1">
                <Text ff="$heading" fos="$3" fow="700" col="$color">
                  No transactions yet
                </Text>
                <Text ff="$body" fos="$2" col="$colorMuted" ta="center">
                  Tap the + button below to log your first expense and start
                  tracking.
                </Text>
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <QuickLogSheet
        open={!!editLogId}
        onOpenChange={(val) => {
          if (!val) setEditLogId(null);
        }}
        editMode={true}
        logId={editLogId}
      />
    </ScreenContainer>
  );
}

// --- Internal Helper Components ---

const SemiCircularGauge = ({
  progress,
  isOverBudget,
  dailyAllowance,
  daysLeft,
}: {
  progress: number;
  isOverBudget: boolean;
  dailyAllowance: string;
  daysLeft: number;
}) => {
  const theme = useTheme();
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc from 180° (left) to 0° (right) — top half circle
  const startAngle = Math.PI;
  const sweepAngle = (progress / 100) * Math.PI;
  const endAngle = startAngle - sweepAngle;

  const bgArcPath = describeArc(cx, cy, radius, Math.PI, 0);
  const progressArcPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const arcColor = isOverBudget ? theme.error.get() : theme.primary.get();

  return (
    <YStack
      ai="center"
      jc="center"
      h={size / 2 + strokeWidth + 28}
      overflow="visible"
    >
      <Svg width={size} height={size / 2 + strokeWidth + 4}>
        {/* Background arc */}
        <Path
          d={bgArcPath}
          stroke={isOverBudget ? "#aa371c33" : theme.secondaryForeground.get()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        {progress > 0 && (
          <Path
            d={progressArcPath}
            stroke={arcColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      {/* Center stats overlay */}
      <YStack position="absolute" ai="center" top={size / 5}>
        <Text ff="$heading" fos="$7" fow="800" col="$color">
          {Math.round(progress)}%
        </Text>

        <Text ff="$body" fos="$1" col="$colorMuted">
          used
        </Text>

        <XStack ai="center" gap="$1.5" mt="$1">
          <Coins size={12} color="$primary" />
          <Text ff="$body" fos="$2" fow="600" col="$color">
            {dailyAllowance}/day
          </Text>
        </XStack>
        {/* <Text ff="$body" fos="$1" col="$colorMuted" mt="$0.5">
          {daysLeft} days left
        </Text> */}
      </YStack>
    </YStack>
  );
};
