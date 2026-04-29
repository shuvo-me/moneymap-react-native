import queryClient from "@/config/queryClient";
import { ALL_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { logService } from "@/services/log.service";
import { useAuthStore } from "@/store/auth_store";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Check, Edit3, X } from "@tamagui/lucide-icons-2";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable } from "react-native";
import {
  Button,
  Circle,
  H2,
  Input,
  ScrollView,
  Separator,
  Sheet,
  Spinner,
  Switch,
  Text,
  TextArea,
  XStack,
  YStack
} from "tamagui";
import * as z from "zod";


const QuickLogSchema = z.object({
  title: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount is required"),
  category: z.string().min(1, "Pick a category"),
  note: z.string().optional(),
  date: z.date(),
});

type QuickLogFormData = z.infer<typeof QuickLogSchema>;

interface QuickLogSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const QuickLogSheet = ({ open, onOpenChange }: QuickLogSheetProps) => {
  const user = useAuthStore((state) => state.session);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      note: "",
      date: new Date(),
    },
  });

  const selectedCategory = watch("category");
  const dateValue = watch("date");

  // Mutation Logic
  const { mutateAsync: addLogAsync, isPending, error } = useMutation({
    mutationKey: ["addLog"],
    mutationFn: async (data: QuickLogFormData) => {
      await logService.addLog({
        title: data.title,
        note: data.note,
        amount: data.amount,
        category: data.category,
        date: data.date,
      });
    },
    onSuccess: () => {
      reset();
      setSelectedAmount("");
      setIsCustomAmount(false);
      setValue('amount', 0);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["logs", "month", user?.uid] });
    },
  });


  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol;
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      zIndex={200000}
    >
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0,0,0,0.5)"
      />
      <Sheet.Frame
        bg="$primaryForeground"
        borderTopLeftRadius="$7"
        borderTopRightRadius="$7"
        px="$5"
        pb="$5"
      >
        <Sheet.Handle bg="$card" my="$1" />

        <XStack jc="space-between" ai="center" mb="$2">
          <H2 fow="800" size="$6">
            Quick Log
          </H2>
          <Button
            icon={X}
            circular
            onPress={() => onOpenChange(false)}
            chromeless
          />
        </XStack>

        <Separator boc={"$card"} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            marginTop: 16,
          }}
        >
          <YStack gap="$6" pb="$10">
            {/* 1. Title Input (The "What") */}
            <YStack gap="$2">
              <Text
                ff="$body"
                fos="$2"
                fow="700"
                col="$onSurfaceVariant"
                tt="uppercase"
                ls={1}
              >
                Title
              </Text>
              <XStack
                ai="center"
                bg="$card"
                br="$4"
                pl="$1"
                pr={"$4"}
                bw={1}
                boc="$border"
                h={55}
              >
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      f={1}
                      bw={0}
                      bg="transparent"
                      placeholder="Enter a short title for you expense"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                <Edit3 size={18} color="$outline" />
              </XStack>
              {errors.title && (
                <Text col="$error" fos="$3" ff={'$body'}>
                  {errors.title.message}
                </Text>
              )}
            </YStack>

            {/* 2. Amount Section */}
            <YStack gap="$3">
              <XStack jc="space-between" ai="center">
                <Text ff="$body" fos="$2" fow="700" col="$color" tt="uppercase">
                  Amount
                </Text>
                <XStack ai="center" gap="$2">
                  <Text ff="$body" fos="$1" fow="700" col="$color">
                    Custom
                  </Text>
                  <Switch
                    size="$1"
                    checked={isCustomAmount}
                    onCheckedChange={setIsCustomAmount}
                    backgroundColor={"$primaryLow"}
                  >
                    <Switch.Thumb
                      backgroundColor={"$primary"}
                      animationName={"medium"}
                    />
                  </Switch>
                </XStack>
              </XStack>

              {isCustomAmount ? (
                <Input
                  h={55}
                  br="$4"
                  textAlign="center"
                  bg="$card"
                  keyboardType="numeric"
                  onChangeText={(t) => setValue("amount", parseInt(t) || 0)}
                  placeholder="Enter expense amount."
                />
              ) : (
                <XStack gap="$2">
                  {["250", "500", "1000"].map((amt) => (
                    <Button
                      key={amt}
                      f={1}
                      h={55}
                      br="$4"
                      bg={selectedAmount === amt ? "$buttonBg" : "$card"}
                      onPress={() => {
                        setSelectedAmount(amt);
                        setValue("amount", parseInt(amt));
                      }}
                    >
                      <Text
                        col={selectedAmount === amt ? "white" : "$primary"}
                        fow="800"
                      >
                        {getCurrencySymbol(user?.currency!)} {amt}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              )}
              {errors.amount && (
                <Text col="$error" fos="$3" ff={'$body'}>
                  {errors.amount.message}
                </Text>
              )}
            </YStack>

            {/* 3. The Categories */}
            <YStack gap={"$3"}>
              <Text ff="$body" fos="$2" fow="700" col="$color" tt="uppercase">
                Category
              </Text>
              <XStack fw="wrap" gap="$3">
                {ALL_CATEGORIES.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    Icon={cat.icon}
                    label={cat.label}
                    isSelected={selectedCategory === cat.id}
                    // color={themeColor}
                    onPress={() => {
                      setValue("category", cat.id);
                    }}
                  />
                ))}
              </XStack>
              {errors.category && (
                <Text col="$error" fos="$3" ff={'$body'}>
                  {errors.category.message}
                </Text>
              )}
            </YStack>

            {/* 4. Date Picker */}
            <YStack gap="$3">
              <Text ff="$body" fos="$2" fow="700" col="$color" tt="uppercase">
                Date
              </Text>
              <Button
                h={55}
                br="$4"
                bg="$card"
                bw={1}
                boc="$outlineVariant"
                onPress={() => setShowDatePicker(true)}
              >
                <XStack f={1} jc="space-between" ai="center" px="$2">
                  <XStack gap="$2" ai="center">
                    <Calendar size={18} color="$primary" />
                    <Text ff={"$body"} fos={"$2"} fow="600">
                      {dateValue.toDateString()}
                    </Text>
                  </XStack>
                  <Text col="$primary" ff={"$body"} fow="800" fos="$1">
                    CHANGE
                  </Text>
                </XStack>
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  onChange={(e, d) => {
                    setShowDatePicker(false);
                    if (d) setValue("date", d);
                  }}
                  accentColor="#546354"
                  textColor="#546354"
                />
              )}
            </YStack>

            {/* 4. Date Picker */}
            <YStack gap="$3">
              <Text ff="$body" fos="$2" fow="700" col="$color" tt="uppercase">
                Note{" "}
                <Text fos={10} ff={"$body"}>
                  (Optional)
                </Text>
              </Text>
              <Controller
                name="note"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextArea
                    height={70}
                    bg={"$card"}
                    placeholder="Enter a note for your expense"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
            </YStack>
          </YStack>
        </ScrollView>

        <Button
          h={60}
          br="$6"
          bg="$buttonBg"
          onPress={handleSubmit((data) => addLogAsync(data))}
          disabled={isPending}
          iconAfter={isPending ? <Spinner color={'white'} /> : <Check color={'white'} />}
        >
          <Text col="white" fow="800" fos="$4">
            Save
          </Text>
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
};

// Simplified Category Button
const CategoryButton = ({ Icon, label, isSelected, color, onPress }: any) => (
  <Pressable onPress={onPress}>
    <YStack
      ai="center"
      gap="$2"
      p="$2"
      br="$4"
      bg={isSelected ? "$buttonBg" : "$card"}
      px={"$3"}
      borderRadius={"$4"}
    >
      <Circle
        size={44}
        bg={isSelected ? "rgba(255,255,255,0.2)" : "$card"}
        ai="center"
        jc="center"
        bw={isSelected ? 0 : 1}
        boc="$border"
      >
        <Icon size={18} color={isSelected ? "white" : color} />
      </Circle>
      <Text
        ff={"$body"}
        fos="$1"
        fow="600"
        ta="center"
        col={isSelected ? "white" : "$color"}
      >
        {label}
      </Text>
    </YStack>
  </Pressable>
);
