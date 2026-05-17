import CategoryFilterTabs from '@/components/CategoryFilterTabs';
import ExpandableCalender from '@/components/ExpandableCalender';
import TransactionRow from '@/components/TransactionRow';
import queryClient from '@/config/queryClient';
import { formatCurrency, formatLogDate, getIconForCategory } from '@/lib/utils';
import { ExpenseLog, logService } from '@/services/log.service';
import { useAuthStore } from '@/store';
import { ArrowLeft, DownloadCloud } from '@tamagui/lucide-icons-2';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, Text, useTheme, XStack, YStack } from 'tamagui';

export default function HistoryAnalysisScreen() {
    const inset = useSafeAreaInsets();
    const theme = useTheme();
    const user = useAuthStore((state) => state.session);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const userSettings = queryClient.getQueryData<any>(['userSettings', user?.uid]);
    const firstDayOfWeek = userSettings?.startOfWeek || 0;
    const [selectedCategory, setSelectedCategory] = useState<string>('all');


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
                totalSpending: total
            };
        },
    });

    return (
        <YStack f={1} bg="$background" pt={inset.top + 20}>
            {/* --- Header --- */}
            <XStack ai="center" gap="$3" jc={'space-between'} px={'$4'}>
                <XStack ai={'center'} gap={2} onPress={() => router.back()}>
                    <ArrowLeft size={20} color={theme.primary.get()} />
                    <Text ff="$heading" fos="$6" fow="800" col="$primary">History</Text>
                </XStack>
                <Button
                    iconAfter={DownloadCloud}
                    size="$3"
                    bg="$primaryLow"
                    pressStyle={{ scale: 0.95 }}
                >Export</Button>

            </XStack>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>

                {/* --- 2.  Calendar --- */}
                <YStack px="$4">
                    <ExpandableCalender
                        selectedDate={selectedDate}
                        onDateChanged={setSelectedDate}
                        firstDayOfWeek={firstDayOfWeek} />
                </YStack>






                {/* --- 5. Transaction List --- */}
                <YStack px="$4" gap="$4" mt={'$4'}>
                    <CategoryFilterTabs
                        selectedCategoryId={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />


                    {logStats?.all?.length === 0 ? (
                        <YStack h={200} jc="center" ai="center">
                            <Text ff="$body" col="$on-surface-variant" fos={14}>
                                No logs found!
                            </Text>
                        </YStack>
                    ) : (isRefetching || logsLoading) ? (
                        <YStack h={200} jc="center" ai="center">
                            <Spinner size={'small'} color={theme.primary.get()} />
                        </YStack>
                    ) : (
                        <YStack gap="$3">
                            {logStats?.all?.map((log: ExpenseLog) => (
                                <TransactionRow
                                    key={log.id}
                                    title={log.title}
                                    category={log.category}
                                    amount={`-${formatCurrency(log.amount, user?.currency || '$')}`}
                                    Icon={getIconForCategory(log.category)}
                                    iconCol="$primary"
                                    time={formatLogDate(log.date)}
                                />
                            ))}
                        </YStack>
                    )}


                </YStack>
            </ScrollView>
        </YStack>
    );
}