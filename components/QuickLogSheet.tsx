import {
  BarChart3,
  CheckCircle,
  Coffee,
  Dumbbell,
  FileText,
  Home,
  Lightbulb,
  Pill,
  ShoppingBag,
  X,
} from "@tamagui/lucide-icons-2";
import { useState } from "react";
import { Pressable } from "react-native";
import {
  Button,
  Circle,
  H2,
  ScrollView,
  Sheet,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
} from "tamagui";

interface QuickLogSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const QuickLogSheet = ({ open, onOpenChange }: QuickLogSheetProps) => {
  const [selectedAmount, setSelectedAmount] = useState("$20");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const amounts = ["৳250", "৳500", "৳1000"];

  const personalCategories = [
    { Icon: Dumbbell, label: "Gym", id: "gym" },
    { Icon: ShoppingBag, label: "Gear", id: "gear" },
    { Icon: Pill, label: "Supps", id: "supps" },
    { Icon: Coffee, label: "Coffee", id: "coffee" },
  ];

  const familyCategories = [
    { Icon: ShoppingBag, label: "Groceries", id: "groceries" },
    { Icon: BarChart3, label: "Bills", id: "bills" },
    { Icon: Lightbulb, label: "Kids", id: "kids" },
    { Icon: Home, label: "Home", id: "home" },
  ];

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      zIndex={200000}
    >
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(49, 51, 48, 0.4)"
      />

      <Sheet.Frame
        bg="$primaryForeground"
        borderTopEndRadius="$7"
        borderTopStartRadius="$7"
        px="$6"
        flex={1}
        flexDirection="column"
        pb={"$5"}
      >
        <Sheet.Handle bg="$surfaceContainerHighest" mb="$4" />

        {/* Header */}
        <XStack jc="space-between" ai="center" mb="$6">
          <H2 ff="$heading" fow="800" size="$6" col="$onSurface">
            Quick Log
          </H2>
          <Button
            icon={X}
            circular
            bg="$card"
            onPress={() => onOpenChange(false)}
            chromeless
            pressStyle={{ scale: 0.95 }}
          />
        </XStack>

        {/* Scrollable Content */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false} mb="$4">
          <YStack gap="$8">
            {/* Amount Presets */}
            <YStack gap="$3">
              <XStack gap="$3" fw="wrap">
                {amounts.map((amt) => (
                  <Button
                    key={amt}
                    flex={1}
                    minWidth={70}
                    h={60}
                    br="$4"
                    bg={selectedAmount === amt ? "$entryButttonBg" : "$card"}
                    onPress={() => setSelectedAmount(amt)}
                    pressStyle={{ scale: 0.95 }}
                    borderWidth={selectedAmount === amt ? 0 : 1}
                    borderColor="$outlineVariant"
                  >
                    <Text
                      ff="$heading"
                      fow="800"
                      fos="$4"
                      col={selectedAmount === amt ? "white" : "$primary"}
                      numberOfLines={1}
                    >
                      {amt}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </YStack>

            {/* Personal Category Section */}
            <YStack gap="$4">
              <XStack ai="center" gap="$2">
                <View w={1} h={16} bg="$secondary" br="$full" />
                <Text
                  ff="$body"
                  fos={"$3"}
                  fow="700"
                  col="$secondary"
                  ls={1.5}
                  tt="uppercase"
                >
                  Personal
                </Text>
              </XStack>
              <XStack gap={"$2"} jc={"space-between"}>
                {personalCategories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    {...cat}
                    color="$secondary"
                    isSelected={selectedCategory === cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                  />
                ))}
              </XStack>
            </YStack>

            {/* Family Category Section */}
            <YStack gap="$4">
              <XStack ai="center" gap="$2">
                <View w={1} h={16} bg="$primary" br="$full" />
                <Text
                  ff="$body"
                  fos={"$3"}
                  fow="700"
                  col="$primary"
                  ls={1.5}
                  tt="uppercase"
                >
                  Family
                </Text>
              </XStack>
              <XStack gap="$3">
                {familyCategories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    {...cat}
                    color="$primary"
                    isSelected={selectedCategory === cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                  />
                ))}
              </XStack>
            </YStack>

            {/* Optional Note Field */}
            <YStack gap="$3">
              <Text
                ff="$body"
                fos={"$3"}
                fow="700"
                col="$onSurfaceVariant"
                ls={1.5}
                tt="uppercase"
              >
                Optional Note
              </Text>
              <XStack
                ai="center"
                bg="$card"
                br="$4"
                px="$2"
                borderWidth={2}
                borderColor="transparent"
                focusStyle={{
                  borderColor: "$primary",
                  bg: "$card",
                }}
              >
                <TextArea
                  flex={1}
                  bg="transparent"
                  p={0}
                  placeholderTextColor="$muted"
                  placeholder="What was this for?"
                  color="$primary"
                  value={note}
                  onChangeText={setNote}
                  minHeight={50}
                  borderWidth={0}
                />
                <FileText size={20} color="$outline" />
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Submit Button (Fixed at bottom) */}
        <Button
          width="100%"
          br="$6"
          h={60}
          bg="$entryButttonBg"
          onPress={() => {
            // Handle submit logic
            console.log({
              amount: selectedAmount,
              category: selectedCategory,
              note,
            });
            onOpenChange(false);
          }}
          pressStyle={{ scale: 0.95 }}
        >
          <XStack gap="$2" ai="center">
            <CheckCircle size={20} color="white" />
            <Text ff="$heading" fow="800" fos="$4" col="white">
              Log Expense
            </Text>
          </XStack>
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
};

interface CategoryButtonProps {
  Icon: any;
  label: string;
  id: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryButton = ({
  Icon,
  label,
  color,
  isSelected,
  onPress,
}: CategoryButtonProps) => (
  <Pressable
    // flex={1}
    onPress={onPress}
    // pressStyle={{ scale: 0.95 }}
    // bg={"red"}
    // chromeless
  >
    <YStack
      ai="center"
      gap="$2"
      width="100%"
      bg={isSelected ? "$entryButttonBg" : "$card"}
      p="$3"
      br="$4"
    >
      <Circle
        br={9999999}
        size={48}
        bg={"$secondaryForeground"}
        ai="center"
        jc="center"
      >
        <Icon size={20} color={color} />
      </Circle>
      <Text
        ff={"$body"}
        fos={"$1"}
        fow="600"
        col={isSelected ? "white" : "$primary"}
        ta="center"
      >
        {label}
      </Text>
    </YStack>
  </Pressable>
);
