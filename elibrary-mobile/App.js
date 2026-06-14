// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/student/HomeScreen';
import CatalogScreen from './src/screens/student/CatalogScreen';
import { colors } from './src/constants/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Jam & status baterai tetap aman melayang */}
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Otomatis mengatur icon menu bawah berdasarkan nama halamannya
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Katalog') {
              iconName = focused ? 'library' : 'library-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,      // Warna icon saat aktif (Ungu)
          tabBarInactiveTintColor: colors.textSecondary, // Warna icon saat mati (Abu-abu)
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0EFFF',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerShown: false, // Menghilangkan navbar bawaan Expo yang kaku di atas layar
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Katalog" component={CatalogScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}