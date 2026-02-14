import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#1C6FBA',
        tabBarInactiveTintColor: '#7BA3C9',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#7BA3C9',
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 16,
          height: Platform.OS === 'ios' ? 100 : 76,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 16,
          overflow: 'visible',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-contact"
        options={{
          title: 'Add New',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#1C6FBA' : '#DCE9F4',
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -12,
              }}
            >
              <IconSymbol size={26} name="plus.circle.fill" color={focused ? '#FFFFFF' : '#1C6FBA'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="follow-ups"
        options={{
          title: 'Follow-ups',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="clock.arrow.circlepath" color={color} />,
        }}
      />
      {/* Hide workflow pages from the tab bar */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="contact/[id]" options={{ href: null }} />
      <Tabs.Screen name="scan-linkedin" options={{ href: null }} />
      <Tabs.Screen name="follow-up-detail" options={{ href: null }} />
    </Tabs>
  );
}
