import { Circle, Svg } from 'react-native-svg';
import { Text, useTheme, View, XStack, YStack } from 'tamagui';
import { ExpenseLog } from '@/services/log.service';

interface CategoryDistributionProps {
  logs?: ExpenseLog[];
}

export const CategoryDistribution = ({ logs = [] }: CategoryDistributionProps) => {
    const circumference = 301.59;
    const tamaguiTheme = useTheme();

    const categoryTotals = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
    const categories = Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      amount,
    }));

    const topCategories = categories.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
    const labels = ['Housing', 'Food and Dining', 'Entertainment', 'Utilities'];
    const legendColors = ['$primary', '$secondary', '$colorMuted', '$borderColor'];
    
    const categoryColors = [
      tamaguiTheme.primary.get(),
      tamaguiTheme.secondary.get(),
      tamaguiTheme.colorMuted.get(),
      tamaguiTheme.borderColor.get(),
    ];
    
    let accumulatedOffset = 0;

    return (
        <YStack bg="$card" br="$7" p="$5" shadowColor="$foreground" shadowOpacity={0.02} shadowRadius={20}>
            <Text ff="$heading" fos="$3" fow="800" col="$color" mb="$6">
                Category Distribution
            </Text>

            <XStack ai="center" gap="$8">
                <View w={112} h={112} ai="center" jc="center" pos="relative">
                    <Svg width="112" height="112" style={{ transform: [{ rotate: '-90deg' }] }}>
                        <Circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={tamaguiTheme.primaryLow.get()}
                            strokeWidth="12"
                            fill="transparent"
                        />
                        {topCategories.length > 0 ? (
                          topCategories.map((cat, index) => {
                            const offset = accumulatedOffset;
                            accumulatedOffset += cat.percentage / 100;
                            return (
                              <Circle
                                key={cat.name}
                                cx="56"
                                cy="56"
                                r="48"
                                stroke={categoryColors[index] || categoryColors[0]}
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * (1 - cat.percentage / 100)}
                                transform={`rotate(${offset * 360}, 56, 56)`}
                                strokeLinecap="round"
                              />
                            );
                          })
                        ) : (
                          <Circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke={tamaguiTheme.primary.get()}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference}
                          />
                        )}
                    </Svg>

                    <YStack pos="absolute" ai="center" jc="center">
                        <Text ff="$body" fos="$1" fow="800" col="$color">
                          {new Date().toLocaleString('default', { month: 'short' })}
                        </Text>
                    </YStack>
                </View>

                <YStack f={1} gap="$3">
                    {topCategories.length > 0 ? (
                      topCategories.map((cat, index) => (
                        <LegendItem 
                          key={cat.name} 
                          label={labels[index] || cat.name} 
                          percentage={`${cat.percentage.toFixed(0)}%`} 
                          color={legendColors[index]} 
                        />
                      ))
                    ) : (
                      <>
                        <LegendItem label="Housing" percentage="0%" color="$primary" />
                        <LegendItem label="Food and Dining" percentage="0%" color="$secondary" />
                        <LegendItem label="Entertainment" percentage="0%" color="$colorMuted" />
                        <LegendItem label="Utilities" percentage="0%" color="$borderColor" />
                      </>
                    )}
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