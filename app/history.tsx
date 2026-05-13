import { ArrowLeft, Download } from '@tamagui/lucide-icons-2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Button,
    Spinner,
    Text,
    useTheme,
    XStack,
    YStack
} from 'tamagui';

import { logService } from '@/services/log.service';
import { useAuthStore } from '@/store';
import { router } from 'expo-router';

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.session);

    // --- UI States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'personal' | 'family'
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // --- 1. Data Fetching ---
    const { data: rawLogs = [], isLoading, refetch } = useQuery({
        queryKey: ['logs', 'all', user?.uid],
        queryFn: () => logService.fetchLogs({ categoryType: 'all', timeRange: 'all' }, user?.uid!),
        enabled: !!user?.uid,
    });

    // --- 2. Mutations (Delete) ---
    const deleteMutation = useMutation({
        mutationFn: (id: string) => logService.deleteLog(id),
        onSuccess: () => {
            // Tells React Query to refetch the list so the deleted item disappears
            queryClient.invalidateQueries({ queryKey: ['logs'] });
            setIsDetailOpen(false);
        },
    });

    // --- 3. Data Transformation (Memoized) ---
    const sections = useMemo(() => {
        const filtered = rawLogs.filter((log: any) => {
            const note = (log.note || log.title || '').toLowerCase();
            const matchesSearch = note.includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'all' || log.type === activeFilter;
            return matchesSearch && matchesFilter;
        });

        const groups = filtered.reduce((acc: any, log: any) => {
            const date = log.date?.toDate ? log.date.toDate() : new Date(log.date);
            const dateKey = format(date, 'yyyy-MM-dd');
            if (!acc[dateKey]) acc[dateKey] = { title: date, data: [] };
            acc[dateKey].data.push(log);
            return acc;
        }, {});

        return Object.values(groups).sort((a: any, b: any) => b.title - a.title);
    }, [rawLogs, searchQuery, activeFilter]);

    if (isLoading) {
        return (
            <YStack f={1} jc="center" ai="center" bg="$background">
                <Spinner size="large" color="$primary" />
            </YStack>
        );
    }

    return (
        <YStack f={1} bg="$background" style={{ paddingTop: insets.top + 15 }}>
            {/* Header  */}
            <YStack px="$4" pb="$3" gap="$3" borderBottomWidth={1} boc="$border">
                <XStack jc="space-between" ai="center">
                    <XStack gap={10} ai={'center'} onPress={() => router.back()}>
                        <ArrowLeft size={20} color={theme.primary.get()} />
                        <Text ff="$heading" fos="$5" fow="800">History</Text>
                    </XStack>

                    <Button pressStyle={{
                        opacity: 0.5
                    }} chromeless iconAfter={() => <Download color="white" size={16} />} display='flex' fd={'row'} ai={'center'} gap={'$2'} bg={'$primary'} unstyled px={'$4'} py={'$1.5'} >
                        <Button.Text col={'white'} >
                            Export
                        </Button.Text>
                    </Button>
                </XStack>
            </YStack>


        </YStack>
    );
}
