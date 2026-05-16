import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2';
import {
    addMonths,
    addWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    parseISO,
    startOfMonth,
    startOfWeek
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { Button, Circle, Text, View, XStack, YStack } from 'tamagui';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 1. Declare Clear, Customizable Props Interface
interface CustomCalendarProps {
    selectedDate: string;                            // Format: 'YYYY-MM-DD'
    onDateChanged: (date: string) => void;
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;       // 0 = Sun, 1 = Mon

    // Customization & Theme Props
    accentColor?: string;                            // Default selection circle background
    selectedTextColor?: string;                      // Text color for selected day
    headerMonthFontFamily?: string;                  // e.g., '$body' or 'Manrope'
    dayFontFamily?: string;                          // e.g., '$body' or 'Plus Jakarta Sans'
    showKnob?: boolean;                              // Toggle expansion capability completely
    initialExpanded?: boolean;                       // Starts in Month View vs Week View
}

const ExpandableCalender: React.FC<CustomCalendarProps> = ({
    selectedDate,
    onDateChanged,
    firstDayOfWeek = 0,
    accentColor = '#546354',                         // Your clean Hearth green theme tint
    selectedTextColor = '#ffffff',
    headerMonthFontFamily = '$body',
    dayFontFamily = '$body',
    showKnob = true,
    initialExpanded = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const currentSelected = useMemo(() => parseISO(selectedDate), [selectedDate]);

    // The pivot date tracks what timeline window the grid frame is viewing
    const [pivotDate, setPivotDate] = useState<Date>(currentSelected);

    // 2. Generate Weekday Headings Swapped to match system rules
    const weekdayLabels = useMemo(() => {
        const baseLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return [
            ...baseLabels.slice(firstDayOfWeek),
            ...baseLabels.slice(0, firstDayOfWeek),
        ];
    }, [firstDayOfWeek]);

    // 3. Grid Generation Core Logic
    const daysGrid = useMemo(() => {
        if (isExpanded) {
            // Full Month View Layout Matrix 
            const monthStart = startOfMonth(pivotDate);
            const monthEnd = endOfMonth(monthStart);
            const gridStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek });
            const gridEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });

            return eachDayOfInterval({ start: gridStart, end: gridEnd });
        } else {
            // Collapsed 7-Day Line Horizon View (Week View)
            const weekStart = startOfWeek(pivotDate, { weekStartsOn: firstDayOfWeek });
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: firstDayOfWeek });

            return eachDayOfInterval({ start: weekStart, end: weekEnd });
        }
    }, [pivotDate, isExpanded, firstDayOfWeek]);

    // Handle Carousel Skipping Math
    const handlePrev = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPivotDate((prev) => (isExpanded ? addMonths(prev, -1) : addWeeks(prev, -1)));
    };

    const handleNext = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPivotDate((prev) => (isExpanded ? addMonths(prev, 1) : addWeeks(prev, 1)));
    };

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    // Group linear collection block items into 7-day layout vectors
    const gridRows = useMemo(() => {
        const rows: Date[][] = [];
        for (let i = 0; i < daysGrid.length; i += 7) {
            rows.push(daysGrid.slice(i, i + 7));
        }
        return rows;
    }, [daysGrid]);

    return (
        <YStack
            width="100%"
            backgroundColor="$card"
            borderRadius={16}
            borderWidth={1}
            borderColor="$borderColor"
            padding="$3"
            gap="$2"
        >
            {/* BRAND HEADER LINE (Month, Year & Pagination Controls) */}
            <XStack ai="center" jc="space-between" paddingHorizontal="$2" paddingVertical="$1">
                <XStack ai="baseline" gap="$2">
                    <Text ff={headerMonthFontFamily} fos="$5" fow="800" col="$primary">
                        {format(pivotDate, 'MMMM')}
                    </Text>
                    <Text ff={headerMonthFontFamily} fos="$3" fow="500" col="$colorMuted">
                        {format(pivotDate, 'yyyy')}
                    </Text>
                </XStack>

                <XStack gap="$2">
                    <Button
                        circular
                        chromeless
                        size="$2"
                        icon={<ChevronLeft size={18} color="#5e5f5c" />}
                        onPress={handlePrev}
                        pressStyle={{ opacity: 0.5 }}
                    />
                    <Button
                        circular
                        chromeless
                        size="$2"
                        icon={<ChevronRight size={18} color="#5e5f5c" />}
                        onPress={handleNext}
                        pressStyle={{ opacity: 0.5 }}
                    />
                </XStack>
            </XStack>

            {/* WEEK TITLES COMPONENT ROW */}
            <XStack jc="space-around" marginTop="$2" marginBottom="$1">
                {weekdayLabels.map((day) => (
                    <View key={day} flex={1} ai="center">
                        <Text ff={dayFontFamily} fos={11} fow="700" col="$primary" ls={0.5} opacity={0.7}>
                            {day}
                        </Text>
                    </View>
                ))}
            </XStack>

            {/* DATES LAYOUT GRID CONTAINER */}
            <YStack gap="$1">
                {gridRows.map((row, rowIndex) => (
                    <XStack key={`row-${rowIndex}`} jc="space-around">
                        {row.map((day) => {
                            const isSelected = isSameDay(day, currentSelected);
                            const isCurrentMonth = isSameMonth(day, pivotDate);
                            const formattedString = format(day, 'yyyy-MM-dd');

                            return (
                                <View key={day.toISOString()} flex={1} ai="center" paddingVertical="$1">
                                    <Button
                                        size="$2"
                                        width={38}
                                        height={38}
                                        borderRadius={12}
                                        padding={0}
                                        unstyled
                                        ai="center"
                                        jc="center"
                                        backgroundColor={isSelected ? accentColor : 'transparent'}
                                        onPress={() => {
                                            onDateChanged(formattedString);
                                            // Auto track pivot viewing windows inside line frame shifts
                                            if (!isExpanded) setPivotDate(day);
                                        }}
                                        pressStyle={{ scale: 0.95, opacity: 0.8 }}
                                    >
                                        <Text
                                            ff={dayFontFamily}
                                            fos="$3"
                                            fow={isSelected ? '800' : '600'}
                                            color={
                                                isSelected
                                                    ? selectedTextColor
                                                    : isCurrentMonth
                                                        ? '$color'
                                                        : '$colorDisabled'
                                            }
                                            opacity={!isSelected && !isCurrentMonth ? 0.3 : 1}
                                        >
                                            {format(day, 'd')}
                                        </Text>
                                        {isSelected && <Circle size={4} bg={isSelected ? selectedTextColor : '$color'} />}

                                    </Button>
                                </View>
                            );
                        })}
                    </XStack>
                ))}
            </YStack>

            {/* TOGGLE EXPANSION INTERACTION KNOB */}
            {showKnob && (
                <XStack jc="center" ai="center" width="100%" borderTopWidth={0.2} borderTopColor={'$borderColor'} pt={'$2'}>
                    <Button
                        chromeless
                        size="$1"
                        onPress={toggleExpand}
                        pressStyle={{ opacity: 0.5 }}
                        height={40}
                    >
                        <YStack jc="center" ai="center" gap={'$1'}>
                            <XStack h={5} w={50} borderRadius={50} bg={'$borderColor'} />
                            <Button.Text col={'$primaryForground'} opacity={0.5} ff={'$body'} fos={'$1'} fow={'600'}>{isExpanded ? 'Collapse' : 'Expand'} Month</Button.Text>
                        </YStack>
                    </Button>

                </XStack>
            )}
        </YStack>
    );
};

export default ExpandableCalender;