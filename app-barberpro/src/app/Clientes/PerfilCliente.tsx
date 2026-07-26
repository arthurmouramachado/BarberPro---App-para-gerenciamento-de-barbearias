import { ProfileMenuItem } from "@/_components/ProfileMenuItem";
import { UserCard } from "@/_components/UserCard";
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,

} from "react-native";

export default function PerfilCliente() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });


  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={{ padding: 45, borderRadius: 20, marginBottom: 20 }}
      >
        <View style={styles.headercontainer}>
          {/* 1. Bloco da Esquerda (Textos) */}
          <View>
            <StaggeredText text="Meu Perfil" style={styles.text1} />
          </View>
          
        </View>

        <UserCard />

      </LinearGradient>
      
      <ProfileMenuItem title="Meus Dados" iconName={"user"}/>
      <ProfileMenuItem title="Notificações" iconName={"bell"}/>
      <ProfileMenuItem title="Configurações" iconName={"settings"}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headercontainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "center", 
    width: "100%",
    marginBottom: 20,
  },
  text1: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
});
