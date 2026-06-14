// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/student/HomeScreen';
import CatalogScreen from './src/screens/student/CatalogScreen';
import BookDetailScreen from './src/screens/student/BookDetailScreen';
import { colors } from './src/constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. GABUNGAN MENU TAB BAWAH (DIBUAT TERPISAH)
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Katalog') {
            iconName = focused ? 'library' : 'library-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F4F1FE',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Katalog" component={CatalogScreen} />
    </Tab.Navigator>
  );
}

// 2. ROOT NAVIGATION UTAMA (TEMPAT NAVIGASI STACK DIKENDALIKAN)
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Rute awal masuk langsung merender susunan Bottom Tabs */}
        <Stack.Screen name="MainTabs" component={StudentTabs} />
        
        {/* Halaman detail buku berdiri di luar Tab agar bisa menutup layar full */}
        <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}