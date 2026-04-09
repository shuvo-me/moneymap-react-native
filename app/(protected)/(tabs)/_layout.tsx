import { QuickLogSheet } from "@/components/QuickLogSheet";
import { LayoutDashboard, ListPlus, Settings } from "@tamagui/lucide-icons-2";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import { Circle, Text, YStack } from "tamagui";

const { width } = Dimensions.get("window");

export default function Layout() {
  const [showQuickLog, setShowQuickLog] = useState<boolean>(false);
  return (
    <>
      <QuickLogSheet open={showQuickLog} onOpenChange={setShowQuickLog} />
      <Tabs style={styles.outerContainer}>
        {/* TabSlot renders the actual screen content */}
        <TabSlot />

        {/* TabList is the actual Bar */}
        <TabList style={styles.floatingBar}>
          <TabTrigger name="index" href="/" asChild>
            <CustomTabButton icon={LayoutDashboard} label="Dashboard" />
          </TabTrigger>

          {/* <TabTrigger name="quick_log" href="/quick_log" asChild> */}
          <RaisedActionButton onPress={() => setShowQuickLog(true)} />
          {/* </TabTrigger> */}

          <TabTrigger name="settings" href="/settings" asChild>
            <CustomTabButton icon={Settings} label="Settings" />
          </TabTrigger>
        </TabList>
      </Tabs>
    </>
  );
}

// --- Specialized Components ---

// This component receives 'isFocused' automatically from TabTrigger
const CustomTabButton = ({ icon: Icon, label, isFocused, ...props }: any) => {
  const { style, ...navigation } = props;
  return (
    <YStack
      {...navigation}
      f={1}
      ai="center"
      justifyContent="center"
      gap="$1"
      opacity={isFocused ? 1 : 0.5}
    >
      <Icon size={24} color={isFocused ? "$primary" : "$colorMuted"} />
      <Text ff="$body" fow="600" col={isFocused ? "$primary" : "$colorMuted"}>
        {label}
      </Text>
    </YStack>
  );
};

const RaisedActionButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.centerWrapper,
      { marginTop: -40, height: 100, justifyContent: "center" }, // Lift the whole touch area
    ]}
  >
    <Circle size={60} bg="$primary" elevation={5} bw={5} boc="#fbf9f6">
      <ListPlus size={28} color="white" />
    </Circle>
  </Pressable>
);

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  floatingBar: {
    position: "absolute",
    bottom: 30,
    left: width * 0.05,
    width: width * 0.9,
    height: 66,
    backgroundColor: "#ffffff",
    borderRadius: 33,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(49, 51, 48, 0.1)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: "visible", // CRITICAL: Allows touches outside the 66px height
    zIndex: 10,
  },
  centerWrapper: {
    width: 60,
    alignItems: "center",
  },
});
