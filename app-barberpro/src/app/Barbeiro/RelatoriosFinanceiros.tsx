import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  pagamentoService,
  RelatorioFinanceiroDTO,
} from "@/services/pagamentoService";

export default function RelatoriosFinanceiros() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiroDTO | null>(
    null,
  );

  async function carregarRelatorio() {
    if (!user?.id) return;
    try {
      const data = await pagamentoService.obterRelatorioFinanceiro(user.id);
      setRelatorio(data);
    } catch (error) {
      console.error("Erro ao carregar relatório financeiro:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarRelatorio();
  }, [user?.id]);

  function onRefresh() {
    setRefreshing(true);
    carregarRelatorio();
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Target Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório Financeiro</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Card de Destaque - Faturamento do Mês */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Faturamento Este Mês</Text>
          <Text style={styles.mainCardValue}>
            {formatarMoeda(relatorio?.faturamentoMes || 0)}
          </Text>
          <View style={styles.mainCardFooter}>
            <Feather name="trending-up" size={16} color="#10B981" />
            <Text style={styles.mainCardFooterText}>
              Acumulado no mês corrente
            </Text>
          </View>
        </View>

        {/* Grid de Métricas Secundárias */}
        <View style={styles.gridContainer}>
          <View style={styles.miniCard}>
            <View style={styles.iconCircle}>
              <Feather name="dollar-sign" size={18} color={colors.primary} />
            </View>
            <Text style={styles.miniCardLabel}>Hoje</Text>
            <Text style={styles.miniCardValue}>
              {formatarMoeda(relatorio?.faturamentoHoje || 0)}
            </Text>
          </View>

          <View style={styles.miniCard}>
            <View style={styles.iconCircle}>
              <Feather name="calendar" size={18} color={colors.primary} />
            </View>
            <Text style={styles.miniCardLabel}>Este Ano</Text>
            <Text style={styles.miniCardValue}>
              {formatarMoeda(relatorio?.faturamentoAno || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.miniCard}>
            <View style={styles.iconCircle}>
              <Feather name="scissors" size={18} color={colors.primary} />
            </View>
            <Text style={styles.miniCardLabel}>Atendimentos</Text>
            <Text style={styles.miniCardValue}>
              {relatorio?.totalAtendimentos || 0}
            </Text>
          </View>

          <View style={styles.miniCard}>
            <View style={styles.iconCircle}>
              <Feather name="pie-chart" size={18} color={colors.primary} />
            </View>
            <Text style={styles.miniCardLabel}>Ticket Médio</Text>
            <Text style={styles.miniCardValue}>
              {formatarMoeda(relatorio?.ticketMedio || 0)}
            </Text>
          </View>
        </View>

        {/* Histórico de Entradas */}
        <Text style={styles.sectionTitle}>Histórico Recente</Text>

        {relatorio?.transacoesRecentes.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {relatorio?.transacoesRecentes.map((item) => (
              <View key={item.id} style={styles.transacaoCard}>
                <View style={styles.transacaoLeft}>
                  <View style={styles.transacaoIcon}>
                    <Feather name="check-circle" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.clienteNome}>{item.clienteNome}</Text>
                    <Text style={styles.servicoNome}>
                      {item.servicoNome} • {item.metodo}
                    </Text>
                  </View>
                </View>
                <View style={styles.transacaoRight}>
                  <Text style={styles.transacaoValor}>
                    + {formatarMoeda(item.valor)}
                  </Text>
                  <Text style={styles.transacaoData}>
                    {new Date(item.data).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCardLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#94A3B8",
  },
  mainCardValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#FFFFFF",
    marginVertical: 8,
  },
  mainCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  mainCardFooterText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#10B981",
  },
  gridContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  miniCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  miniCardLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#64748B",
  },
  miniCardValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 12,
  },
  listContainer: {
    gap: 10,
  },
  transacaoCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  transacaoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transacaoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  clienteNome: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#0F172A",
  },
  servicoNome: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#64748B",
  },
  transacaoRight: {
    alignItems: "flex-end",
  },
  transacaoValor: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#10B981",
  },
  transacaoData: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#94A3B8",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
  },
});
