import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="index" />
              {/* Auth routes */}
              <Stack.Screen name="(auth)/welcome" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/register" />
              <Stack.Screen name="(auth)/forgot-password" />
              <Stack.Screen name="(auth)/verify-email" />
              <Stack.Screen name="demo-one" />
              <Stack.Screen name="demo-two" />
              {/* Buyer routes */}
              <Stack.Screen name="buyer" />
              <Stack.Screen name="buyer/search" />
              <Stack.Screen name="buyer/filters" />
              <Stack.Screen name="buyer/available-now" />
              <Stack.Screen name="buyer/category" />
              <Stack.Screen name="buyer/food/[id]" />
              <Stack.Screen name="buyer/order-data" />
              <Stack.Screen name="buyer/confirm-order" />
              <Stack.Screen name="buyer/order-created" />
              <Stack.Screen name="buyer/orders" />
              <Stack.Screen name="buyer/order-tracking" />
              <Stack.Screen name="buyer/rate-order" />
              <Stack.Screen name="buyer/cancel-order" />
              <Stack.Screen name="buyer/notifications" />
              <Stack.Screen name="buyer/profile" />
            </Stack>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
