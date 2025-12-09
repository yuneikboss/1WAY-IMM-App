import { Stack } from "expo-router";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f1a' },
            animation: 'slide_from_right',
          }}
        />
      </AppProvider>
    </AuthProvider>
  );
}
