import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useFocusEffect } from "expo-router";
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import { agendamentosService, AgendamentoDTO } from "@/services/agendamentosService";

export default function HomeBarbeiro() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const { user } = useAuth();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "Barbeiro";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agendamentos, setAgendamentos] = useState<AgendamentoDTO[]>([]);

  // Formata data atual YYYY-MM-DD
  const dataHoje = new Date().toISOString().split("T")[0];

  const carregarAgendamentos = async () => {
    const barbeiroId = user?.barbeiroId || user?.id;

    if (!barbeiroId) {
      setLoading(false);
      return;
    }

    try {
      const data = await agendamentosService.buscarPorBarbeiro(barbeiroId, dataHoje);
      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao carregar agendamentos do dia:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarAgendamentos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarAgendamentos();
  };

  const handleAlterarStatus = async (id: number, novoStatus: string) => {
    try {
      await agendamentosService.atualizarStatus(id, novoStatus);
      carregarAgendamentos();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status do agendamento.");
    }
  };

  // Cálculos dinâmicos
  const totalAgendamentos = agendamentos.filter((a) => a.status !== "CANCELADO").length;
  const faturamentoHoje = agendamentos
    .filter((a) => a.status === "CONCLUIDO" || a.status === "CONFIRMADO")
    .reduce((acc, curr) => acc + Number(curr.servicos?.preco || 0), 0);

  const formatarHora = (dataIso: string) => {
    if (!dataIso) return "--:--";
    const d = new Date(dataIso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Cabeçalho */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <StaggeredText text="Olá," style={styles.text1} />
              <StaggeredText text={primeiroNome} style={styles.text2} />
            </View>

            <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
              <Feather name="bell" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <StaggeredText text="Resumo do seu dia na barbearia" style={styles.subtitleText} />
        </LinearGradient>

        {/* Conteúdo Principal */}
        <View style={styles.body}>
          {/* Métricas Dinâmicas */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Feather name="calendar" size={22} color={colors.primary} />
              <Text style={styles.metricValue}>
                {String(totalAgendamentos).padStart(2, "0")}
              </Text>
              <Text style={styles.metricLabel}>Agendamentos Hoje</Text>
            </View>

            <View style={styles.metricCard}>
              <Feather name="dollar-sign" size={22} color="#10B981" />
              <Text style={styles.metricValue}>R$ {faturamentoHoje.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Faturamento Estimado</Text>
            </View>
          </View>

          {/* Seção Próximos Clientes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : agendamentos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="clock" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>
                Nenhum atendimento agendado para hoje.
              </Text>
            </View>
          ) : (
            agendamentos.map((item) => (
              <View key={item.id} style={styles.cardAgendamento}>
                <View style={styles.cardHeader}>
                  <Text style={styles.clienteNome}>
                    {item.clientes?.usuarios?.nome || "Cliente Não Identificado"}
                  </Text>
                  <Text style={styles.horarioText}>
                    {formatarHora(item.hora_inicio)}
                  </Text>
                </View>

                <Text style={styles.servicoNome}>
                  {item.servicos?.nome || "Serviço"} • R$ {Number(item.servicos?.preco || 0).toFixed(2)}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    {item.status}
                  </Text>

                  {/* Ações do Card */}
                  <View style={styles.actionsRow}>
                    {item.status !== "CONCLUIDO" && item.status !== "CANCELADO" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.btnConcluir]}
                        onPress={() => handleAlterarStatus(item.id, "CONCLUIDO")}
                      >
                        <Feather name="check" size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}

                    {item.status !== "CANCELADO" && item.status !== "CONCLUIDO" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.btnCancelar]}
                        onPress={() => handleAlterarStatus(item.id, "CANCELADO")}
                      >
                        <Feather name="x" size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "CONCLUIDO":
      return { color: "#10B981", backgroundColor: "#D1FAE5" };
    case "CANCELADO":
      return { color: "#EF4444", backgroundColor: "#FEE2E2" };
    case "EM_ANDAMENTO":
      return { color: "#F59E0B", backgroundColor: "#FEF3C7" };
    default:
      return { color: "#3B82F6", backgroundColor: "#DBEAFE" };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: 30 },
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
  text1: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  text2: { color: "#FFFFFF", fontSize: 30, fontFamily: "Inter_700Bold" },
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: { paddingHorizontal: 24 },
  metricsContainer: { flexDirection: "row", gap: 16, marginBottom: 28 },
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
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#0F172A" },
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
  cardAgendamento: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clienteNome: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#0F172A" },
  horarioText: { fontFamily: "Inter_700Bold", fontSize: 14, color: colors.primary },
  servicoNome: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  statusBadge: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnConcluir: { backgroundColor: "#10B981" },
  btnCancelar: { backgroundColor: "#EF4444" },
});