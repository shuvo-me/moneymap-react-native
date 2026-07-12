import CategoryFilterTabs from "@/components/CategoryFilterTabs";
import ExpandableCalender from "@/components/ExpandableCalender";
import { QuickLogSheet } from "@/components/QuickLogSheet";
import TransactionRow from "@/components/TransactionRow";
import queryClient from "@/config/queryClient";
import { formatCurrency, formatLogDate, getIconForCategory } from "@/lib/utils";
import { ExpenseLog, logService } from "@/services/log.service";
import { useAuthStore } from "@/store";
import {
  ArrowLeft,
  DownloadCloud,
  Inbox,
  RefreshCcw,
} from "@tamagui/lucide-icons-2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Spinner, Text, useTheme, XStack, YStack } from "tamagui";

export default function HistoryAnalysisScreen() {
  const inset = useSafeAreaInsets();
  const theme = useTheme();
  const user = useAuthStore((state) => state.session);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const userSettings = queryClient.getQueryData<any>([
    "userSettings",
    user?.uid,
  ]);
  const firstDayOfWeek = userSettings?.startOfWeek || 0;
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [editLogId, setEditLogId] = useState<string | null>(null);

  const {
    data: logStats,
    refetch: refetchLogs,
    isLoading: logsLoading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["logs", user?.uid, selectedDate, selectedCategory],
    queryFn: () =>
      logService.fetchLogs(
        { categoryType: selectedCategory, timeRange: "day" },
        user?.uid as string,
        selectedDate,
      ),
    enabled: !!user?.uid,
    select: (logs) => {
      const total = logs.reduce((sum, log) => sum + (log.amount || 0), 0);
      return {
        all: logs,
        totalSpending: total,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logs", user?.uid, selectedDate, selectedCategory],
      });
    },
    onError: (error) => {
      console.error("Delete Error:", error);
      Alert.alert("Error", "Failed to delete transaction.");
    },
  });

  // Export handler
  const handleExport = async () => {
    if (!logStats?.all || logStats.all.length === 0) {
      Alert.alert("No Data", "There are no transactions to export.");
      return;
    }

    try {
      setExporting(true);
      await logService.exportToCSV(logStats.all, "My_Expense_Report");
    } catch (error) {
      console.error("Export Error:", error);
      Alert.alert(
        "Export Failed",
        "Could not export transactions. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <YStack f={1} bg="$background" pt={inset.top + 20}>
      {/* --- Header --- */}
      <XStack ai="center" gap="$3" jc={"space-between"} px={"$4"}>
        <XStack ai={"center"} gap={2} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.primary.get()} />
          <Text ff="$heading" fos="$6" fow="800" col="$primary">
            History
          </Text>
        </XStack>
        <Button
          size="$3"
          bg="$primaryLow"
          pressStyle={{ scale: 0.95 }}
          onPress={handleExport}
          disabled={isRefetching || exporting}
          iconAfter={
            exporting ? (
              <Spinner size={"small"} color={theme.primary.get()} />
            ) : (
              <DownloadCloud />
            )
          }
        >
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </XStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetchLogs} />
        }
      >
        {/* --- 2.  Calendar --- */}
        <YStack px="$4">
          <ExpandableCalender
            selectedDate={selectedDate}
            onDateChanged={setSelectedDate}
            firstDayOfWeek={firstDayOfWeek}
          />
        </YStack>

        {/* --- 5. Transaction List --- */}
        <YStack px="$4" gap="$4" mt={"$4"}>
          <CategoryFilterTabs
            selectedCategoryId={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {error ? (
            <YStack h={200} jc="center" ai="center">
              <Text col="$error" fos={14}>
                Unable to load transactions. Please try again.
              </Text>
              <Button
                mt="$3"
                onPress={() => refetchLogs()}
                variant="outlined"
                borderColor={theme.primary.get()}
                iconAfter={<RefreshCcw />}
              >
                Retry
              </Button>
            </YStack>
          ) : logStats?.all?.length === 0 ? (
            <YStack
              jc="center"
              ai="center"
              gap="$2"
              py="$8"
              px="$4"
              bg="$secondaryForeground"
              br="$7"
              bw={1}
              boc="$border"
            >
              <Inbox size={32} color="$colorMuted" opacity={0.6} mb="$1" />
              <Text ff="$body" col="$colorMuted" fos="$2" fow="500" ta="center">
                No transactions recorded for this period.
              </Text>
            </YStack>
          ) : isRefetching || logsLoading ? (
            <YStack h={200} jc="center" ai="center">
              <Spinner size={"small"} color={theme.primary.get()} />
            </YStack>
          ) : (
            <YStack gap="$3">
              {logStats?.all?.map((log: ExpenseLog) => (
                <TransactionRow
                  key={log.id}
                  title={log.title}
                  category={log.category}
                  amount={`-${formatCurrency(log.amount, user?.currency || "$")}`}
                  Icon={getIconForCategory(log.category)}
                  time={formatLogDate(log.date)}
                  loading={deletePending && deletingId === log.id}
                  onDelete={() => {
                    deleteLog(log.id);
                  }}
                  onPress={() => setEditLogId(log.id)}
                />
              ))}
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
    </YStack>
  );
}
