import { signInWithGoogle } from "@/services/auth.service";
import { useAuthStore } from "@/store";
import { Chrome, Heart, LogIn } from "@tamagui/lucide-icons-2";
import { useMutation } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  H2,
  Input,
  Separator,
  SizableText,
  Spacer,
  Spinner,
  Text,
  XStack,
  YStack
} from "tamagui";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((state) => state.setSession);
  const { mutateAsync: signInWithGoogleMutation, isPending: isGoogleSignInPending } = useMutation({
    mutationKey: ['google-sign-in'],
    mutationFn: signInWithGoogle,
    onSuccess: (data) => {
      console.log('google sign in success', data);
      setSession(data);
      router.replace('/');
    },
    onError: (error) => {
      console.log('google sign in error', error);
    },
  })
  return (


    <YStack f={1} jc="center" bg="$background" pt={insets.top + 20} pb={insets.bottom + 20 as number}>

      {/* Editorial Header Section */}
      <YStack gap="$3" mb="$10" px={'$6'} ai={'center'}>
        <H2
          ff="$heading"
          fow="800"
          fos={48}
          lh={52}
          ls={-1.5}
          col="$color"
        >
          MoneyMap
        </H2>
        <SizableText
          ff="$body"
          fos="$4"
          col="$colorMuted"
          maw={280}
          lh={24}
          textAlign="center"
        >
          Welcome back to your financial <XStack ai="center" gap={4}>
            <Text fos={'$4'} col="$primary">Hearth</Text>
            <Heart color="red" fill={'red'} mt={1} size={16} />
          </XStack>
        </SizableText>
      </YStack>

      {/* Auth Form Container (The Card) */}
      <YStack
        bg="$card"
        p="$6"
        br="$10"
        shadowColor="$color"
        shadowOffset={{ width: 0, height: 10 }}
        shadowOpacity={0.04}
        shadowRadius={30}
        gap="$7"
      >
        {/* Input Fields */}
        <YStack gap="$5">
          {/* Email Field */}
          <YStack gap="$2">
            <SizableText
              ff="$body"
              fow="700"
              fos="$1"
              tt="uppercase"
              ls={1.5}
              col="$colorMuted"
            >
              Email Address
            </SizableText>
            <Input
              h={56}
              bg="$background"
              bw={0}
              br="$4"
              placeholder="example@moneymap.com"
            />
          </YStack>

          {/* Password Field */}
          <YStack gap="$2">
            <XStack jc="space-between" ai="center">
              <SizableText
                ff="$body"
                fow="700"
                fos="$1"
                tt="uppercase"
                ls={1.5}
                col="$colorMuted"
              >
                Password
              </SizableText>
              <SizableText
                ff="$body"
                fos="$2"
                fow="600"
                col="$secondary"
              >
                Forgot?
              </SizableText>
            </XStack>
            <Input
              h={56}
              bg="$background"
              bw={0}
              br="$4"
              secureTextEntry
              placeholder="••••••••"
            />
          </YStack>
        </YStack>

        {/* Primary Sign In Button */}
        <Button
          h={64}
          bg="$primary"
          hoverStyle={{ scale: 0.98 }}
          pressStyle={{ scale: 0.96 }}
          br="$4"
          iconAfter={<LogIn size={18} color="white" />}
        >
          <SizableText
            ff="$heading"
            fow="700"
            col="$primaryForeground"
            fos="$4"
          >
            Sign In
          </SizableText>
        </Button>

        {/* Decorative Divider */}
        <XStack ai="center" gap="$4" py="$2">
          <Separator f={1} bc="$borderColor" />
          <SizableText
            ff="$body"
            fos="$1"
            fow="600"
            col="$colorMuted"
            tt="uppercase"
            ls={1}
          >
            or continue with
          </SizableText>
          <Separator f={1} bc="$borderColor" />
        </XStack>

        {/* Social Login Options */}
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
            {isGoogleSignInPending ? <Spinner color={'$primary'} /> : <SizableText ff="$body" fow="600">Google</SizableText>}
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
      </YStack>

      <Spacer size="$6" />

      {/* Footer Link */}
      <XStack jc="center" ai="center" gap="$2">
        <SizableText col="$colorMuted" fos="$3">New to the MoneyMap?</SizableText>
        <Link href="/sign_up">
          <SizableText col="$secondary" fow="700" fos="$3">Create Account</SizableText>
        </Link>

      </XStack>

    </YStack>
  );
}
