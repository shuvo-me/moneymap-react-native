import { CurrencyPicker } from "@/components/CurrencyPicker";
import { StartOfWeekPicker } from "@/components/StartOfWeekPicker";
import queryClient from "@/config/queryClient";
import { signOutUser } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { useAuthStore, useThemeStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Check,
  ChevronRight,
  Coins,
  Sun,
} from "@tamagui/lucide-icons-2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
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
  View,
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
  monthlyBudget: z.number(),
});

type SettingsSchemaType = z.infer<typeof SettingsSchema>;

export default function SyncSettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.session);
  const removeSession = useAuthStore((state) => state.removeSession);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = useThemeStore((state) => state.theme);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const { handleSubmit, setValue, watch, reset } = useForm<SettingsSchemaType>({
    defaultValues: {
      currency: "BDT",
      startOfWeek: 0,
      monthlyBudget: 0,
    },
    resolver: zodResolver(SettingsSchema),
  });

  // Inside your component...
  const { mutate: updateAvatar, isPending: isUploading } = useMutation({
    mutationKey: ["updateAvatar"],
    mutationFn: userService.uploadUserAvatar,
    onSuccess: (newBase64) => {
      // Get current session
      const currentSession = useAuthStore.getState().session;

      // Update the store with the new photoURL
      if (currentSession) {
        useAuthStore.getState().setSession({
          ...currentSession,
          photoURL: newBase64,
        });
      }

      console.log("Store synced with new Base64 photo");
    },
  });

  const handlePickImage = async () => {
    // 1. Create the selection menu
    Alert.alert("Profile Picture", "How would you like to update your photo?", [
      {
        text: "Take a Selfie",
        onPress: () => openPicker("camera"),
      },
      {
        text: "Choose from Gallery",
        onPress: () => openPicker("gallery"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const openPicker = async (mode: "camera" | "gallery") => {
    try {
      // 2. Request Permissions
      const permissionResult =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert(`You've refused to allow this app to access your ${mode}!`);
        return;
      }

      const options = {
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 0.2, // Keep this low for Firestore!
        base64: true, // MUST BE TRUE
      };

      // 3. Launch the Picker
      const result =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync({
            ...options,
            cameraType: ImagePicker.CameraType.front, // Starts with selfie cam
          })
          : await ImagePicker.launchImageLibraryAsync(options);

      // 4. Handle Result
      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        updateAvatar(base64Image);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const { data: settings, isLoading: isFetchingSettings } = useQuery({
    queryKey: ["userSettings", user?.uid],
    queryFn: () => userService.getSettings(user?.uid || ""),
    enabled: !!user?.uid,
  });

  const { mutateAsync: updateSettings, isPending: isUpdatingSettings } =
    useMutation({
      mutationFn: userService.updateSettings,
      mutationKey: ["updateSettings"],
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["userSettings"] });
        const currentSession = useAuthStore.getState().session;
        if (currentSession) {
          useAuthStore.getState().setSession({
            ...currentSession,
            currency: res.data?.currency,
          });
        }
      },
    });

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

  useEffect(() => {
    if (settings) {
      console.log("Form is being populated from the Cache!");
      reset({
        currency: settings.currency || "BDT",
        startOfWeek: settings.startOfWeek ?? 0,
        monthlyBudget: settings.monthlyBudget ?? 0,
      });
    }
  }, [settings]);

  return (
    <ScreenContainer>
      <ScrollView
        bg="$background"
        f={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          pt: insets.top + 20,
          pb: insets.bottom + 90,
        }}
      >
        <YStack gap={"$3"}>
          {/* Hero Section */}
          <YStack gap="$6">
            <H2
              ff="$heading"
              size={"$6"}
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
              <YStack
                position="relative"
                alignSelf="center"
                onPress={handlePickImage} // The function to launch image picker
                pressStyle={{ scale: 0.97, opacity: 0.9 }}
                cursor="pointer"
              >
                <Avatar circular size={80} bw={2} boc="$background">
                  <Avatar.Image
                    aria-label="Cam"
                    key={user?.photoURL}
                    src={user?.photoURL as string}
                  />
                  <Avatar.Fallback backgroundColor="$primary" />
                </Avatar>

                {/* Edit Icon Badge */}
                <View
                  position="absolute"
                  bottom={0}
                  right={0}
                  bg="$primary"
                  p="$2"
                  br="$full"
                  bw={3}
                  boc="$card" // Creates a "border" gap between the icon and the avatar
                >
                  {isUploading ? (
                    <Spinner size="small" color="white" />
                  ) : (
                    <Camera size={14} color="white" />
                  )}
                </View>
              </YStack>

              <YStack>
                <Text ff="$body" fos={18} fow="700">
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
          <YStack bg="$card" p={"$6"} br="$9">
            <H3 ff="$heading" fos={"$5"} fow="700" mb="$8">
              System Preferences
            </H3>

            <YStack gap="$8">
              {!isFetchingSettings ? (
                <>
                  <PreferenceItem
                    icon={Coins}
                    label="Default Currency"
                    value={watch("currency")}
                    onPress={() => {
                      console.log("pressed");
                      setShowCurrencyPicker(true);
                    }}
                  />
                  <StartOfWeekPicker
                    value={watch("startOfWeek") === 1 ? "monday" : "sunday"}
                    onChange={(value) =>
                      setValue("startOfWeek", value === "sunday" ? 0 : 1)
                    }
                  />

                  <YStack gap={"$3"}>
                    <Text
                      ff="$body"
                      fos={"$2"}
                      fow="800"
                      col="$primary"
                      ls={1.5}
                      tt={"uppercase"}
                    >
                      Monthly Budget
                    </Text>
                    <Input
                      // Convert number to string, but show empty string if it's 0 to allow clearing
                      value={
                        watch("monthlyBudget") === 0
                          ? ""
                          : watch("monthlyBudget").toString()
                      }
                      onChangeText={(value) => {
                        // If the input is cleared, set to 0 (or stay empty if you prefer)
                        if (value === "") {
                          setValue("monthlyBudget", 0);
                        } else {
                          // Clean non-numeric characters and parse
                          const numericValue = parseInt(
                            value.replace(/[^0-9]/g, ""),
                            10,
                          );
                          setValue(
                            "monthlyBudget",
                            isNaN(numericValue) ? 0 : numericValue,
                          );
                        }
                      }}
                      placeholder="0"
                      keyboardType="numeric"
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
                    icon={
                      !isUpdatingSettings ? <Check color="$color" /> : undefined
                    }
                    onPress={handleSubmit(onUpdateSettings)}
                  >
                    {isUpdatingSettings ? <Spinner color="$color" /> : "Save"}
                  </Button>
                </>
              ) : (
                <Spinner color="$color" />
              )}

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
            setValue("currency", code);
          }}
          selected={watch("currency")}
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
  <YStack gap="$3" f={1}>
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
