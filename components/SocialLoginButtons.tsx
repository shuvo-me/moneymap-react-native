import { signInWithGoogle } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth_store";
import { Chrome } from "@tamagui/lucide-icons-2";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, SizableText, Spinner, XStack } from "tamagui";

const SocialLoginButtons = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const {
    mutateAsync: signInWithGoogleMutation,
    isPending: isGoogleSignInPending,
  } = useMutation({
    mutationKey: ["google-sign-in"],
    mutationFn: signInWithGoogle,
    onSuccess: (data) => {
      console.log("google sign in success", data);
      setSession(data);
      router.replace("/");
    },
    onError: (error) => {
      console.log("google sign in error", error);
    },
  });
  return (
    <XStack gap="$4">
      <Button
        f={1}
        h={56}
        br="$4"
        bw={1}
        bc="$borderColor"
        bg="$background"
        icon={isGoogleSignInPending ? undefined : <Chrome size={18} />}
        onPress={() => signInWithGoogleMutation()}
      >
        {isGoogleSignInPending ? (
          <Spinner color={"$primary"} />
        ) : (
          <SizableText ff="$body" fow="600">
            Google
          </SizableText>
        )}
      </Button>
      {/* <Button
            f={1}
            h={56}
            br="$4"
            bw={1}
            bc="$borderColor"
            bg="$background"
            icon={<Apple size={18} />}
          >
            <SizableText ff="$body" fow="600">Apple</SizableText>
          </Button> */}
    </XStack>
  );
};

export default SocialLoginButtons;
