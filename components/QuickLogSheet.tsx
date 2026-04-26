import queryClient from "@/config/queryClient";
import { logService } from "@/services/log.service";
import { useAuthStore } from "@/store/auth_store";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  BarChart3,
  Calendar,
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
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable } from "react-native";
import {
  Button,
  Circle,
  H2,
  Input,
  ScrollView,
  Sheet,
  Spinner,
  Switch,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
} from "tamagui";
import * as z from "zod";

interface QuickLogSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

const QuickLogSchema = z.object({
  amount: z
    .number()
    .int({ message: "Amount must be a whole number" })
    .positive({ message: "Amount must be greater than zero" }),
  category: z.string().min(1, { message: "Category is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  note: z.string().optional(),
  date: z.date(),
});

type QuickLogFormData = z.infer<typeof QuickLogSchema>;

export const QuickLogSheet = ({ open, onOpenChange }: QuickLogSheetProps) => {
  const user = useAuthStore((state) => state.session);
  const [selectedAmount, setSelectedAmount] = useState("$20");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const {
    setValue,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuickLogFormData>({
    resolver: zodResolver(QuickLogSchema),
    defaultValues: {
      amount: 0,
      category: "",
      type: "",
      note: "",
      date: new Date(),
    },
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateValue = watch("date");

  const amounts = ["250", "500", "1000"];

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

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Hide picker for Android immediately
    if (Platform.OS === "android") setShowDatePicker(false);

    if (selectedDate) {
      setValue("date", selectedDate);
    }
  };

  const { mutateAsync: addLogAsync, isPending } = useMutation({
    mutationKey: ["addLog"],
    mutationFn: async (data: QuickLogFormData) => {
      await logService.addLog({
        amount: data.amount,
        category: data.category,
        type: data.type as "personal" | "family",
        note: data.note || "",
      });
    },
    onSuccess: () => {
      reset({
        amount: 0,
        category: "",
        type: "",
        note: "",
        date: new Date(),
      });

      setSelectedAmount("");
      setSelectedCategory(null);
      setIsCustomAmount(false);
      onOpenChange(false);
      queryClient.invalidateQueries({
        queryKey: ["logs", "month", user?.uid],
      }); // Refresh logs after adding a new one
    },
    onError: (error) => {
      console.error("Error adding log:", error);
    },
  });

  const onSaveLog = (data: QuickLogFormData) => addLogAsync(data);

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
              <XStack ai={"center"} gap={"$2"}>
                <Switch
                  id={"amount"}
                  size={"$2"}
                  backgroundColor={"$primaryLow"}
                  transition={"fast"}
                  checked={isCustomAmount}
                  onCheckedChange={(val) => {
                    setIsCustomAmount(val);

                    if (val) {
                      setSelectedAmount("");
                    } else {
                      setValue("amount", 0);
                    }
                  }}
                  bw={1}
                  borderColor={"$primary"}
                >
                  <Switch.Thumb
                    size={"$1.5"}
                    transition={"fast"}
                    bg={"$primary"}
                  />
                </Switch>
                <Text ff={"$body"} fos={"$3"} fow="600" col="$primary" ls={1.5}>
                  Custom Amount
                </Text>
              </XStack>
              {isCustomAmount ? (
                <XStack
                  enterStyle={{ opacity: 0, x: 10 }}
                  bg="$card"
                  br="$4"
                  h={56}
                  ai="center"
                  px="$4"
                  bw={1}
                  boc="$primary"
                >
                  <Text ff="$heading" fos="$5" fow="800" col="$primary" mr="$2">
                    ৳
                  </Text>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { value, onChange } }) => (
                      <Input
                        inputMode="numeric"
                        keyboardType="number-pad"
                        f={1}
                        placeholder="0.00"
                        bg="transparent"
                        bw={0}
                        autoFocus
                        value={value ? String(value) : ""}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, "");

                          const numericValue =
                            cleaned === "" ? 0 : parseInt(cleaned, 10);

                          onChange(numericValue);
                        }}
                      />
                    )}
                  />
                </XStack>
              ) : (
                <XStack gap="$3" fw="wrap">
                  {amounts.map((amt) => (
                    <Button
                      key={amt}
                      flex={1}
                      minWidth={70}
                      h={60}
                      br="$4"
                      bg={selectedAmount === amt ? "$buttonBg" : "$card"}
                      onPress={() => {
                        setSelectedAmount(amt);
                        setValue("amount", parseInt(amt));
                      }}
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
              )}
              {errors.amount && (
                <Text ff="$body" fow="600" fos="$2" col="$error">
                  *{errors.amount.message}
                </Text>
              )}
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
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setValue("category", cat.id);
                      setValue("type", "personal");
                    }}
                  />
                ))}
              </XStack>
              {errors.category && (
                <Text ff="$body" fow="600" fos="$2" col="$error">
                  *{errors.category.message}
                </Text>
              )}
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
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setValue("category", cat.id);
                      setValue("type", "family");
                    }}
                  />
                ))}
              </XStack>
              {errors.category && (
                <Text ff="$body" fow="600" fos="$2" col="$error">
                  *{errors.category.message}
                </Text>
              )}
            </YStack>

            <YStack gap="$3">
              <Text
                ff="$body"
                fos={"$3"}
                fow="700"
                col="$onSurfaceVariant"
                ls={1.5}
                tt="uppercase"
              >
                Expense Date
              </Text>

              <Button
                bg="$card"
                h={55}
                br="$4"
                jc="space-between"
                ai="center"
                onPress={() => setShowDatePicker(true)}
                borderWidth={1}
                borderColor="$outlineVariant"
              >
                <XStack ai="center" gap="$3">
                  <Calendar size={20} color="$primary" />
                  <Text ff="$body" fos="$3" fow="600" col="$primary">
                    {dateValue.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </XStack>
                <Text fos="$3" ff={"$body"} col="$muted" fow="800">
                  CHANGE
                </Text>
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()} // Prevent logging future expenses
                />
              )}
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
                <Controller
                  control={control}
                  name="note"
                  render={({ field }) => (
                    <TextArea
                      flex={1}
                      bg="transparent"
                      p={0}
                      placeholderTextColor="$muted"
                      placeholder="What was this for?"
                      color="$primary"
                      minHeight={50}
                      borderWidth={0}
                      {...field}
                    />
                  )}
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
          bg="$buttonBg"
          onPress={handleSubmit(onSaveLog)}
          pressStyle={{ scale: 0.95 }}
        >
          <XStack gap="$2" ai="center" jc={"center"}>
            {isPending ? (
              <Spinner color="white" />
            ) : (
              <>
                <CheckCircle size={20} color="white" />
                <Text ff="$heading" fow="800" fos="$4" col="white">
                  Log Expense
                </Text>
              </>
            )}
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
      bg={isSelected ? "$buttonBg" : "$card"}
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
