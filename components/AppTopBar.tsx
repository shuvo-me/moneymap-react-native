import { useAuthStore } from "@/store/auth_store";
import { Avatar, Text, XStack } from "tamagui";

const AppTopBar = () => {
  const user = useAuthStore((state) => state.session);

  return (
    <XStack ai="flex-start" gap={"$2"}>
      <Avatar circular size={40}>
        <Avatar.Image aria-label="Cam" src={user?.photoURL as string} />
        <Avatar.Fallback backgroundColor="$primary" />
      </Avatar>
      <Text ff="$body" fos="$6" fow="800" col="$primary">
        MoneyMap
      </Text>
    </XStack>
  );
};

export default AppTopBar;
