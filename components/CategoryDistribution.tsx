import { ALL_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { ExpenseLog } from "@/services/log.service";
import { Circle, Text, View, XStack, YStack } from "tamagui";

interface CategoryDistributionProps {
  logs?: ExpenseLog[];
  monthlyBudget?: number;
  currencySymbol?: string;
}

export const CategoryDistribution = ({
  logs = [],
  monthlyBudget,
  currencySymbol = "$",
}: CategoryDistributionProps) => {
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

  // Filter out zero-placeholder segments for the stacked bar
  const barSegments = topCategories.filter(
    (cat) => !cat.isPlaceholder && cat.percentage > 0,
  );

  return (
    <YStack
      bg="$card"
      br="$7"
      p="$5"
      gap="$4"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Text ff="$heading" fos="$3" fow="800" col="$color">
        Category Breakdown
      </Text>

      {/* Stacked horizontal bar */}
      {barSegments.length > 0 ? (
        <XStack h={10} br="$full" ov="hidden" gap={2}>
          {barSegments.map((cat, index) => (
            <View
              key={cat.id}
              h="100%"
              flex={cat.percentage}
              bg={cat.hexColor}
              br={index === barSegments.length - 1 ? "$full" : 0}
            />
          ))}
        </XStack>
      ) : (
        <View h={10} bg="$primaryLow" br="$full" opacity={0.3} />
      )}

      {/* Category rows */}
      <YStack gap="$3">
        {topCategories.length > 0 ? (
          topCategories.map((cat) => (
            <XStack
              key={cat.id}
              ai="center"
              jc="space-between"
              opacity={cat.isPlaceholder ? 0.4 : 1}
            >
              <XStack ai="center" gap="$3" f={1}>
                <Circle size={10} bg={cat.hexColor} />
                <Text
                  ff="$body"
                  fos="$2"
                  fow="600"
                  col="$color"
                  textTransform="capitalize"
                >
                  {cat.label}
                </Text>
              </XStack>
              <XStack ai="center" gap="$3">
                <Text ff="$body" fos="$2" fow="700" col="$color">
                  {formatCurrency(cat.amount, currencySymbol)}
                </Text>
                <Text
                  ff="$body"
                  fos="$1"
                  fow="600"
                  col="$colorMuted"
                  w={42}
                  ta="right"
                >
                  {cat.percentage.toFixed(0)}%
                </Text>
              </XStack>
            </XStack>
          ))
        ) : (
          <Text ff="$body" fos="$2" col="$colorMuted">
            No data logged yet.
          </Text>
        )}
      </YStack>
    </YStack>
  );
};
