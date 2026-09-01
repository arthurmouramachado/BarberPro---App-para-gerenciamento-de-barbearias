import { ptBR } from "@/utils/localeCalendarConfig";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import React, { useEffect, useState } from "react";
import { LocaleConfig } from "react-native-calendars";

import SplashScreen from "./SplashScreen";
import LoginScreen from "./LoginScreen";
import { AuthProvider } from "@/contexts/AuthContext";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

let splashJaMostrada = false;

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const [showSplash, setShowSplash] = useState(!splashJaMostrada);

  useEffect(() => {
    // Se a splash já passou da primeira vez, nem precisamos do timer rodando de novo
    if (splashJaMostrada) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      splashJaMostrada = true; //  Salva na memória externa que a Splash já rodou
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) return <SplashScreen />;

  return (
    <AuthProvider>
      <LoginScreen/>
    </AuthProvider>
  );
}
