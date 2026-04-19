import { auth, db } from "@/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserSettings {
  monthlyBudget: number;
  currency: string;
  startOfWeek: number
}

export const userService = {
  /**
   * Updates or creates the user's settings document
   */

  async updateSettings(settings: Partial<UserSettings>) {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const userRef = doc(db, "users", user.uid);
    const updateData = {
      ...settings,
      updatedAt: new Date(),
    };

    try {
      // This returns Promise<void>
      await setDoc(userRef, updateData, { merge: true });

      // Return the data you just saved so your UI can use it
      return {
        success: true,
        data: updateData
      };
    } catch (error) {
      console.error("Firestore Update Error:", error);
      throw error; // Rethrow so your mutation knows it failed
    }
  },

  async uploadUserAvatar(base64String: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const userRef = doc(db, "users", user.uid);

    try {
      // We save the string directly to the photoURL field
      await setDoc(userRef, {
        photoURL: base64String,
        updatedAt: new Date()
      }, { merge: true });

      return base64String;
    } catch (error) {
      console.error("Error saving Base64 image:", error);
      throw error;
    }
  },

  async getSettings() {
    const user = auth.currentUser;
    if (!user) return null;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return null;
  }
};