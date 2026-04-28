import { SignUpSchemaType } from "@/app/(auth)/sign_up";
import { auth } from "@/config/firebase";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { userService } from "./user.service";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

// Register a new user
export const singUpUser = async ({ email, password }: SignUpSchemaType) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Optionally add the user's name to their profile
    await updateProfile(userCredential.user, {
      displayName: email.split("@")[0],
    });

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      emailVerified: userCredential.user.emailVerified,
      createdAt: userCredential.user.metadata.creationTime,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Login existing user
export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      emailVerified: userCredential.user.emailVerified,
      createdAt: userCredential.user.metadata.creationTime,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      if (!response.data?.idToken) {
        throw new Error("Google Sign-In failed: No ID Token received.");
      }
      const credential = GoogleAuthProvider.credential(response.data?.idToken);
      const userCredential = await signInWithCredential(auth, credential);

      const user = await userService.getSettings(userCredential.user.uid);

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: user?.name || userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        createdAt: userCredential.user.metadata.creationTime,
        onboardingComplete: user?.onboardingCompleted || false,
      };
    } else {
      // sign in was cancelled by user
      throw new Error("Sign in cancelled by user");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Logout
export const signOutUser = () => signOut(auth);
