// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Context Auth (Person A) — Provider untuk state auth global
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Auth Screens (Person A)
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Student Screens
import HomeScreen from './src/screens/student/HomeScreen';
import CatalogScreen from './src/screens/student/CatalogScreen';
import BookDetailScreen from './src/screens/student/BookDetailScreen';
import ProfileScreen from './src/screens/student/ProfileScreen';
import ScanQRScreen from './src/screens/student/ScanQRScreen';
import HistoryScreen from './src/screens/student/HistoryScreen';
import NotificationScreen from './src/screens/student/NotificationScreen';

// Admin Screens
import ManageBooksScreen from './src/screens/admin/ManageBooksScreen';
import ManageUsersScreen from './src/screens/admin/ManageUsersScreen';
import ManageTransactionsScreen from './src/screens/admin/ManageTransactionsScreen';

import { colors } from './src/constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab navigator untuk mahasiswa (Home, Katalog, Scan QR, Riwayat, Profil)
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
          } else if (route.name === 'Scan QR') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Riwayat') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
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
      <Tab.Screen name="Scan QR" component={ScanQRScreen} />
      <Tab.Screen name="Riwayat" component={HistoryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Tab navigator untuk admin (Kelola Buku, Kelola Anggota, Transaksi, Profil)
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Kelola Buku') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Kelola Anggota') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Transaksi') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profil Admin') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
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
      <Tab.Screen name="Kelola Buku" component={ManageBooksScreen} />
      <Tab.Screen name="Kelola Anggota" component={ManageUsersScreen} />
      <Tab.Screen name="Transaksi" component={ManageTransactionsScreen} />
      <Tab.Screen name="Profil Admin" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator — menentukan screen awal berdasarkan status auth.
 * Harus berada DI DALAM AuthProvider agar bisa membaca context auth.
 * Menggunakan isLoadingSession untuk menghindari flash screen yang salah.
 */
function RootNavigator() {
  const { isLoggedIn, isAdmin, isLoadingSession } = useAuth();

  // Tentukan screen awal berdasarkan status sesi yang sudah dimuat
  const getInitialRouteName = () => {
    if (isLoadingSession) return 'Splash';
    if (isLoggedIn) return isAdmin ? 'AdminTabs' : 'MainTabs';
    return 'Splash';
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRouteName()}
    >
      {/* Splash Screen — cek sesi & animasi */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* Flow Autentikasi */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Flow Mahasiswa */}
      <Stack.Screen name="MainTabs" component={StudentTabs} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />

      {/* Flow Admin */}
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
}

/**
 * Root App — AuthProvider membungkus segalanya agar state auth
 * tersedia di seluruh pohon komponen (single source of truth).
 */
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
