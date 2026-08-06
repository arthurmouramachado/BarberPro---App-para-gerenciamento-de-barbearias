import React, { useState, useCallback, useMemo } from "react";
import {
  FlatList,
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
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useFocusEffect } from "expo-router";

import { colors } from "@/colors";
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { useAuth } from "@/contexts/AuthContext";
import { agendamentosService, AgendamentoDTO } from "@/services/agendamentosService";

interface DiaCarrossel {
  iso: string; // YYYY-MM-DD
  diaNumero: string;
  diaSemana: string;
  eHoje: boolean;
}

export default function AgendaBarbeiro() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const { user } = useAuth();

  // Função auxiliar para obter data local no formato YYYY-MM-DD
  const formatarDataIsoLocal = (date: Date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const hojeIso = formatarDataIsoLocal(new Date());

  const [dataSelecionada, setDataSelecionada] = useState<string>(hojeIso);
  const [agendamentos, setAgendamentos] = useState<AgendamentoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Gera os dias para o carrossel (3 dias passados e 14 dias futuros)
  const listaDias = useMemo<DiaCarrossel[]>(() => {
    const dias: DiaCarrossel[] = [];
    const hoje = new Date();

    for (let i = -3; i <= 14; i++) {
      const d = new Date();
      d.setDate(hoje.getDate() + i);

      const iso = formatarDataIsoLocal(d);
      const diaNumero = String(d.getDate()).padStart(2, "0");
      const diaSemana = d
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", "")
        .toUpperCase();

      dias.push({
        iso,
        diaNumero,
        diaSemana,
        eHoje: iso === hojeIso,
      });
    }

    return dias;
  }, [hojeIso]);

  // Busca agendamentos na API para a data selecionada
  const carregarAgendamentos = async () => {
    const barbeiroId = user?.barbeiroId || user?.id;

    if (!barbeiroId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await agendamentosService.buscarPorBarbeiro(
        barbeiroId,
        dataSelecionada
      );
      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarAgendamentos();
    }, [dataSelecionada])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarAgendamentos();
  };

  type AgendamentoStatus = AgendamentoDTO["status"];

  // Alteração de status com atualização otimista
  const executarAtualizacaoStatus = async (
    id: number,
    novoStatus: AgendamentoStatus
  ) => {
    try {
      await agendamentosService.atualizarStatus(id, novoStatus);
      setAgendamentos((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: novoStatus } : item
        )
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar o status do agendamento.");
    }
  };

  const handleAlterarStatus = (id: number, novoStatus: AgendamentoStatus) => {
    if (novoStatus === "CANCELADO") {
      Alert.alert("Cancelar Agendamento", "Deseja realmente cancelar este horário?", [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "destructive",
          onPress: () => executarAtualizacaoStatus(id, novoStatus),
        },
      ]);
      return;
    }
    executarAtualizacaoStatus(id, novoStatus);
  };

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
      {/* Header com Gradiente */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.headerGradient}
      >
        <StaggeredText text="Agenda do Barbeiro" style={styles.headerTitle} />
        <StaggeredText
          text="Gerencie seus horários e atendimentos"
          style={styles.headerSubtitle}
        />

        {/* Carrossel Horizontal de Datas */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={listaDias}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.iso}
            contentContainerStyle={styles.carouselContent}
            renderItem={({ item }) => {
              const estaSelecionado = item.iso === dataSelecionada;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.dayCard,
                    estaSelecionado && styles.dayCardSelected,
                  ]}
                  onPress={() => setDataSelecionada(item.iso)}
                >
                  <Text
                    style={[
                      styles.daySemanaText,
                      estaSelecionado && styles.daySemanaTextSelected,
                    ]}
                  >
                    {item.diaSemana}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumeroText,
                      estaSelecionado && styles.dayNumeroTextSelected,
                    ]}
                  >
                    {item.diaNumero}
                  </Text>

                  {item.eHoje && (
                    <View
                      style={[
                        styles.todayDot,
                        estaSelecionado && styles.todayDotSelected,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </LinearGradient>

      {/* Conteúdo Principal / Lista de Agendamentos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>
                Nenhum agendamento encontrado para este dia.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.timeBadge}>
                  <Feather name="clock" size={14} color={colors.primary} />
                  <Text style={styles.timeText}>
                    {formatarHora(item.hora_inicio)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusBadgeStyle(item.status).badge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStatusBadgeStyle(item.status).text,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.clientName}>
                  {item.clientes?.usuarios?.nome || "Cliente Não Identificado"}
                </Text>
                <Text style={styles.serviceName}>
                  {item.servicos?.nome || "Serviço"}
                </Text>
                <Text style={styles.priceText}>
                  R$ {Number(item.servicos?.preco || 0).toFixed(2)}
                </Text>
              </View>

              {/* Botões de Ação para horários ativos */}
              {item.status !== "CONCLUIDO" && item.status !== "CANCELADO" && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.btnActionSecondary}
                    onPress={() => handleAlterarStatus(item.id, "CANCELADO")}
                  >
                    <Feather name="x-circle" size={16} color="#EF4444" />
                    <Text style={styles.btnTextSecondary}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnActionPrimary}
                    onPress={() => handleAlterarStatus(item.id, "CONCLUIDO")}
                  >
                    <Feather name="check-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.btnTextPrimary}>Concluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "CONCLUIDO":
      return {
        badge: { backgroundColor: "#D1FAE5" },
        text: { color: "#059669" },
      };
    case "CANCELADO":
      return {
        badge: { backgroundColor: "#FEE2E2" },
        text: { color: "#EF4444" },
      };
    case "EM_ANDAMENTO":
      return {
        badge: { backgroundColor: "#FEF3C7" },
        text: { color: "#D97706" },
      };
    default:
      return {
        badge: { backgroundColor: "#DBEAFE" },
        text: { color: "#2563EB" },
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
    marginBottom: 16,
  },
  carouselContainer: {
    marginTop: 8,
  },
  carouselContent: {
    gap: 10,
    paddingRight: 10,
  },
  dayCard: {
    width: 60,
    height: 75,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayCardSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  daySemanaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  daySemanaTextSelected: {
    color: colors.primary,
  },
  dayNumeroText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 2,
  },
  dayNumeroTextSelected: {
    color: "#0F172A",
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginTop: 4,
  },
  todayDotSelected: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 24,
    paddingBottom: 40,
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
    marginTop: 20,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  cardBody: {
    marginBottom: 12,
  },
  clientName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
  },
  serviceName: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  priceText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#0F172A",
    marginTop: 6,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  btnActionSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  btnTextSecondary: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#EF4444",
  },
  btnActionPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  btnTextPrimary: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
});