import Feather from "@expo/vector-icons/Feather";

import { LinearGradient } from "expo-linear-gradient";

import { useFocusEffect, useRouter } from "expo-router";

import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SegmentedControl from "@react-native-segmented-control/segmented-control";

import { colors } from "@/colors";

import { useAuth } from "@/contexts/AuthContext";

import {
  agendamentosService,
} from "@/services/agendamentosService";

import {
  barbeiroService,
} from "@/services/barbeiroService";

import {
  ehPlanoPelaDescricao,
} from "@/utils/planoNoFront";


// =====================================================
// INTERFACES
// =====================================================

interface AtendimentoFinanceiro {
  id: number;

  clienteNome: string;

  servicoNome: string;

  tipo: "Plano" | "Serviço avulso";

  valor: number;

  data: string;
}

interface RelatorioMes {
  faturamentoMes: number;

  totalAtendimentos: number;

  transacoesRecentes: AtendimentoFinanceiro[];
}


// =====================================================
// COMPONENTE
// =====================================================

export default function RelatoriosFinanceiros() {

  const router = useRouter();

  const { user } = useAuth();

  // =====================================================
  // IDENTIFICAÇÃO DO USUÁRIO
  // =====================================================

  const ehAdministrador =
    String(user?.funcao ?? "")
      .trim()
      .toUpperCase() === "ADMIN";

  const barbeiroId = user?.barbeiroId;

  // 0 = Meu faturamento
  // 1 = Faturamento da barbearia

  const [selectedIndex, setSelectedIndex] = useState(0);


  // =====================================================
  // ESTADOS
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  const [relatorio, setRelatorio] =
    useState<RelatorioMes | null>(null);

  const requisicaoAtual = useRef(0);


  // =====================================================
  // CARREGAR RELATÓRIO
  // =====================================================

  const carregarRelatorio = useCallback(
    async (atualizacaoManual = false) => {

      const numeroRequisicao = ++requisicaoAtual.current;

      setErro(null);

      if (!barbeiroId) {

        setRelatorio(null);

        setErro(
          "Perfil de barbeiro não encontrado. Entre novamente na sua conta."
        );

        setLoading(false);

        setRefreshing(false);

        return;
      }

      try {

        if (!atualizacaoManual) {
          setLoading(true);
        }

        // ============================================
        // IDENTIFICAR QUAIS BARBEIROS SERÃO CONSULTADOS
        // ============================================

        let idsBarbeiros: number[] = [
          Number(barbeiroId),
        ];

        // Se for administrador e selecionar Barbearia,
        // busca a equipe vinculada à barbearia dele.

        if (ehAdministrador && selectedIndex === 1) {

          const equipe =
            await barbeiroService.listarEquipeAdmin();

          const idsEquipe = equipe.map(
            (barbeiro) => Number(barbeiro.id)
          );

          // Inclui o próprio administrador e evita
          // identificadores repetidos.

          idsBarbeiros = [
            ...new Set([
              Number(barbeiroId),
              ...idsEquipe,
            ]),
          ];

        }

        // ============================================
        // BUSCAR AGENDAMENTOS
        // ============================================

        const respostas = await Promise.all(

          idsBarbeiros.map(
            (id) =>
              agendamentosService.buscarPorBarbeiro(id)
          )

        );

        if (
          numeroRequisicao !== requisicaoAtual.current
        ) {
          return;
        }

        const todosAgendamentos = respostas.flat();


        // ============================================
        // IDENTIFICAR O MÊS ATUAL
        // ============================================

        const hoje = new Date();

        const mesAtual = [
          hoje.getFullYear(),

          String(
            hoje.getMonth() + 1
          ).padStart(2, "0"),

        ].join("-");


        // ============================================
        // FILTRAR AGENDAMENTOS DO MÊS
        // ============================================

        const agendamentosDoMes =
          todosAgendamentos.filter((agendamento) => {

            const dataAgendamento =
              String(agendamento.data).slice(0, 7);

            const status =
              String(agendamento.status)
                .trim()
                .toUpperCase();

            const statusValido = [
              "CONFIRMADO",
              "EM_ANDAMENTO",
              "CONCLUIDO",
            ].includes(status);

            return (
              dataAgendamento === mesAtual &&
              statusValido
            );

          });


        // ============================================
        // CALCULAR FATURAMENTO DO MÊS
        // ============================================

        const faturamentoMes =
          agendamentosDoMes.reduce(
            (total, agendamento) => {

              const valor = Number(
                agendamento.servicos?.preco || 0
              );

              return total + valor;

            },
            0
          );


        // ============================================
        // MONTAR HISTÓRICO DO MÊS
        // ============================================

        const transacoesRecentes:
          AtendimentoFinanceiro[] =
          agendamentosDoMes.map((agendamento) => {

            const ehPlano =
              ehPlanoPelaDescricao(
                agendamento.servicos?.descricao
              );

            return {

              id: agendamento.id,

              clienteNome:
                agendamento.clientes?.usuarios?.nome ||
                "Cliente não identificado",

              servicoNome:
                agendamento.servicos?.nome ||
                "Serviço não identificado",

              tipo: ehPlano
                ? "Plano"
                : "Serviço avulso",

              valor: Number(
                agendamento.servicos?.preco || 0
              ),

              data: String(agendamento.data),

            };

          });


        // Mais recentes primeiro.

        transacoesRecentes.sort(
          (a, b) =>
            b.data.localeCompare(a.data)
        );


        // ============================================
        // ATUALIZAR ESTADO
        // ============================================

        setRelatorio({

          faturamentoMes,

          totalAtendimentos:
            agendamentosDoMes.length,

          transacoesRecentes,

        });


      } catch (error: any) {

        if (
          numeroRequisicao !== requisicaoAtual.current
        ) {
          return;
        }

        console.error(
          "Erro ao carregar relatório financeiro:",
          error?.response?.data ||
          error?.message
        );

        setRelatorio(null);

        setErro(
          "Não foi possível carregar o relatório financeiro."
        );

      } finally {

        if (
          numeroRequisicao === requisicaoAtual.current
        ) {

          setLoading(false);

          setRefreshing(false);

        }

      }

    },
    [
      barbeiroId,
      ehAdministrador,
      selectedIndex,
    ]
  );


  // =====================================================
  // ATUALIZAR AO ENTRAR NA TELA OU TROCAR O SWITCH
  // =====================================================

  useFocusEffect(
    useCallback(() => {

      void carregarRelatorio();

      return () => {

        requisicaoAtual.current += 1;

      };

    }, [carregarRelatorio])
  );


  // =====================================================
  // ATUALIZAÇÃO MANUAL
  // =====================================================

  function onRefresh() {

    setRefreshing(true);

    void carregarRelatorio(true);

  }


  // =====================================================
  // FORMATAÇÃO
  // =====================================================

  function formatarMoeda(valor: number) {

    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

  }


  function formatarData(data: string) {

    const dataIso =
      String(data).slice(0, 10);

    const [ano, mes, dia] =
      dataIso.split("-");

    return `${dia}/${mes}/${ano}`;

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

      </View>

    );

  }


  // =====================================================
  // INTERFACE
  // =====================================================

  return (

    <View style={styles.container}>

      {/* HEADER ORIGINAL COM GRADIENTE */}

      <LinearGradient
        colors={[
          colors.primary,
          colors.secondary
        ]}
        style={styles.headerGradient}
      >

        <View style={styles.headerRow}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >

            <Feather
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />

          </TouchableOpacity>

          <Text style={styles.headerTitle}>

            Relatório Financeiro

          </Text>

        </View>


        {/* SWITCH EXCLUSIVO DO ADMINISTRADOR */}

        {ehAdministrador && (

          <SegmentedControl

            values={[
              "Meu faturamento",
              "Barbearia",
            ]}

            selectedIndex={selectedIndex}

            onChange={(event) => {

              setSelectedIndex(
                event.nativeEvent.selectedSegmentIndex
              );

            }}

            tintColor="#FFFFFF"

            fontStyle={{
              color: "#FFFFFF",
              fontFamily: "Inter_700Bold",
            }}

            activeFontStyle={{
              color: "#155DFC",
              fontFamily: "Inter_700Bold",
            }}

            style={styles.switch}

          />

        )}

      </LinearGradient>


      {/* CONTEÚDO */}

      <ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={styles.scrollContent}

        refreshControl={

          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />

        }

      >


        {/* MENSAGEM DE ERRO */}

        {erro ? (

          <View style={styles.emptyState}>

            <Feather
              name="alert-circle"
              size={32}
              color="#EF4444"
            />

            <Text style={styles.emptyText}>

              {erro}

            </Text>

          </View>

        ) : (

          <>

            {/* CARD PRINCIPAL ORIGINAL */}

            <View style={styles.mainCard}>

              <Text style={styles.mainCardLabel}>

                {ehAdministrador && selectedIndex === 1
                  ? "Faturamento da Barbearia"
                  : "Faturamento Este Mês"}

              </Text>

              <Text style={styles.mainCardValue}>

                {formatarMoeda(
                  relatorio?.faturamentoMes || 0
                )}

              </Text>

              <View style={styles.mainCardFooter}>

                <Feather
                  name="trending-up"
                  size={16}
                  color="#10B981"
                />

                <Text style={styles.mainCardFooterText}>

                  Acumulado no mês corrente

                </Text>

              </View>

            </View>


            <View style={styles.gridContainer}>

              <View style={styles.miniCard}>

                <View style={styles.iconCircle}>

                  <Feather
                    name="scissors"
                    size={18}
                    color={colors.primary}
                  />

                </View>

                <Text style={styles.miniCardLabel}>

                  Atendimentos no mês

                </Text>

                <Text style={styles.miniCardValue}>

                  {relatorio?.totalAtendimentos || 0}

                </Text>

              </View>

            </View>


            <Text style={styles.sectionTitle}>

              Histórico Recente

            </Text>


            {!relatorio?.transacoesRecentes.length ? (

              <View style={styles.emptyState}>

                <Feather
                  name="inbox"
                  size={32}
                  color="#94A3B8"
                />

                <Text style={styles.emptyText}>

                  Nenhum atendimento encontrado neste mês

                </Text>

              </View>

            ) : (

              <View style={styles.listContainer}>

                {relatorio.transacoesRecentes.map(
                  (item) => (

                    <View
                      key={item.id}
                      style={styles.transacaoCard}
                    >

                      <View style={styles.transacaoLeft}>

                        <View style={styles.transacaoIcon}>

                          <Feather
                            name="check-circle"
                            size={20}
                            color="#10B981"
                          />

                        </View>


                        <View style={styles.transacaoTextos}>

                          <Text
                            style={styles.clienteNome}
                            numberOfLines={2}
                          >

                            {item.clienteNome}

                          </Text>


                          <Text
                            style={styles.servicoNome}
                            numberOfLines={2}
                          >

                            {item.servicoNome} • {item.tipo}

                          </Text>

                        </View>

                      </View>

                      <View style={styles.transacaoRight}>

                        <Text
                          style={styles.transacaoValor}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                        >

                          + {formatarMoeda(item.valor)}

                        </Text>

                        <Text style={styles.transacaoData}>

                          {formatarData(item.data)}

                        </Text>

                      </View>

                    </View>

                  )
                )}

              </View>

            )}

          </>

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

    borderBottomLeftRadius: 20,

    borderBottomRightRadius: 20,

  },


  headerRow: {

    flexDirection: "row",

    alignItems: "center",

  },


  backButton: {

    padding: 8,

    marginRight: 12,

  },


  headerTitle: {

    fontFamily: "Inter_700Bold",

    fontSize: 20,

    color: "#FFFFFF",

    flexShrink: 1,

  },


  switch: {

    backgroundColor:
      "rgba(252, 251, 251, 0.2)",

    height: 40,

    marginTop: 20,

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

    shadowOffset: {
      width: 0,
      height: 4
    },

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

    alignItems: "center",

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

    gap: 10,

    borderWidth: 1,

    borderColor: "#E2E8F0",

  },


  transacaoLeft: {

    flex: 1,

    minWidth: 0,

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


  transacaoTextos: {

    flex: 1,

    minWidth: 0,

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

    marginTop: 3,

  },


  transacaoRight: {

    alignItems: "flex-end",

    flexShrink: 0,

    maxWidth: "42%",

  },


  transacaoValor: {

    fontFamily: "Inter_700Bold",

    fontSize: 14,

    color: "#10B981",

    textAlign: "right",

  },


  transacaoData: {

    fontFamily: "Inter_400Regular",

    fontSize: 11,

    color: "#94A3B8",

    marginTop: 3,

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

    textAlign: "center",

  },

});