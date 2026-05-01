import { ALL_CATEGORIES } from '@/lib/constants'; // Import your category metadata
import { ExpenseLog } from '@/services/log.service';
import { Circle, Svg } from 'react-native-svg';
import { Text, useTheme, View, XStack, YStack } from 'tamagui';

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

  const actualCategories = Object.entries(categoryTotals).map(([id, amount]) => {
    const metadata = ALL_CATEGORIES.find(c => c.id === id);
    return {
      id,
      label: metadata?.label || id.charAt(0).toUpperCase() + id.slice(1),
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      amount,
      themeColor: metadata?.chartColor,
      hexColor: metadata?.chartColor,
      isPlaceholder: false
    };
  }).sort((a, b) => b.percentage - a.percentage);

  let topCategories = [...actualCategories.slice(0, 4)];

  if (topCategories.length < 4) {

    const usedIds = topCategories.map(c => c.id);
    const placeholders = ALL_CATEGORIES
      .filter(c => !usedIds.includes(c.id))
      .slice(0, 4 - topCategories.length)
      .map(c => ({
        id: c.id,
        label: c.label,
        percentage: 0,
        amount: 0,
        themeColor: c.chartColor,
        hexColor: c.chartColor,
        isPlaceholder: true
      }));

    topCategories = [...topCategories, ...placeholders];
  }

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
            {topCategories.map((cat) => {
              const offset = accumulatedOffset;
              accumulatedOffset += cat.percentage / 100;
              return (
                <Circle
                  key={cat.id}
                  cx="56"
                  cy="56"
                  r="48"
                  stroke={cat.hexColor}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - cat.percentage / 100)}
                  transform={`rotate(${offset * 360}, 56, 56)`}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>

          <YStack pos="absolute" ai="center" jc="center">
            <Text ff="$body" fos="$1" fow="800" col="$color">
              {new Date().toLocaleString('default', { month: 'short' }).toUpperCase()}
            </Text>
          </YStack>
        </View>

        <YStack f={1} gap="$3">
          {topCategories.length > 0 ? (
            topCategories.map((cat) => (
              <LegendItem
                key={cat.id}
                label={cat.label}
                percentage={`${cat.percentage.toFixed(0)}%`}
                color={cat.themeColor}
              />
            ))
          ) : (
            <Text ff="$body" fos="$1" col="$colorMuted">No data logged yet.</Text>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};

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