import { ProfileMenuItem } from "@/_components/ProfileMenuItem";
import { UserCard } from "@/_components/UserCard";
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,

} from "react-native";

export default function PerfilCliente() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const { user, signOut } = useAuth();


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

      {/* Botão de Sair */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              activeOpacity={0.7}
              onPress={signOut}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.logoutIconBadge}>
                  <Feather name="log-out" size={20} color="#EF4444" />
                </View>
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#EF4444" />
            </TouchableOpacity>

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
   menuItem: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#0F172A",
  },
  logoutItem: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    marginTop: 8,
    marginHorizontal: 20,
  },
  logoutIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#EF4444",
  },
});
