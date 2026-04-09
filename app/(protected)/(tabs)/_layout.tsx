import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { LayoutDashboard, ListPlus, Settings } from '@tamagui/lucide-icons-2'
import { Tabs } from 'expo-router'
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import { Circle, styled, Text, XStack, YStack } from 'tamagui'

const { width } = Dimensions.get('window')

// --- Styled Components ---

const FloatingBarContainer = styled(XStack, {
  position: 'absolute',
  bottom: 30,
  left: width * 0.09, // Manual 5% offset for perfect centering
  width: width * 0.8,  // 90% width
  height: 68,
  backgroundColor: '#ffffff',
  borderRadius: 999,
  ai: 'center',
  jc: 'space-between',
  // px: '$6',
  borderWidth: 1,
  borderColor: '#31333015',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 10,
})

const CenterAction = styled(Circle, {
  size: 60,
  backgroundColor: '$primary',
  marginTop: -50, // Floating lift
  borderWidth: 5,
  borderColor: '$background', // Creates the "cutout" look against the screen
  shadowColor: '$primary',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 6,
  pressStyle: { scale: 0.92 },
})

// --- Custom TabBar Component ---

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <FloatingBarContainer>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        // Logic for different routes
        if (route.name === 'index') {
          return (
            <TabButton 
              key={route.key} 
              onPress={onPress} 
              isFocused={isFocused} 
              Icon={LayoutDashboard} 
              label="Home" 
            />
          )
        }

        if (route.name === 'quick_log') {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.9}>
              <CenterAction>
                <ListPlus size={28} color="white" />
              </CenterAction>
            </TouchableOpacity>
          )
        }

        if (route.name === 'settings') {
          return (
            <TabButton 
              key={route.key} 
              onPress={onPress} 
              isFocused={isFocused} 
              Icon={Settings} 
              label="Settings" 
            />
          )
        }
      })}
    </FloatingBarContainer>
  )
}

// --- Helper Button Component ---

const TabButton = ({ onPress, isFocused, Icon, label }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.tabItem}>
    <YStack ai="center" jc="center" gap="$1">
      <Icon 
        size={24} 
        color={isFocused ? '#546354' : '#5e5f5c'} 
        strokeWidth={isFocused ? 2.5 : 2} 
      />
      <Text 
        fos={10} 
        fow={isFocused ? "800" : "500"} 
        col={isFocused ? '$primary' : '$colorMuted'}
        ls={0.5}
      >
        {label.toUpperCase()}
      </Text>
    </YStack>
  </TouchableOpacity>
)

// --- Main Layout ---

export default function TabLayout() {
  return (
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="quick_log" />
        <Tabs.Screen name="settings" />
      </Tabs>
  )
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})