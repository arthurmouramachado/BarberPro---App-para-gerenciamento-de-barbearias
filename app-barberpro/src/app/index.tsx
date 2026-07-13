import React, { useState, useEffect } from 'react'
import LoginScreen from './LoginScreen'
import SplashScreen from './SplashScreen'
import { useFonts, Inter_700Bold, Inter_400Regular  } from '@expo-google-fonts/inter';

import HomeCliente from './HomeCliente';

let splashJaMostrada = false;

export default function Index() {
    const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const[showSplash, setShowSplash] = useState(!splashJaMostrada);

useEffect(() => {
  // Se a splash já passou da primeira vez, nem precisamos do timer rodando de novo
  if (splashJaMostrada) return; 

  const timer = setTimeout(() => {
    setShowSplash(false);
    splashJaMostrada = true; //  Salva na memória externa que a Splash já rodou!
  }, 3000);

  return () => clearTimeout(timer); // Boa prática para limpar o timer se o app fechar
}, []);

  if (!fontsLoaded) {
    return null; 
  }

  if(showSplash) return <SplashScreen />

  return <HomeCliente />
} 