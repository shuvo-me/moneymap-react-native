import { signOutUser } from "@/services/auth.service";
import { useAuthStore } from "@/store";
import { Calendar, ChevronRight, Coins, Sun } from "@tamagui/lucide-icons-2";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Avatar,
  Button,
  H2,
  H3,
  ScrollView,
  Spinner,
  styled,
  Switch,
  Text,
  XStack,
  YStack,
} from "tamagui";

export const ScreenContainer = styled(YStack, {
  flex: 1,
  backgroundColor: "$background",
  px: "$4", // shorthand for paddingHorizontal from your config
});

export default function SyncSettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.session);
  const removeSession = useAuthStore((state) => state.removeSession);

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
              bg="white"
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
            bg="white"
            p={"$6"}
            br="$9"
            // shadowColor="$onSurface"
            // shadowRadius={40}
            // shadowOpacity={0.04}
          >
            <H3 ff="$heading" fos={"$5"} fow="700" mb="$8">
              System Preferences
            </H3>

            <YStack gap="$8">
              <PreferenceItem
                icon={Coins}
                label="Default Currency"
                value="$ USD"
              />
              <PreferenceItem
                icon={Calendar}
                label="Start of Week"
                value="Monday"
              />
              <PreferenceItem
                icon={Sun}
                label="Appearance"
                value="Light Mode"
                hasToggle
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
    >
      <XStack ai="center" gap="$3">
        <Icon size={20} color="$primary" />
        <Text fow="700" fos={15}>
          {value}
        </Text>
      </XStack>

      {hasToggle ? (
        <Switch
          id={id}
          size={"$2"}
          defaultChecked={defaultChecked}
          backgroundColor={"$primaryLow"}
          activeStyle={
            {
              // backgroundColor: "$primary",
            }
          }
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
