import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeBarbeiro() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const { user } = useAuth();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "Barbeiro";

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Cabeçalho com Gradient no mesmo padrão do HomeCliente */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <StaggeredText text="Olá," style={styles.text1} />
              <StaggeredText text={primeiroNome} style={styles.text2} />
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitleText}>
            Resumo do seu dia na barbearia
          </Text>
        </LinearGradient>

        {/* Conteúdo Principal */}
        <View style={styles.body}>
          {/* Cards de Métricas */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Feather name="calendar" size={22} color={colors.primary} />
              <Text style={styles.metricValue}>08</Text>
              <Text style={styles.metricLabel}>Agendamentos</Text>
            </View>

            <View style={styles.metricCard}>
              <Feather name="dollar-sign" size={22} color="#10B981" />
              <Text style={styles.metricValue}>R$ 320</Text>
              <Text style={styles.metricLabel}>Faturamento</Text>
            </View>
          </View>

          {/* Seção de Próximos Atendimentos */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Clientes</Text>
          </View>

          <View style={styles.emptyContainer}>
            <Feather name="clock" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>
              Nenhum atendimento pendente para este horário.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  headerGradient: {
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  text1: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  text2: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  subtitleText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 10,
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Efeito translúcido idêntico ao botão de localização
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    paddingHorizontal: 24,
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#0F172A",
    marginTop: 12,
  },
  metricLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
  },
});