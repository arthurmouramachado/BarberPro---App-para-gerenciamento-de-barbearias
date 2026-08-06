import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; 
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../_components/Button";
import { colors } from "@/colors";

export default function SelectScreen() {
  const router = useRouter(); 
  const [perfilSelecionado, setPerfilSelecionado] = useState<"funcionario" | "dono" | null>(null);

  const handleContinuar = () => {
    if (perfilSelecionado === "funcionario") {
      router.push("./BuscarBarbearia"); 
    } else if (perfilSelecionado === "dono") {
      router.push("/CreateBarbershop");
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.background]} style={styles.container}>

      <Text style={styles.title}>Você já trabalha em uma barbearia?</Text>
      <Text style={styles.subtitle}>Escolha a opção que melhor descreve você</Text>

      <View style={styles.optionsContainer}>
        {/* CARD Funcionario */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPerfilSelecionado("funcionario")}
          style={[
            styles.card,
            perfilSelecionado === "funcionario" && styles.cardActive,
          ]}
        >
          <View style={styles.iconBadge}>
            <Feather name="user-plus" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sou Funcionário</Text>
            <Text style={styles.cardDescription}>
              Já trabalho em uma barbearia e quero gerenciar minha agenda e atendimentos
            </Text>
          </View>
        </TouchableOpacity>

        {/* CARD Dono */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPerfilSelecionado("dono")}
          style={[
            styles.card,
            perfilSelecionado === "dono" && styles.cardActive,
          ]}
        >
          <View style={styles.iconBadge}>
            <FontAwesome6 name="building" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sou Dono de Barbearia</Text>
            <Text style={styles.cardDescription}>
              Quero cadastrar minha barbearia e gerenciar todo o meu negócio, incluindo funcionários e serviços
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Botão agora possui o onPress configurado para avançar */}
      <Button
        label="Continuar"
        style={styles.button}
        isActive={perfilSelecionado !== null} 
        onPress={handleContinuar} // ADICIONADO
        icon={
          <Feather 
            name="arrow-right" 
            size={18} 
            color={perfilSelecionado !== null ? "#FFFFFF" : "#94A3B8"} 
          />
        }
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#155DFC",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    fontSize: 28,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,          // Cantos mais arredondados e modernos como no Figma
    paddingVertical: 24,        // Aumenta a altura interna vertical do card
    paddingHorizontal: 20,      // Espaçamento confortável nas laterais
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardActive: {
    borderColor: "#155DFC",
    borderWidth: 2,
  },
  iconBadge: {
    width: 56,                  // Quadrado do ícone ligeiramente maior
    height: 56,
    borderRadius: 16,           // Cantos do ícone acompanhando a suavidade do card
    backgroundColor: "#155DFC",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    fontSize: 18,               // Título com mais destaque
  },
  cardDescription: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 14,               // Fonte ligeiramente maior para melhor leitura
    marginTop: 6,               // Mais respiro entre o título e a descrição
    lineHeight: 20,             // Distância perfeita entre as linhas de texto
  },
button: {
    width: "90%",  // Faz o botão respeitar o padding horizontal da tela (24) e alinhar com os cards
    marginTop: 24,  // Espaçamento limpo entre o último card e o botão
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 15,
  },
  footerLink: {
    fontFamily: "Inter_700Bold",
    color: "#155DFC",
    fontSize: 15,
  },
});
