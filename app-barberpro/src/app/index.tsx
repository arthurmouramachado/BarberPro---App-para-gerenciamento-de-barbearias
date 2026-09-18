import { ptBR } from "@/utils/localeCalendarConfig";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LocaleConfig } from "react-native-calendars";

import SplashScreen from "./SplashScreen";
import LoginScreen from "./LoginScreen";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

let splashJaMostrada = false;

export default function Index() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const [showSplash, setShowSplash] = useState(!splashJaMostrada);

  useEffect(() => {
    console.info("[Inicializacao] index.tsx montado");
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("[Inicializacao] Erro nas fontes:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    // O tempo da apresentação começa depois de carregar as fontes.
    if (!fontsLoaded || fontError || splashJaMostrada) return;

    const timer = setTimeout(() => {
      splashJaMostrada = true;
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (fontError) {
    return (
      <View style={styles.estadoInicial}>
        <Text style={styles.tituloErro}>Não foi possível carregar as fontes</Text>
        <Text selectable style={styles.mensagemErro}>
          {fontError.message}
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.estadoInicial}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.carregando}>Carregando fontes...</Text>
      </View>
    );
  }

  if (showSplash) return <SplashScreen />;

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  estadoInicial: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  carregando: {
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
  },
  tituloErro: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  mensagemErro: {
    color: "#374151",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
});