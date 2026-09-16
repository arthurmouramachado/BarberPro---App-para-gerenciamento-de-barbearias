import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { useRouter } from "expo-router";

import { Button } from "@/_components/Button";
import { ModalPix } from "@/_components/ModalPix";
import { useAuth } from "@/contexts/AuthContext";
import { useAgendamento } from "@/contexts/AgendamentoContext";
import { barbeiroService, BarbeiroDTO } from "@/services/barbeiroService";
import { servicosService, ServicoDTO } from "@/services/servicosService";
import { agendamentosService } from "@/services/agendamentosService";
import { clienteService } from "@/services/clienteService";

import { ptBR } from "@/utils/localeCalendarConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ======================================================
// CONFIGURAÇÃO DO CALENDÁRIO
// ======================================================
LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

export default function AgendarServico() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // ====================================================
  // CONTEXTO DE AGENDAMENTO
  // ====================================================
  const {
    barbeiroId: barbeiroIdContexto,
    barbeariaId,
    servicoId: servicoIdContexto,
    planoId: planoIdContexto,
    selecionarBarbeiro,
    selecionarData,
    dataSelecionada: dataSelecionadaContexto,
  } = useAgendamento();

  const exigePagamentoPix = planoIdContexto != null;

  const hojeString = new Date().toISOString().split("T")[0];

  // ====================================================
  // ESTADOS DA TELA (SOMENTE DADOS DA API)
  // ====================================================
  const [barbeiros, setBarbeiros] = useState<BarbeiroDTO[]>([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<number | null>(
    barbeiroIdContexto || null
  );

  const [servicoApi, setServicoApi] = useState<ServicoDTO | null>(null);
  const [clienteIdReal, setClienteIdReal] = useState<number | null>(user?.clienteId || null);

  const [dataSelecionada, setDataSelecionada] = useState<string>(
    dataSelecionadaContexto || hojeString
  );

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Estados de Carregamento
  const [isLoadingBarbeiros, setIsLoadingBarbeiros] = useState(true);
  const [isLoadingServico, setIsLoadingServico] = useState(false);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Pix e Agendamento Criado
  const [modalVisible, setModalVisible] = useState(false);
  const [agendamentoCriado, setAgendamentoCriado] = useState<{
    id: number;
    valor: number;
    nomeServico: string;
  } | null>(null);

  // ====================================================
  // 1. RESOLVER CLIENTE ID (SE NÃO ESTIVER NO TOKEN)
  // ====================================================
  useEffect(() => {
    async function resolverCliente() {
      if (user?.clienteId) {
        setClienteIdReal(user.clienteId);
        return;
      }

      if (user?.id) {
        try {
          const todosClientes = await clienteService.listarTodos();
          if (Array.isArray(todosClientes)) {
            const clienteEncontrado = todosClientes.find(
              (c: any) => c.usuario_id === user.id || c.usuarioId === user.id || c.id === user.id
            );
            if (clienteEncontrado) {
              setClienteIdReal(clienteEncontrado.id);
            } else {
              setClienteIdReal(user.id);
            }
          }
        } catch {
          setClienteIdReal(user.id);
        }
      }
    }

    resolverCliente();
  }, [user]);

  // ====================================================
  // 2. CARREGAR BARBEIROS DA API
  // ====================================================
  useEffect(() => {
    async function carregarBarbeiros() {
      setIsLoadingBarbeiros(true);
      try {
        const idBarbearia = barbeariaId || 1;
        const lista = await barbeiroService.listarPorBarbearia(idBarbearia);
        if (Array.isArray(lista)) {
          setBarbeiros(lista);
          if (lista.length > 0 && !barbeiroSelecionado) {
            setBarbeiroSelecionado(lista[0].id);
            selecionarBarbeiro(lista[0].id);
          }
        } else {
          setBarbeiros([]);
        }
      } catch (error: any) {
        console.error("Erro ao carregar barbeiros da API:", error?.message);
        Alert.alert("Erro", "Não foi possível carregar os barbeiros da barbearia.");
      } finally {
        setIsLoadingBarbeiros(false);
      }
    }

    carregarBarbeiros();
  }, [barbeariaId]);

  // ====================================================
  // 3. CARREGAR DETALHES DO SERVIÇO DA API
  // ====================================================
  useEffect(() => {
    async function carregarServico() {
      const idSelecionado = servicoIdContexto ?? planoIdContexto;

      if (!idSelecionado) {
        Alert.alert(
          "Erro",
          "Nenhum serviço ou plano foi selecionado.",
        );
        return;
      }

      setIsLoadingServico(true);
      try {
        const dados = await servicosService.buscarPorId(Number(idSelecionado));
        if (dados) {
          setServicoApi(dados);
        }
      } catch (error: any) {
        console.error("Erro ao carregar detalhes do serviço:", error?.message);
      } finally {
        setIsLoadingServico(false);
      }
    }

    carregarServico();
  }, [servicoIdContexto, planoIdContexto]);

  // ====================================================
  // 4. CARREGAR HORÁRIOS DISPONÍVEIS DA API
  // ====================================================
  useEffect(() => {
    async function carregarHorarios() {
      if (!barbeiroSelecionado || !dataSelecionada) return;

      setIsLoadingHorarios(true);
      try {
        const idSelecionado = servicoIdContexto ?? planoIdContexto;

        if (!idSelecionado) {
          Alert.alert(
            "Erro",
            "Nenhum serviço ou plano foi selecionado.",
          );
          return;
        }

        const slots = await barbeiroService.obterHorariosDisponiveis(
          barbeiroSelecionado,
          dataSelecionada,
          Number(idSelecionado)
        );

        if (Array.isArray(slots) && slots.length > 0) {
          setHorariosDisponiveis(slots);
          setHorarioSelecionado(slots[0]);
        } else {
          setHorariosDisponiveis([]);
          setHorarioSelecionado(null);
        }
      } catch (error: any) {
        console.warn("Erro ao buscar horários disponíveis:", error?.message);
        setHorariosDisponiveis([]);
        setHorarioSelecionado(null);
      } finally {
        setIsLoadingHorarios(false);
      }
    }

    carregarHorarios();
  }, [barbeiroSelecionado, dataSelecionada, servicoIdContexto, planoIdContexto]);

  // ====================================================
  // SELEÇÃO DE BARBEIRO E DATA
  // ====================================================
  const handleSelecionarBarbeiro = (id: number) => {
    setBarbeiroSelecionado(id);
    selecionarBarbeiro(id);
  };

  const handleSelecionarData = (date: DateData) => {
    setDataSelecionada(date.dateString);
    selecionarData(date.dateString);
  };

  // ====================================================
  // CONFIRMAR AGENDAMENTO NA API (SEM FALLBACK FALSO)
  // ====================================================
  const handleConfirmarAgendamento = async () => {
    if (!barbeiroSelecionado || !dataSelecionada || !horarioSelecionado) {
      Alert.alert(
        "Atenção",
        "Selecione o profissional, a data e um horário disponível para continuar."
      );
      return;
    }

    if (!clienteIdReal) {
      Alert.alert("Erro", "Identificação do cliente não encontrada. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Calcular início e término do atendimento
      const horaInicioFormatada = `${horarioSelecionado}:00`;
      const duracaoMinutos = Number(servicoApi?.duracao_minutos || servicoApi?.duracao || 45);

      const [h, m] = horarioSelecionado.split(":").map(Number);
      const totalMinutos = (h || 0) * 60 + (m || 0) + duracaoMinutos;
      const fimH = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
      const fimM = String(totalMinutos % 60).padStart(2, "0");
      const horaFimFormatada = `${fimH}:${fimM}:00`;

      const idServico = Number(servicoApi?.id || servicoIdContexto || planoIdContexto);
      const precoFinal = Number(servicoApi?.preco || 0);

      // 2. Criar Agendamento Real na API
      const agendamentoResponse = await agendamentosService.marcar({
        cliente_id: clienteIdReal,
        barbeiro_id: Number(barbeiroSelecionado),
        servico_id: idServico,
        data: dataSelecionada,
        hora_inicio: horaInicioFormatada,
        hora_fim: horaFimFormatada,
        status: exigePagamentoPix ? "PENDENTE" : "CONFIRMADO",
      });

      const idRetornado =
        agendamentoResponse?.id ||
        agendamentoResponse?.agendamento?.id ||
        agendamentoResponse?.data?.id;

      if (!idRetornado) {
        throw new Error("A API não retornou o identificador do agendamento criado.");
      }

      // 3. Abre o ModalPix com o agendamento real
      if (!exigePagamentoPix) {
        Alert.alert(
          "Agendamento confirmado!",
          "Seu horário foi reservado. O pagamento do serviço avulso será realizado na barbearia.",
          [
            {
              text: "Ver meus agendamentos",
              onPress: () =>
                router.replace("/Clientes/(tabs)/AgendamentosCliente" as any),
            },
          ],
        );
        return;
      }

      setAgendamentoCriado({
        id: idRetornado,
        valor: precoFinal,
        nomeServico: servicoApi?.nome || "Serviço de Barbearia",
      });

      setModalVisible(true);
    } catch (error: any) {
      console.error("Erro ao marcar agendamento:", error?.response?.data || error?.message);
      const mensagem =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Não foi possível registrar o agendamento. Verifique se o cliente e o serviço estão cadastrados.";
      Alert.alert("Erro no Agendamento", Array.isArray(mensagem) ? mensagem.join("\n") : mensagem);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================================
  // FORMATAÇÃO E NOMES
  // ====================================================
  const formatarData = (data: string) => {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }
    return data;
  };

  const barbeiroAtual = barbeiros.find((b) => b.id === barbeiroSelecionado);
  const barbeiroAtualNome = barbeiroAtual?.usuarios?.nome || (barbeiroAtual as any)?.nome || "Selecionado";

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ==================================================
            BANNER
        ================================================== */}
        <View
          style={[
            styles.bannerInfoType,
            planoIdContexto ? styles.bannerPlano : styles.bannerServico,
          ]}
        >
          <Text
            style={[
              styles.bannerInfoTitle,
              planoIdContexto ? styles.textoPlano : styles.textoServico,
            ]}
          >
            {planoIdContexto
              ? "Agendamento via Plano / Pacote"
              : "Agendamento de Serviço"}
          </Text>

          <Text style={styles.bannerInfoSub}>
            {planoIdContexto
              ? "Você está agendando um plano com confirmação rápida via PIX."
              : "Escolha o melhor profissional, dia e horário para o seu atendimento."}
          </Text>
        </View>

        {/* ==================================================
            RESUMO DO SERVIÇO
        ================================================== */}
        <View style={styles.resumoCard}>
          <Text style={styles.resumoTitulo}>Seu agendamento</Text>

          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Serviço</Text>
            {isLoadingServico ? (
              <ActivityIndicator size="small" color="#155DFC" />
            ) : (
              <Text style={styles.resumoValor}>
                {servicoApi?.nome || "Carregando serviço..."}
              </Text>
            )}
          </View>

          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Valor</Text>
            <Text style={styles.resumoPreco}>
              R$ {Number(servicoApi?.preco || 0).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        {/* ==================================================
            BARBEIROS (DA API)
        ================================================== */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Escolha o profissional</Text>
          <Text style={styles.subtituloSecao}>
            Selecione o barbeiro de sua preferência
          </Text>

          {isLoadingBarbeiros ? (
            <ActivityIndicator color="#155DFC" style={{ marginVertical: 15 }} />
          ) : barbeiros.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum barbeiro disponível no momento.</Text>
          ) : (
            <FlatList
              data={barbeiros}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listaContent}
              renderItem={({ item }) => {
                const isSelected = item.id === barbeiroSelecionado;
                const nomeCompleto = item.usuarios?.nome || (item as any).nome || "Barbeiro";
                const primeiroNome = String(nomeCompleto).split(" ")[0];
                const letraInicial = String(nomeCompleto).charAt(0).toUpperCase();

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelecionarBarbeiro(item.id)}
                    style={styles.barbeiroItem}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        isSelected && styles.avatarCircleSelecionado,
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarTexto,
                          isSelected && styles.avatarTextoSelecionado,
                        ]}
                      >
                        {letraInicial}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.nomeBarbeiro,
                        isSelected && styles.nomeBarbeiroSelecionado,
                      ]}
                      numberOfLines={1}
                    >
                      {primeiroNome}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* ==================================================
            CALENDÁRIO
        ================================================== */}
        <View style={styles.calendarContainer}>
          <Text style={styles.tituloSecao}>Escolha a data</Text>

          <Calendar
            onDayPress={handleSelecionarData}
            enableSwipeMonths={true}
            markedDates={{
              [dataSelecionada]: {
                selected: true,
                selectedColor: "#155DFC",
              },
            }}
            minDate={hojeString}
            theme={{
              textMonthFontSize: 15,
              textDayFontSize: 15,
              todayTextColor: "#155DFC",
              selectedDayBackgroundColor: "#155DFC",
              selectedDayTextColor: "#FFFFFF",
              textMonthFontFamily: "Inter_400Regular",
              textDayFontFamily: "Inter_400Regular",
              textDisabledColor: "#CBD5E1",
            }}
          />
        </View>

        {/* ==================================================
            HORÁRIOS (DA API)
        ================================================== */}
        <View style={styles.horariosContainer}>
          <Text style={styles.tituloSecao}>Horários disponíveis</Text>
          <Text style={styles.subtituloSecao}>
            {formatarData(dataSelecionada)}
          </Text>

          {isLoadingHorarios ? (
            <ActivityIndicator color="#155DFC" style={{ marginVertical: 15 }} />
          ) : horariosDisponiveis.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum horário disponível para esta data.
            </Text>
          ) : (
            <View style={styles.gridhora}>
              {horariosDisponiveis.map((hora) => {
                const isSelected = hora === horarioSelecionado;

                return (
                  <TouchableOpacity
                    key={hora}
                    onPress={() => setHorarioSelecionado(hora)}
                    style={[
                      styles.horaCard,
                      isSelected && styles.horaCardSelecionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.horaTexto,
                        isSelected && styles.horaTextoSelecionado,
                      ]}
                    >
                      {hora}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ==================================================
            RESUMO FINAL
        ================================================== */}
        <View style={styles.confirmacaoCard}>
          <Text style={styles.confirmacaoTitulo}>Resumo</Text>

          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Profissional</Text>
            <Text style={styles.resumoValor}>{barbeiroAtualNome}</Text>
          </View>

          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Data</Text>
            <Text style={styles.resumoValor}>
              {formatarData(dataSelecionada)}
            </Text>
          </View>

          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Horário</Text>
            <Text style={styles.resumoValor}>{horarioSelecionado || "Não selecionado"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resumoLinha}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValor}>
              R$ {Number(servicoApi?.preco || 0).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        {/* ==================================================
            BOTÃO CONFIRMAR
        ================================================== */}
        <View style={[styles.footerContainer, {height: 64 + insets.bottom}]}>
          <Button
            label={isSubmitting ? "Processando..." : "Confirmar Agendamento"}
            isActive={!!horarioSelecionado && !isSubmitting}
            onPress={handleConfirmarAgendamento}
          />
        </View>
      </ScrollView>

      {/* ==================================================
          MODAL PIX
      ================================================== */}
      {exigePagamentoPix && agendamentoCriado && (
        <ModalPix
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          agendamentoId={agendamentoCriado.id}
          valor={agendamentoCriado.valor}
          nomeServico={agendamentoCriado.nomeServico}
          onSuccess={() => {
            setModalVisible(false);
            Alert.alert(
              "Sucesso!",
              "Pagamento realizado e agendamento confirmado!",
              [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]
            );
          }}
        />
      )}
    </View>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 16,
    marginTop: 30,
  },
  bannerInfoType: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerPlano: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  bannerServico: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  bannerInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  textoPlano: {
    color: "#065F46",
  },
  textoServico: {
    color: "#1E40AF",
  },
  bannerInfoSub: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  resumoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resumoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  resumoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  resumoValor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  resumoPreco: {
    fontSize: 15,
    fontWeight: "700",
    color: "#155DFC",
  },
  secao: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginHorizontal: 16,
  },
  subtituloSecao: {
    fontSize: 12,
    color: "#64748B",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  listaContent: {
    paddingHorizontal: 16,
    gap: 20,
  },
  barbeiroItem: {
    alignItems: "center",
    width: 68,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  avatarCircleSelecionado: {
    borderColor: "#155DFC",
    backgroundColor: "#155DFC",
  },
  avatarTexto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#334155",
  },
  avatarTextoSelecionado: {
    color: "#FFFFFF",
  },
  nomeBarbeiro: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
  },
  nomeBarbeiroSelecionado: {
    color: "#155DFC",
    fontWeight: "700",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  horariosContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  gridhora: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
  },
  horaCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  horaCardSelecionado: {
    backgroundColor: "#155DFC",
    borderColor: "#155DFC",
  },
  horaTexto: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  horaTextoSelecionado: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  confirmacaoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  confirmacaoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  totalValor: {
    fontSize: 20,
    fontWeight: "700",
    color: "#155DFC",
  },
  footerContainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    marginHorizontal: 16,
    marginVertical: 10,
    color: "#94A3B8",
    fontSize: 14,
    fontStyle: "italic",
  },
});