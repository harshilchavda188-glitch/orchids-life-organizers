import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { COLORS } from './src/constants/theme';

export default function App() {
  const { user, isLoaded, signIn, signOut } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthScreen onAuth={signIn} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <DashboardScreen user={user} onSignOut={signOut} />
    </>
  );
}
