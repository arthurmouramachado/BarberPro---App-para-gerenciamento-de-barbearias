import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
  ActivityIndicator,
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
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  agendamentosService,
  AgendamentoDTO,
} from "@/services/agendamentosService";
import { barbeiroService } from "@/services/barbeiroService";
import { barbeariaService } from "@/services/barbeariaService";

type StatusAgendamento =
  | "PENDENTE"
  | "CONFIRMADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

export default function HomeBarbeiro() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<AgendamentoDTO[]>([]);
  const [nomeBarbearia, setNomeBarbearia] = useState<string>("");

  // Obtém a data de hoje no formato YYYY-MM-DD
  const formatarDataIsoLocal = (date: Date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const hojeIso = formatarDataIsoLocal(new Date());

  // Data formatada para exibição (ex: "03 Set")
  const dataFormatadaHoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  }).replace(".", "");

  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "Barbeiro";

  // ============================================
  // CARREGAR DADOS DA API
  // ============================================
  const carregarDados = useCallback(async () => {
    const barbeiroId = user?.barbeiroId || user?.id;

    try {
      // 1. Carrega dados da barbearia associada
      if (barbeiroId) {
        try {
          const dadosBarbeiro = await barbeiroService.buscarPorId(
            String(barbeiroId)
          );

          const barbeariaId = dadosBarbeiro?.barbearia_id || (user as any)?.barbeariaId;

          if (barbeariaId) {
            try {
              const dadosBarbearia = await barbeariaService.buscarPorId(barbeariaId);
              if (dadosBarbearia?.nome) {
                setNomeBarbearia(dadosBarbearia.nome);
              }
            } catch (err) {
              // Fallback: busca na lista completa
              const todas = await barbeariaService.listarTodas();
              const encontrada = todas.find((b) => b.id === barbeariaId);
              if (encontrada?.nome) {
                setNomeBarbearia(encontrada.nome);
              }
            }
          } else {
            // Se for ADMIN ou dono sem barbearia_id no model de barbeiro, tenta achar a primeira barbearia ou do usuário
            try {
              const todas = await barbeariaService.listarTodas();
              if (todas && todas.length > 0) {
                // Caso haja barbearia cadastrada
                setNomeBarbearia(todas[0].nome);
              }
            } catch (err) {
              console.warn("Erro ao buscar barbearias gerais:", err);
            }
          }
        } catch (err) {
          console.warn("Erro ao buscar dados da barbearia do barbeiro:", err);
        }
      }

      // 2. Carrega agendamentos de hoje
      if (barbeiroId) {
        const dadosAgendamentos = await agendamentosService.buscarPorBarbeiro(
          barbeiroId,
          hojeIso
        );
        setAgendamentos(dadosAgendamentos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da HomeBarbeiro:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.barbeiroId, user?.id, hojeIso]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  // ============================================
  // ATUALIZAÇÃO DE STATUS
  // ============================================
  const executarAtualizacaoStatus = async (
    id: number,
    novoStatus: StatusAgendamento
  ) => {
    try {
      await agendamentosService.atualizarStatus(id, novoStatus);
      setAgendamentos((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: novoStatus } : item
        )
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status do agendamento.");
    }
  };

  const handleAlterarStatus = (
    id: number,
    novoStatus: StatusAgendamento
  ) => {
    if (novoStatus === "CANCELADO") {
      Alert.alert(
        "Cancelar Agendamento",
        "Deseja realmente cancelar este atendimento?",
        [
          {
            text: "Não",
            style: "cancel",
          },
          {
            text: "Sim",
            style: "destructive",
            onPress: () => executarAtualizacaoStatus(id, novoStatus),
          },
        ]
      );
      return;
    }

    executarAtualizacaoStatus(id, novoStatus);
  };

  // ============================================
  // MÉTRICAS
  // ============================================
  const totalAgendamentos = agendamentos.filter(
    (a) => a.status !== "CANCELADO"
  ).length;

  const faturamentoHoje = agendamentos
    .filter(
      (a) =>
        a.status === "CONCLUIDO" ||
        a.status === "CONFIRMADO" ||
        a.status === "EM_ANDAMENTO"
    )
    .reduce(
      (acc, curr) => acc + Number(curr.servicos?.preco || 0),
      0
    );

  // ============================================
  // FORMATAÇÃO DA HORA
  // ============================================
  const formatarHora = (dataIso: string) => {
    if (!dataIso) return "--:--";

    const d = new Date(dataIso);
    if (isNaN(d.getTime())) {
      // Caso venha apenas hora como "09:00:00"
      return dataIso.substring(0, 5);
    }

    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* ============================================
            CABEÇALHO
        ============================================ */}

        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <StaggeredText
                text="Olá,"
                style={styles.text1}
              />

              <StaggeredText
                text={primeiroNome}
                style={styles.text2}
              />
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Feather
                name="bell"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Tag com o nome da Barbearia do Barbeiro */}
          {nomeBarbearia ? (
            <View style={styles.barbeariaTag}>
              <Feather name="scissors" size={14} color="#FFFFFF" />
              <Text style={styles.barbeariaTagText}>
                {nomeBarbearia}
              </Text>
            </View>
          ) : null}

          <StaggeredText
            text={
              nomeBarbearia
                ? `Resumo do seu dia na ${nomeBarbearia}`
                : "Resumo do seu dia na barbearia"
            }
            style={styles.subtitleText}
          />
        </LinearGradient>

        {/* ============================================
            CONTEÚDO
        ============================================ */}

        <View style={styles.body}>

          {/* ============================================
              MÉTRICAS
          ============================================ */}

          <View style={styles.metricsContainer}>

            {/* AGENDAMENTOS */}

            <View style={styles.metricCard}>
              <Feather
                name="calendar"
                size={22}
                color={colors.primary}
              />

              <Text style={styles.metricValue}>
                {String(totalAgendamentos).padStart(2, "0")}
              </Text>

              <Text style={styles.metricLabel}>
                Agendamentos Hoje
              </Text>
            </View>

            {/* FATURAMENTO */}

            <View style={styles.metricCard}>
              <Feather
                name="dollar-sign"
                size={22}
                color="#10B981"
              />

              <Text style={styles.metricValue}>
                R$ {faturamentoHoje.toFixed(0)}
              </Text>

              <Text style={styles.metricLabel}>
                Faturamento Estimado
              </Text>
            </View>

          </View>

          {/* ============================================
              AGENDA
          ============================================ */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Agenda de Hoje
            </Text>

            <Text style={styles.sectionDate}>
              {dataFormatadaHoje}
            </Text>
          </View>

          {/* ============================================
              LISTA DE AGENDAMENTOS
          ============================================ */}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando agenda...</Text>
            </View>
          ) : agendamentos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Sem agendamentos para hoje</Text>
              <Text style={styles.emptySubtitle}>
                Quando novos clientes agendarem horários com você, eles aparecerão aqui.
              </Text>
            </View>
          ) : (
            agendamentos.map((item) => (
              <View
                key={item.id}
                style={styles.cardAgendamento}
              >
                {/* HEADER DO CARD */}

                <View style={styles.cardHeader}>
                  <View style={styles.clientContainer}>

                    <View style={styles.clientIcon}>
                      <Feather
                        name="user"
                        size={18}
                        color={colors.primary}
                      />
                    </View>

                    <View>
                      <Text style={styles.clienteNome}>
                        {item.clientes?.usuarios?.nome ||
                          "Cliente"}
                      </Text>

                      <Text style={styles.horarioText}>
                        {formatarHora(item.hora_inicio || item.horario)}
                      </Text>
                    </View>

                  </View>
                </View>

                {/* SERVIÇO */}

                <View style={styles.serviceRow}>
                  <Feather
                    name="scissors"
                    size={17}
                    color="#64748B"
                  />

                  <Text style={styles.servicoNome}>
                    {item.servicos?.nome || "Serviço"}
                  </Text>

                  <Text style={styles.preco}>
                    R$ {Number(
                      item.servicos?.preco || 0
                    ).toFixed(2).replace(".", ",")}
                  </Text>
                </View>

                {/* FOOTER */}

                <View style={styles.cardFooter}>

                  <Text
                    style={[
                      styles.statusBadge,
                      getStatusStyle(item.status),
                    ]}
                  >
                    {formatarStatus(item.status)}
                  </Text>

                  {/* AÇÕES */}

                  <View style={styles.actionsRow}>

                    {item.status !== "CONCLUIDO" &&
                      item.status !== "CANCELADO" && (
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            styles.btnConcluir,
                          ]}
                          onPress={() =>
                            handleAlterarStatus(
                              item.id,
                              "CONCLUIDO"
                            )
                          }
                        >
                          <Feather
                            name="check"
                            size={16}
                            color="#FFF"
                          />
                        </TouchableOpacity>
                      )}

                    {item.status !== "CANCELADO" &&
                      item.status !== "CONCLUIDO" && (
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            styles.btnCancelar,
                          ]}
                          onPress={() =>
                            handleAlterarStatus(
                              item.id,
                              "CANCELADO"
                            )
                          }
                        >
                          <Feather
                            name="x"
                            size={16}
                            color="#FFF"
                          />
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

// ============================================
// STATUS
// ============================================

const formatarStatus = (status: StatusAgendamento) => {
  switch (status) {
    case "CONCLUIDO":
      return "Concluído";

    case "CANCELADO":
      return "Cancelado";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "CONFIRMADO":
      return "Confirmado";

    case "PENDENTE":
      return "Pendente";

    default:
      return status;
  }
};

const getStatusStyle = (status: StatusAgendamento) => {
  switch (status) {
    case "CONCLUIDO":
      return {
        color: "#10B981",
        backgroundColor: "#D1FAE5",
      };

    case "CANCELADO":
      return {
        color: "#EF4444",
        backgroundColor: "#FEE2E2",
      };

    case "EM_ANDAMENTO":
      return {
        color: "#F59E0B",
        backgroundColor: "#FEF3C7",
      };

    case "CONFIRMADO":
      return {
        color: "#3B82F6",
        backgroundColor: "#DBEAFE",
      };

    default:
      return {
        color: "#64748B",
        backgroundColor: "#F1F5F9",
      };
  }
};

// ============================================
// ESTILOS
// ============================================

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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },

  sectionDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#64748B",
  },

  cardAgendamento: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 5,

    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  clientContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  clientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  clienteNome: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
  },

  horarioText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },

  servicoNome: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#64748B",
  },

  preco: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#0F172A",
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
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },

  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  btnConcluir: {
    backgroundColor: "#10B981",
  },

  btnCancelar: {
    backgroundColor: "#EF4444",
  },

  barbeariaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },

  barbeariaTagText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#64748B",
  },

  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    gap: 8,
  },

  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
    marginTop: 6,
  },

  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
});