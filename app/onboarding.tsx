import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth_store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "@tamagui/lucide-icons-2";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AnimatePresence,
  Button,
  H2,
  Input,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import z from "zod";

const OnboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
  monthlyBudget: z
    .string()
    .min(1, "Monthly budget is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Budget must be a number",
    }),
  startOfWeek: z.number().min(0).max(6, "Required"),
});

type OnboardingSchemaType = z.infer<typeof OnboardingSchema>;

const STEPS = [
  {
    id: 1,
    title: "What should we call you?",
    subtitle: "MoneyMap likes to be on a first-name basis.",
  },
  {
    id: 2,
    title: "Pick your currency",
    subtitle: "You can change this later in settings.",
  },
  {
    id: 3,
    title: "Monthly Budget",
    subtitle: "How much do you want to spend in a month?",
  },
  { id: 4, title: "Start of Week", subtitle: "When does your new week begin?" },
];

const WEEK_DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);

  const {
    watch,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingSchemaType>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      name: session?.displayName || "",
      currency: "",
      monthlyBudget: "",
      startOfWeek: 0,
    },
  });

  const currentCurrency = watch("currency");

  const { mutateAsync: completeOnboarding, isPending } = useMutation({
    mutationKey: ["completeOnboarding"],
    mutationFn: async (data: OnboardingSchemaType) =>
      userService.updateSettings({
        ...data,
        monthlyBudget: Number(data.monthlyBudget),
        onboardingCompleted: true,
      }),
    onSuccess: (res) => {
      if (!session) return;
      setSession({
        ...session,
        onboardingComplete: true,
      });
      router.replace("/");
    },
  });

  // Use the type you created from your Zod schema
  const handleComplete = (data: OnboardingSchemaType) =>
    completeOnboarding(data);

  const nextStep = async () => {
    if (step < STEPS.length - 1) {
      // Optional: Validate the current step before moving forward
      const fieldsByStep: (keyof OnboardingSchemaType)[][] = [
        ["name"],
        ["currency"],
        ["monthlyBudget"],
        ["startOfWeek"],
      ];

      const isStepValid = await trigger(fieldsByStep[step]);

      if (isStepValid) {
        setStep(step + 1);
      }
    } else {
      // This executes handleComplete only if the entire form is valid
      handleSubmit(handleComplete)();
    }
  };

  return (
    <YStack f={1} bg="$background" p="$6" jc="center">
      {/* Progress Bar */}
      <XStack gap="$2" mb="$8" px="$2">
        {STEPS.map((_, i) => (
          <View
            key={i}
            f={1}
            h={4}
            br="$full"
            bg={i <= step ? "$primary" : "$primaryLow"}
          />
        ))}
      </XStack>

      <AnimatePresence exitBeforeEnter>
        <YStack
          key={step}
          enterStyle={{ opacity: 0, x: 20 }}
          exitStyle={{ opacity: 0, x: -20 }}
        >
          <Text col="$primary" fow="700" ls={2} mb="$2">
            STEP {step + 1}
          </Text>
          <H2 fow="900" mb="$2">
            {STEPS[step].title}
          </H2>
          <Text col="$colorMuted" mb="$6">
            {STEPS[step].subtitle}
          </Text>

          {step === 0 && (
            <>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    size="$5"
                    bw={2}
                    focusStyle={{ boc: "$primary" }}
                    placeholder="Enter your name"
                    fontSize={"$2"}
                  />
                )}
              />
              {errors.name && (
                <Text col="$error" mt="$2" fow="600">
                  {errors.name.message}
                </Text>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <XStack fw="wrap" gap="$2">
                {["USD", "EUR", "GBP", "JPY", "BDT"].map((c) => (
                  <Button
                    key={c}
                    br="$4"
                    bw={2}
                    boc={currentCurrency === c ? "$primary" : "$borderColor"}
                    bg={currentCurrency === c ? "$primaryLow" : "transparent"}
                    onPress={() =>
                      setValue("currency", c, { shouldValidate: true })
                    }
                  >
                    <Text fow="600">{c}</Text>
                  </Button>
                ))}
              </XStack>
              {errors.currency && (
                <Text col="$error" mt="$2" fow="600">
                  {errors.currency.message}
                </Text>
              )}
            </>
          )}

          {step === 2 && (
            <Controller
              control={control}
              name="monthlyBudget"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  size="$5"
                  bw={2}
                  keyboardType="numeric"
                  focusStyle={{ boc: "$primary" }}
                  placeholder="e.g. 2000"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  fontSize={"$2"}
                />
              )}
            />
          )}

          {step === 3 && (
            <YStack gap="$3">
              {WEEK_DAYS.map((day) => (
                <Button
                  key={day.value}
                  size="$5"
                  br="$4"
                  bw={2}
                  boc={
                    watch("startOfWeek") === day.value
                      ? "$primary"
                      : "$borderColor"
                  }
                  bg={
                    watch("startOfWeek") === day.value
                      ? "$primaryLow"
                      : "transparent"
                  }
                  onPress={() =>
                    setValue("startOfWeek", day.value, { shouldValidate: true })
                  }
                >
                  <XStack f={1} ai="center" jc="space-between" px="$2">
                    <Text fow="600" fontSize="$4">
                      {day.label}
                    </Text>
                    {watch("startOfWeek") === day.value && (
                      <Check size={20} color="$primary" />
                    )}
                  </XStack>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>
      </AnimatePresence>

      <Button
        mt="$10"
        size="$5"
        bg="$primary"
        iconAfter={
          isPending ? (
            <Spinner color="white" />
          ) : step === 3 ? (
            <Check color="white" />
          ) : (
            <ArrowRight color="white" />
          )
        }
        onPress={nextStep}
        disabled={step === 0 && !watch("name")}
        opacity={step === 0 && !watch("name") ? 0.5 : 1}
      >
        <Text col="white" fow="700">
          {step === 3 ? "Finish" : "Continue"}
        </Text>
      </Button>
    </YStack>
  );
}
