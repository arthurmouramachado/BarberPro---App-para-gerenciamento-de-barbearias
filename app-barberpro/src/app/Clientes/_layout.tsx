import { Redirect, Stack } from "expo-router";
import { AgendamentoProvider } from "@/contexts/AgendamentoContext";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function ClienteLayout() {

  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#155DFC" />
      </View>
    );
  }

  if (!signed) {
    return <Redirect href="/LoginScreen" />;
  }


  return (
    <AgendamentoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="DetalhesBarbearia" />
        <Stack.Screen name="AgendarServico" />
      </Stack>
    </AgendamentoProvider>
  );
}