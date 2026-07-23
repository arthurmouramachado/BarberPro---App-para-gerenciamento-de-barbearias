import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

interface ProfileMenuProps extends TouchableOpacityProps {
  title: string;
  iconName: keyof typeof Feather.glyphMap;
}

export function ProfileMenuItem({ title, iconName, ...rest }: ProfileMenuProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} {...rest}>
      {/* Lado Esquerdo: Bolinha do Ícone + Título */}
      <View style={styles.leftContent}>
        <View style={styles.iconBox}>
          <Feather name={iconName} size={20} color="#155DFC" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Lado Direito: Setinha Fixa */}
      <AntDesign name="right" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    // Sombra do card
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF2FF", // Fundo azul bem clarinho
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
});