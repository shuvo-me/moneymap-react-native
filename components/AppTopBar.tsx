import { useThemeStore } from "@/store";
import { useAuthStore } from "@/store/auth_store";
import { Moon, Sun } from "@tamagui/lucide-icons-2";
import { format } from "date-fns";
import { Avatar, Circle, Text, XStack, YStack } from "tamagui";

const AppTopBar = () => {
  const user = useAuthStore((state) => state.session);
  const { theme, toggleTheme } = useThemeStore();
  const hour = new Date().getHours();
  let greeting;

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 15) {
    greeting = "Good Noon";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  } else if (hour < 22) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }
  const firstName = user?.displayName?.split(" ")[0] || "there";
  const today = format(new Date(), "EEE, MMM d");

  return (
    <XStack jc="space-between" ai="center">
      <XStack ai="center" gap="$3">
        <Avatar circular size={44} borderWidth={2} boc="$primary">
          <Avatar.Image src={user?.photoURL as string} objectFit="cover" />
          <Avatar.Fallback bg="$primary" />
        </Avatar>
        <YStack>
          <Text ff="$body" fos="$1" col="$colorMuted">
            {today}
          </Text>
          <Text ff="$heading" fos="$5" fow="800" col="$color">
            {greeting}, {firstName}
          </Text>
        </YStack>
      </XStack>
      <Circle
        size={40}
        bg="$card"
        br="$full"
        ai="center"
        jc="center"
        pressStyle={{ scale: 0.9 }}
        borderWidth={1}
        borderColor="$borderColor"
        onPress={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun size={20} color="$colorMuted" />
        ) : (
          <Moon size={20} color="$colorMuted" />
        )}
      </Circle>
    </XStack>
  );
};

export default AppTopBar;
