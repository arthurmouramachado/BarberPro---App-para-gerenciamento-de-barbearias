import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router"; // IMPORTADO O USEROUTER
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../_components/Button";
import { userService } from "@/services/userService";

export default function SelectScreen() {
  const router = useRouter(); 
  const [perfilSelecionado, setPerfilSelecionado] = useState<"cliente" | "barbeiro" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { nome, email, telefone, senha, data_nascimento } = useLocalSearchParams();

  const handleContinuar = async () => {
    
    if (perfilSelecionado === "cliente") {
      const payload = {
        nome,
        email,
        telefone,
        senha,
        data_nascimento,
        funcao: "CLIENTE", 
      };
      
      try {
        setIsLoading(true)
        await userService.criarUser(payload)

        Alert.alert("Sucesso!", "Conta criada com sucesso!");
        
        router.replace("./LoginScreen");
      } catch(error: any) {
          Alert.alert("Erro no cadastro", error.response?.data?.message || "Ocorreu um erro ao criar a conta.");
      } finally {
          setIsLoading(false);
      }
    } else if (perfilSelecionado === "barbeiro") {
      router.push({
        pathname: "/SelectBarber",
        params: { nome, email, telefone, senha, data_nascimento, funcao: "BARBEIRO" },
      });
    }
  };

  return (
    <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.container}>
      <LinearGradient colors={["#155DFC", "#3B82F6"]} style={styles.logoBadge}>
        <Feather name="scissors" size={40} color="#FFFFFF" />
      </LinearGradient>

      <Text style={styles.title}>Escolha seu Perfil</Text>
      <Text style={styles.subtitle}>Como você deseja usar o BarberPro?</Text>

      <View style={styles.optionsContainer}>
        {/* CARD CLIENTE */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPerfilSelecionado("cliente")}
          style={[
            styles.card,
            perfilSelecionado === "cliente" && styles.cardActive,
          ]}
        >
          <View style={styles.iconBadge}>
            <FontAwesome5 name="user-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sou Cliente</Text>
            <Text style={styles.cardDescription}>
              Quero agendar cortes de cabelo e barba nas melhores barbearias da cidade
            </Text>
          </View>
        </TouchableOpacity>

        {/* CARD BARBEIRO */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setPerfilSelecionado("barbeiro")}
          style={[
            styles.card,
            perfilSelecionado === "barbeiro" && styles.cardActive,
          ]}
        >
          <View style={styles.iconBadge}>
            <Feather name="scissors" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sou Barbeiro</Text>
            <Text style={styles.cardDescription}>
              Quero gerenciar minha agenda, atendimentos e crescer meu negócio
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      
      <Button
        label={isLoading ? "Cadastrando..." : "Continuar"}
        style={styles.button}
        isActive={perfilSelecionado !== null && !isLoading} 
        onPress={handleContinuar} 
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
