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
import ManageBooksScreen from './src/screens/admin/ManageBooksScreen'; 
import { colors } from './src/constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. GABUNGAN MENU TAB BAWAH USER (TETAP BIARKAN DI SINI)
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

// 2. ROOT NAVIGATION UTAMA 
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminManageBooks" component={ManageBooksScreen} />

        {/* Susunan halaman user diturunkan sementara ke bawahnya */}
        <Stack.Screen name="MainTabs" component={StudentTabs} />
        <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}