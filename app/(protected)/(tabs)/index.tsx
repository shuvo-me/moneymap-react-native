import AppTopBar from "@/components/AppTopBar";
import { CategoryDistribution } from "@/components/CategoryDistribution";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import TransactionRow from "@/components/TransactionRow";
import { CURRENCIES } from "@/lib/constants";
import {
  formatCurrency,
  formatLogDate,
  getIconForCategory,
  getPastelAlphaColor,
} from "@/lib/utils";
import { logService } from "@/services/log.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store";
import {
  AlertTriangle,
  ArrowRight,
  Coins,
  Inbox,
} from "@tamagui/lucide-icons-2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, RefreshControl } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spinner, Text, View, XStack, YStack, styled, useTheme } from "tamagui";

const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: "$background",
  px: "$4",
});

const HearthCard = styled(YStack, {
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
    setRefreshing(true);
    await Promise.all([refetchSettings(), refetchLogs()]);
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
        {/* Main Spending Card */}
        <HearthCard
          mb="$5"
          mt={"$5"}
          bg={
            isOverBudget
              ? getPastelAlphaColor(theme.error.get())
              : "$primaryLow"
          }
        >
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
            <Text
              ff="$heading"
              fos="$8"
              fow="800"
              col={isOverBudget ? theme.error.get() : "$primary"}
            >
              {formatCurrency(logStats?.totalSpending || 0, currencySymbol)}
            </Text>
          </XStack>

          <YStack mt="$2" gap="$1">
            <XStack ai="center" gap="$2">
              <View p="$1.5" br="$full" bg="$primaryForeground">
                <Coins size={14} color="$primary" />
              </View>
              <Text ff="$body" fos="$2" fow="600" col="$primary">
                {formatCurrency(dailyAllowance, currencySymbol)} / day left
              </Text>
            </XStack>
            <Text
              ff="$body"
              fos="$1"
              // CHANGE: Switch color to red to match the warning theme context if budget is blown
              col={isOverBudget ? "$red10" : "$primary"}
              opacity={0.8}
              ml="$7"
            >
              {isOverBudget
                ? `Exceeded your ${formatCurrency(monthlyBudget, currencySymbol)} monthly limit!`
                : `To stay within your ${formatCurrency(monthlyBudget, currencySymbol)} budget`}
            </Text>
          </YStack>
        </HearthCard>

        {/* Budget & Savings Info */}
        <XStack gap="$4" mb={"$5"}>
          <MetricCard
            label="Monthly Budget"
            value={formatCurrency(monthlyBudget, currencySymbol)}
            subtext={`${utilization.toFixed(1)}% utilized`}
            progress={utilization}
          />
          <MetricCard
            label={isOverBudget ? "Over Budget" : "Savings Rate"}
            value={
              isOverBudget
                ? `-${formatCurrency(exceededAmount, currencySymbol)}`
                : `${savingsRate.toFixed(1)}%`
            }
            subtext={
              isOverBudget
                ? '"Lower your expenses."'
                : '"Steady growth is freedom."'
            }
            isSavings={!isOverBudget}
            isDanger={isOverBudget}
            Icon={isOverBudget ? AlertTriangle : Coins}
          />
        </XStack>

        <CategoryDistribution
          logs={logStats?.all || []}
          monthlyBudget={monthlyBudget}
        />

        {/* Recent Activity */}
        <YStack mt={"$5"} gap={"$3"}>
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

          <YStack gap="$3">
            {logStats?.recent && logStats.recent.length > 0 ? (
              logStats.recent.map((log: any) => (
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
              ))
            ) : (
              <YStack
                jc="center"
                ai="center"
                gap="$2"
                py="$6"
                px="$4"
                bg="$secondaryForeground"
                br="$7"
                bw={1}
                boc="$border"
              >
                <Inbox size={32} color="$colorMuted" opacity={0.6} mb="$1" />
                <Text
                  ff="$body"
                  col="$colorMuted"
                  fos="$2"
                  fow="500"
                  ta="center"
                >
                  No transactions recorded yet. Log your first expense to begin
                  tracking.
                </Text>
              </YStack>
            )}
          </YStack>
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

const MetricCard = ({
  label,
  value,
  subtext,
  progress,
  isSavings,
  isDanger,
  Icon,
}: any) => (
  <YStack f={1} p="$4" br="$7" bg="$secondaryForeground" jc="space-between">
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
        col={isDanger ? "$error" : "$color"}
      >
        {value}
      </Text>
    </YStack>

    <YStack mt="$4" gap="$2">
      {progress !== undefined && (
        <View h={6} w="100%" bg="$primaryLow" br="$full" ov="hidden">
          <View
            h="100%"
            w={`${Math.min(progress, 100)}%`}
            bg="$primary"
            br="$full"
          />
        </View>
      )}
      {Icon && <Icon size={16} color={isSavings ? "$success" : "$error"} />}
      {subtext && (
        <Text
          ff="$body"
          fos={10}
          lh={14}
          mt="$1"
          col="$colorMuted"
          fsi="italic"
        >
          {subtext}
        </Text>
      )}
    </YStack>
  </YStack>
);
