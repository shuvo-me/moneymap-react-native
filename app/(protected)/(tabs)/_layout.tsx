import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Tabs
        screenOptions={{
            headerShown: false
        }}
    >
      <Tabs.Screen name="index" />
      {/* <Tabs.Screen name="smart_entry" />
      <Tabs.Screen name="deep_dive" />
      <Tabs.Screen name="sync" /> */}
    </Tabs>
  )
}

export default _layout