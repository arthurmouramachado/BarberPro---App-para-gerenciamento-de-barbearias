import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";

import { UserCard } from "@/_components/UserCard";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import { avaliacoesService } from "@/services/avaliacoes";
import { StaggeredText } from "@/_components/ui/AnimatedText";

export default function PerfilBarbeiro() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const { user, signOut } = useAuth();
  const router = useRouter();

  const [rating, setRating] = useState<string>("0.0");
  const [totalAvaliacoes, setTotalAvaliacoes] = useState<number>(0);
  const [carregandoRating, setCarregandoRating] = useState<boolean>(true);

  useEffect(() => {
    async function carregarRating() {
      if (!user?.id) {
        setCarregandoRating(false);
        return;
      }

      try {
        const resultado = await avaliacoesService.obterMediaBarbeiro(user.id);
        setRating(resultado.media);
        setTotalAvaliacoes(resultado.total);
      } catch (error) {
        console.error("Erro ao carregar rating do barbeiro:", error);
      } finally {
        setCarregandoRating(false);
      }
    }

    carregarRating();
  }, [user?.id]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header com Gradiente */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <StaggeredText text="Perfil Profissional" style={styles.headerTitle} />
        </LinearGradient>

        {/* Conteúdo Principal */}
        <View style={styles.content}>
          {/* UserCard do Barbeiro */}
          <View style={styles.userCardWrapper}>
            <UserCard />
          </View>

          {/* Card de Rating */}
          <View style={styles.statsContainer}>
            <View style={styles.ratingCard}>
              {carregandoRating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <View style={styles.ratingValueContainer}>
                    <Feather name="star" size={20} color="#F59E0B" />
                    <Text style={styles.ratingValue}>{rating}</Text>
                  </View>
                  <Text style={styles.ratingLabel}>
                    Rating ({totalAvaliacoes})
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Seção: Gestão do Negócio */}
          <Text style={styles.sectionTitle}>Gestão & Finanças</Text>
          <View style={styles.menuContainer}>
            {/* Relatórios Financeiros */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push("/Barbeiro/Relatorios")}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBadge}>
                  <Feather name="bar-chart-2" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Relatório Financeiro</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* Gestão de Serviços e Preços */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push("/Barbeiro/Servicos")}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBadge}>
                  <Feather name="scissors" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Serviços & Preços</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* Configuração de Horários */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push("/Barbeiro/HorariosTrabalho")}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBadge}>
                  <Feather name="clock" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Horários & Disponibilidade</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Seção: Conta e Ajustes */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Conta</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBadge}>
                  <Feather name="user" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Dados Profissionais</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBadge}>
                  <Feather name="settings" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Configurações Gerais</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -20,
  },
  userCardWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  ratingCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 110,
    minHeight: 65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#0F172A",
  },
  ratingLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 12,
  },
  menuContainer: {
    gap: 10,
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