import { CurrencyPicker } from "@/components/CurrencyPicker";
import { StartOfWeekPicker } from "@/components/StartOfWeekPicker";
import { signOutUser } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { useAuthStore, useThemeStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Coins, Sun } from "@tamagui/lucide-icons-2";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Avatar,
  Button,
  H2,
  H3,
  Input,
  ScrollView,
  Separator,
  Spinner,
  styled,
  Switch,
  Text,
  XStack,
  YStack,
} from "tamagui";
import z from "zod";

export const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: "$background",
  px: "$4", // shorthand for paddingHorizontal from your config
});

const SettingsSchema = z.object({
  currency: z.string(),
  startOfWeek: z.number(),
  montlyBudget: z.number(),
});

type SettingsSchemaType = z.infer<typeof SettingsSchema>;

export default function SyncSettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.session);
  const removeSession = useAuthStore((state) => state.removeSession);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = useThemeStore((state) => state.theme);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const { handleSubmit, setValue, watch } = useForm<SettingsSchemaType>({
    defaultValues: {
      currency: "BDT",
      startOfWeek: 0,
      montlyBudget: 0,
    },
    resolver: zodResolver(SettingsSchema),
  });

  const { mutateAsync: updateSettings, isPending: isUpdatingSettings } = useMutation({
    mutationFn: userService.updateSettings,
    mutationKey: ['updateSettings'],
    onSuccess: (res) => {
      console.log('User settings updated successfully:', res)
    },
    onError: (err) => {
      console.error('Error updating user settings:', err)
    }
  })

  const { mutateAsync: signOut, isPending } = useMutation({
    mutationKey: ["signOut"],
    mutationFn: async () => {
      await signOutUser();
    },
    onSuccess: () => {
      // Optionally, you can clear the user session in your store here
      removeSession();
      router.replace("/sign_in");
    },
    onError: (error) => {
      console.error("Error signing out:", error);
    },
  });

  const onUpdateSettings = (data: SettingsSchemaType) => updateSettings(data);

  return (
    <ScreenContainer>
      <ScrollView
        bg="$background"
        f={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          pt: insets.top + 10,
          pb: insets.bottom + 90,
        }}
      >
        <YStack gap={"$3"}>
          {/* Hero Section */}
          <YStack gap="$6">
            <H2
              ff="$heading"
              fos={"$7"}
              fow="800"
              ls={-2}
              col="$onSurface"
              ta={"center"}
            >
              Sync & Settings
            </H2>

            {/* Profile Identity Card */}
            <XStack
              bg="$card"
              p="$6"
              br="$8"
              ai="center"
              gap="$5"
              shadowColor="$border"
              shadowOffset={{ width: 0, height: 20 }}
              shadowOpacity={0.05}
              shadowRadius={30}
              bw={1}
              boc="$card"
            >
              <Avatar circular size={80}>
                <Avatar.Image aria-label="Cam" src={user?.photoURL as string} />
                <Avatar.Fallback backgroundColor="$primary" />
              </Avatar>

              <YStack>
                <Text ff="$headline" fos={18} fow="700">
                  {user?.displayName ?? "User Name"}
                </Text>
                <Text col="$onSurfaceVariant" fos={14}>
                  {user?.email ?? "julian@hearth.family"}
                </Text>

                <Text
                  fos={9}
                  fow="900"
                  col="$primary"
                  ls={1}
                  ta={"center"}
                  bg="$primaryLow"
                  px="$3"
                  py="$1"
                  br="$full"
                  mt="$2"
                >
                  PRIMARY ACCOUNT
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* System Preferences Section */}
          <YStack
            bg="$card"
            p={"$6"}
            br="$9"
          >
            <H3 ff="$heading" fos={"$5"} fow="700" mb="$8">
              System Preferences
            </H3>

            <YStack gap="$8">
              <PreferenceItem
                icon={Coins}
                label="Default Currency"
                value={watch('currency')}
                onPress={() => {
                  console.log('pressed');
                  setShowCurrencyPicker(true)
                }}
              />
              <StartOfWeekPicker
                value={watch('startOfWeek') === 0 ? 'sunday' : 'monday'}
                onChange={(value) => setValue('startOfWeek', value === 'sunday' ? 0 : 1)}
              />

              <YStack gap={'$3'}>
                <Text ff="$body" fos={"$2"} fow="800" col="$primary" ls={1.5} tt={'uppercase'}>Monthly Budget</Text>
                <Input
                  value={watch('montlyBudget')}
                  onChangeText={(value) => setValue('montlyBudget', Number(value))}
                  placeholder="Enter your monthly budget"
                  placeholderTextColor="$colorMuted"
                  minHeight={55}
                />
              </YStack>

              <Button
                bg="$secondaryForeground"

                br="$4"
                pressStyle={{
                  opacity: 0.5,
                }}
                icon={!isUpdatingSettings ? <Check color="$color" /> : undefined}
                onPress={handleSubmit(onUpdateSettings)}
              >
                {isUpdatingSettings ? <Spinner color="$color" /> : 'Save'}
              </Button>

              <Separator borderColor="$primary" opacity={0.1} />

              <PreferenceItem
                icon={Sun}
                label="Appearance"
                value={theme === "dark" ? "Dark Mode" : "Light Mode"}
                hasToggle
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </YStack>
          </YStack>

          {/* Danger Zone */}
          <XStack py="$4">
            <Button
              pressStyle={{
                opacity: 0.5,
              }}
              bg={"$secondaryForeground"}
              w="100%"
              minHeight={50}
              onPress={() => signOut()}
            >
              {isPending ? (
                <Spinner color="white" />
              ) : (
                <Text col={"$error"} fow="700" fos={"$3"} ls={1.1} ff={"$body"}>
                  Sign Out
                </Text>
              )}
            </Button>
          </XStack>
        </YStack>
        <CurrencyPicker
          open={showCurrencyPicker}
          onOpenChange={setShowCurrencyPicker}
          onSelect={(code) => {
            setValue('currency', code)
          }}
          selected={watch('currency')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

// --- Sub-Components ---

const PreferenceItem = ({
  icon: Icon,
  label,
  value,
  hasToggle,
  id,
  defaultChecked,
  onPress,
  ...props
}: any) => (
  <YStack gap="$3" f={1} >
    <Text ff="$body" fos={"$2"} fow="800" col="$primary" ls={1.5}>
      {label.toUpperCase()}
    </Text>
    <XStack
      bg="$background"
      p="$4"
      br="$5"
      ai="center"
      jc="space-between"
      pressStyle={{ bg: "$card" }}
      onPress={onPress}
    >
      <XStack ai="center" gap="$3">
        <Icon size={20} color="$primary" />
        <Text fow="700" fos={15}>
          {value}
        </Text>
      </XStack>

      {hasToggle ? (
        <Switch
          {...props}
          id={id}
          size={"$2"}
          defaultChecked={defaultChecked}
          backgroundColor={"$primaryLow"}
          transition={"fast"}
        >
          <Switch.Thumb transition={"fast"} bg={"$primary"} />
        </Switch>
      ) : (
        <ChevronRight size={20} color="$onSurfaceVariant" />
      )}
    </XStack>
  </YStack>
);
