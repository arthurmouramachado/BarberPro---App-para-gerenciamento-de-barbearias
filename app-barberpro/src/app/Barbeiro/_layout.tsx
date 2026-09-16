import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function BarbeiroLayout() {

  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#155DFC" />
      </View>
    );
  }

  // O botão Sair chama signOut(); a sessão vazia dispara este redirecionamento.
  if (!signed) {
    return <Redirect href="/LoginScreen" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="RelatoriosFinanceiros" />
      <Stack.Screen name="Servicos" />
      <Stack.Screen name="HorariosTrabalho" />
      <Stack.Screen name="ExcluirBarbeiroAdmin" />
    </Stack>
  );
}