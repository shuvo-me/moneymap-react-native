import ExpandableCalender from '@/components/ExpandableCalender';
import queryClient from '@/config/queryClient';
import { useAuthStore } from '@/store';
import { ArrowLeft, Download, DownloadCloud, Gamepad2, ShoppingBasket } from '@tamagui/lucide-icons-2';
import { addDays, eachDayOfInterval, format, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Circle, Text, useTheme, View, XStack, YStack } from 'tamagui';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HistoryAnalysisScreen() {
    const inset = useSafeAreaInsets();
    const theme = useTheme();
    const user = useAuthStore((state) => state.session);

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const userSettings = queryClient.getQueryData<any>(['userSettings', user?.uid]);
    const firstDayOfWeek = userSettings?.startOfWeek || 0;

    console.log({ userSettings })
    const chartData = useMemo(() => {
        const current = new Date(selectedDate);

        const days = eachDayOfInterval({
            start: subDays(current, 3),
            end: addDays(current, 3),
        });

        return days.map((day) => ({
            date: format(day, 'yyyy-MM-dd'),
            value: Math.floor(Math.random() * 5000),
        }));
    }, [selectedDate]);

    const peakValue = Math.max(...chartData.map((d) => d.value));

    return (
        <YStack f={1} bg="$background" pt={inset.top + 20}>
            {/* --- Header --- */}
            <XStack ai="center" gap="$3" jc={'space-between'} px={'$4'}>
                <XStack ai={'center'} gap={2}>
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



                {/* --- 3. Spending Trends & Manual Bar Chart --- */}
                <YStack px="$6" mb="$8" mt={'$6'}>
                    <YStack mb="$6">
                        <Text tt="uppercase" fos={10} fow="800" ls={1.5} col="$on-surface-variant">Spending Trends</Text>
                        <XStack ai="baseline" gap="$2">
                            <Text ff="$body" fos="$6" fow="800" col="$on-surface">$3,428.50</Text>
                            <Text col="$secondary" fos="$3" fow="700">+12% vs last month</Text>
                        </XStack>
                    </YStack>

                    {/* The Swapped Manual Bar Chart */}
                    <YStack bg={'$secondaryForeground'} padding={'$4'} borderRadius={'$4'}>
                        <XStack h={180} ai="flex-end" jc="space-between" gap={'$2'} px="$2" >
                            {chartData.map((item, index) => {
                                const isPeak = item.value === peakValue;
                                const isSelected = item.date === selectedDate;
                                const barHeight = (item.value / peakValue) * 100;

                                return (
                                    <YStack key={index} f={1} ai="center" pos="relative">
                                        {isPeak && (
                                            <View
                                                pos="absolute"
                                                top={-30}
                                                bg="$primary"
                                                px="$2"
                                                py="$1"
                                                br="$2"
                                                zi={10}
                                            >
                                                <Text col="$secondaryForeground" fos={8} fow="900">PEAK</Text>
                                            </View>
                                        )}
                                        <View
                                            w="100%"
                                            h={`${barHeight}%`}
                                            br="$2"
                                            bg={isSelected ? '$primary' : isPeak ? '$primary' : '$primaryLow'}
                                            o={isSelected || isPeak ? 1 : 0.4}
                                        />
                                    </YStack>
                                );
                            })}
                        </XStack>
                    </YStack>
                </YStack>

                {/* --- 4. Filters --- */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12, marginBottom: 32 }}>
                    <Button br="$full" icon={<Download size={14} color="white" />} bg="$primary" >
                        Last 30 Days
                    </Button>
                    <Button br="$full" bg="$surface-container-high"  >Category</Button>
                    <Button br="$full" bg="$surface-container-high"  >Family Ledger</Button>
                </ScrollView>

                {/* --- 5. Transaction List --- */}
                <YStack px="$6" gap="$4">
                    <Text tt="uppercase" fos={10} fow="800" ls={2} col="$on-surface-variant">Today, Oct 24</Text>

                    <TransactionCard
                        title="Whole Foods Market"
                        category="Groceries"
                        amount="-142.30"
                        tag="Family"
                        status="Pending"
                        icon={ShoppingBasket}
                    />

                    <TransactionCard
                        title="Steam Games"
                        category="Hobbies"
                        amount="-59.99"
                        tag="Personal"
                        status="Flagged"
                        icon={Gamepad2}
                    />
                </YStack>
            </ScrollView>
        </YStack>
    );
}

// --- Card Component ---
const TransactionCard = ({ title, category, amount, tag, status, icon: Icon }: any) => (
    <XStack jc="space-between" ai="center" p="$4" bg="$surface-container-lowest" br="$6" bw={1} boc="$outline-variant" o={0.1} shadowColor="$black" shadowOpacity={0.02} shadowRadius={10}>
        <XStack ai="center" gap="$4">
            <Circle size={48} bg="$surface-container" bw={1} boc="$outline-variant">
                <Icon size={20} color="#546354" />
            </Circle>
            <YStack>
                <Text fow="800" fos="$4" col="$on-surface">{title}</Text>
                <XStack ai="center" gap="$2" mt="$1">
                    <View bg="$primary-container" px="$1.5" py="$0.5" br="$2">
                        <Text fos={9} fow="900" col="$on-primary-container" tt="uppercase">{tag}</Text>
                    </View>
                    <Text fos={10} fow="600" col="$on-surface-variant" tt="uppercase" ls={0.5}>{category}</Text>
                </XStack>
            </YStack>
        </XStack>
        <YStack ai="flex-end" gap="$1">
            <Text fow="800" fos="$4" col="$on-surface">${amount}</Text>
            {status === 'Pending' && (
                <View bg="$tertiary-container" px="$2" py="$0.5" br="$full">
                    <Text fos={9} fow="800" col="$on-tertiary-container">PENDING</Text>
                </View>
            )}
        </YStack>
    </XStack>
);