import { ALL_CATEGORIES } from "@/lib/constants";
import { ExpenseLog } from "@/services/log.service";
import { PieChart } from "react-native-chart-kit";
import { Text, useTheme, View, XStack, YStack } from "tamagui";

interface CategoryDistributionProps {
  logs?: ExpenseLog[];
  monthlyBudget?: number;
}

export const CategoryDistribution = ({
  logs = [],
  monthlyBudget,
}: CategoryDistributionProps) => {
  const tamaguiTheme = useTheme();

  // Calculate category totals
  const categoryTotals = logs.reduce(
    (acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Transform to chart data structure
  const actualCategories = Object.entries(categoryTotals)
    .map(([id, amount]) => {
      const metadata = ALL_CATEGORIES.find((c) => c.id === id);
      return {
        id,
        label: metadata?.label || id.charAt(0).toUpperCase() + id.slice(1),
        percentage: monthlyBudget! > 0 ? (amount / monthlyBudget!) * 100 : 0,
        amount,
        themeColor: metadata?.chartColor,
        hexColor: metadata?.chartColor || "#A0A0A0",
        isPlaceholder: false,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Get top 4 categories or fill with placeholders
  let topCategories = [...actualCategories.slice(0, 4)];

  if (topCategories.length < 4) {
    const usedIds = topCategories.map((c) => c.id);
    const placeholders = ALL_CATEGORIES.filter((c) => !usedIds.includes(c.id))
      .slice(0, 4 - topCategories.length)
      .map((c) => ({
        id: c.id,
        label: c.label,
        percentage: 0,
        amount: 0,
        themeColor: c.chartColor,
        hexColor: c.chartColor || "#E0E0E0",
        isPlaceholder: true,
      }));

    topCategories = [...topCategories, ...placeholders];
  }

  // 2. Map structural values to react-native-chart-kit configuration schemas
  const chartData = topCategories.map((cat) => ({
    name: cat.label,
    // If percentage is 0, give it a tiny fractional slice so the placeholder segment renders visually
    population: cat.percentage > 0 ? cat.percentage : 0.1,
    color: cat.isPlaceholder ? `${cat.hexColor}4D` : cat.hexColor, // Adds 30% alpha hex opacity for placeholders
    legendFontColor: tamaguiTheme.colorMuted?.get() || "#7F7F7F",
    legendFontSize: 11,
  }));

  return (
    <YStack
      bg="$card"
      br="$7"
      p="$5"
      shadowColor="$foreground"
      shadowOpacity={0.02}
      shadowRadius={20}
    >
      <Text ff="$heading" fos="$3" fow="800" col="$color" mb="$4">
        Category Distribution
      </Text>

      <XStack ai="center" jc="space-between">
        {/* Pie Chart Wrapper Frame Layout container */}
        <View w={140} h={140} jc="center" ai="center" pos="relative">
          <PieChart
            data={chartData}
            width={150}
            height={150}
            chartConfig={{
              color: (opacity = 0.5) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"35"}
            center={[0, 0]}
            absolute
            hasLegend={false}
          />
        </View>

        {/* Re-utilized Clean Custom Tamagui Layout Legend Section */}
        <YStack f={1} gap="$2.5" ml="$4">
          {topCategories.length > 0 ? (
            topCategories.map((cat) => (
              <LegendItem
                key={cat.id}
                label={cat.label}
                percentage={`${cat.percentage.toFixed(1)}%`}
                color={cat.themeColor}
                isPlaceholder={cat.isPlaceholder}
              />
            ))
          ) : (
            <Text ff="$body" fos="$1" col="$colorMuted">
              No data logged yet.
            </Text>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};

const LegendItem = ({
  label,
  percentage,
  color,
  isPlaceholder,
}: {
  label: string;
  percentage: string;
  color: any;
  isPlaceholder: boolean;
}) => (
  <XStack jc="space-between" ai="center" opacity={isPlaceholder ? 0.5 : 1}>
    <XStack ai="center" gap="$2">
      <View
        w={8}
        h={8}
        br="$full"
        bg={color}
        opacity={isPlaceholder ? 0.3 : 1}
      />
      <Text
        ff="$body"
        fos={11}
        fow="600"
        col="$colorMuted"
        textTransform="capitalize"
      >
        {label}
      </Text>
    </XStack>
    <Text ff="$body" fos={11} fow="700" col="$color">
      {percentage}
    </Text>
  </XStack>
);
