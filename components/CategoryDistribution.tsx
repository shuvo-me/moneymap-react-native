import { Circle, Svg } from 'react-native-svg';
import { Text, useTheme, View, XStack, YStack } from 'tamagui';

export const CategoryDistribution = () => {
    // SVG Math: Circumference = 2 * π * r
    // For r=48, C ≈ 301.59
    const circumference = 301.59;

    const tamaguiTheme = useTheme();

    return (
        <YStack bg="$card" br="$7" p="$5" shadowColor="$foreground" shadowOpacity={0.02} shadowRadius={20}>
            <Text ff="$heading" fos="$3" fow="800" col="$color" mb="$6">
                Category Distribution
            </Text>

            <XStack ai="center" gap="$8">
                {/* Donut Chart Container */}
                <View w={112} h={112} ai="center" jc="center" pos="relative">
                    <Svg width="112" height="112" style={{ transform: [{ rotate: '-90deg' }] }}>
                        {/* Background Track */}
                        <Circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={tamaguiTheme.primaryLow.get()} // Using your sage low-opacity token
                            strokeWidth="12"
                            fill="transparent"
                        />
                        {/* Housing Ring (45%) */}
                        <Circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={tamaguiTheme.primary.get()}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - 0.45)}
                            strokeLinecap="round"
                        />
                        {/* Food Ring (25%) */}
                        <Circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={tamaguiTheme.secondary.get()}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - 0.25)}
                            transform="rotate(162, 56, 56)" // Starts after Housing (360 * 0.45)
                            strokeLinecap="round"
                        />
                    </Svg>

                    {/* Center Label */}
                    <YStack pos="absolute" ai="center" jc="center">
                        <Text ff="$body" fos="$1" fow="800" col="$color">May</Text>
                    </YStack>
                </View>

                {/* Legend */}
                <YStack f={1} gap="$3">
                    <LegendItem label="Housing" percentage="45%" color="$primary" />
                    <LegendItem label="Food & Dining" percentage="25%" color="$secondary" />
                    <LegendItem label="Entertainment" percentage="15%" color="$colorMuted" />
                    <LegendItem label="Utilities" percentage="15%" color="$borderColor" />
                </YStack>
            </XStack>
        </YStack>
    );
};

// --- Helper Component ---

const LegendItem = ({ label, percentage, color }: { label: string; percentage: string; color: any }) => (
    <XStack jc="space-between" ai="center">
        <XStack ai="center" gap="$2">
            <View w={8} h={8} br="$full" bg={color} />
            <Text ff="$body" fos={11} fow="600" col="$colorMuted">
                {label}
            </Text>
        </XStack>
        <Text ff="$body" fos={11} fow="700" col="$color">
            {percentage}
        </Text>
    </XStack>
);