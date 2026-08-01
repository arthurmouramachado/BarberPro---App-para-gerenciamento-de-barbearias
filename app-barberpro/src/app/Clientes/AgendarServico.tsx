import { Button } from "@/_components/Button";
import { ModalPix } from "@/_components/ModalPix"; // Ajuste o caminho se seu componente estiver em outro diretório
import { useAgendamento } from "@/contexts/AgendamentoContext";
import { agendamentosService } from "@/services/agendamentosService";
import { barbeiroService } from "@/services/barbeiroService";
import { disponibilidadeService } from "@/services/disponibilidadeService";
import { servicosService } from "@/services/servicosService";
import { gerarHorariosDisponiveis } from "@/utils/gerarHorarios";
import { ptBR } from "@/utils/localeCalendarConfig";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
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

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

export default function AgendarServico() {
  const navigation = useNavigation<any>();

  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [loadingBarbeiros, setLoadingBarbeiros] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingAgendamento, setLoadingAgendamento] = useState(false);
  const [day, setDay] = useState<DateData>();

  const [horarios, setHorarios] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null,
  );

  // Estados do Modal PIX
  const [modalVisible, setModalVisible] = useState(false);
  const [agendamentoCriado, setAgendamentoCriado] = useState<{
    id: number;
    valor: number;
  } | null>(null);

  const {
    barbeiroId,
    barbeariaId,
    selecionarBarbeiro,
    servicoId,
    planoId,
    selecionarData,
    dataSelecionada,
  } = useAgendamento();

  async function carregarBarbeiro() {
    if (!barbeariaId) return;
    try {
      setLoadingBarbeiros(true);
      const dados = await barbeiroService.listarPorBarbearia(barbeariaId);
      setBarbeiros(dados);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar os Barbeiros");
    } finally {
      setLoadingBarbeiros(false);
    }
  }

  useEffect(() => {
    carregarBarbeiro();
  }, [barbeariaId]);

  useEffect(() => {
    async function carregarEDividirHorarios() {
      setHorarioSelecionado(null);

      if (!barbeiroId || !dataSelecionada) {
        setHorarios([]);
        return;
      }

      try {
        setLoadingHorarios(true);

        const [ano, mes, dia] = dataSelecionada.split("-").map(Number);
        const dataObj = new Date(ano, mes - 1, dia);
        const diaDaSemana = dataObj.getDay();

        const disponibilidadesBarbeiro =
          await disponibilidadeService.listarPorBarbeiro(barbeiroId);
        const turnosDoDia = disponibilidadesBarbeiro.filter(
          (d) => d.dia_da_semana === diaDaSemana,
        );

        let duracaoMinutos = 30;
        if (servicoId) {
          const servico = await servicosService.buscarPorId(servicoId);
          duracaoMinutos = servico.duracaoMinutos || 30;
        }

        const agendamentosOcupados = await agendamentosService.listarTodas(
          barbeariaId,
          barbeiroId,
          dataSelecionada,
        );

        const slotsLivres = gerarHorariosDisponiveis({
          turnosDoDia,
          duracaoMinutos,
          agendamentosExistentes: agendamentosOcupados || [],
        });

        setHorarios(slotsLivres);
      } catch (error) {
        console.log("Erro ao calcular horários disponíveis:", error);
        Alert.alert(
          "Erro",
          "Não foi possível carregar os horários para este dia.",
        );
      } finally {
        setLoadingHorarios(false);
      }
    }

    carregarEDividirHorarios();
  }, [barbeiroId, dataSelecionada, servicoId]);

  // Função para lidar com a confirmação do agendamento
  const handleConfirmarAgendamento = async () => {
    if (!barbeiroId || !dataSelecionada || !horarioSelecionado) {
      Alert.alert(
        "Atenção",
        "Selecione um barbeiro, uma data e um horário para continuar.",
      );
      return;
    }

    try {
      setLoadingAgendamento(true);

      // Chamada para criar o agendamento no backend
      const resposta = await agendamentosService.marcar({
        barbearia_id: barbeariaId,
        barbeiro_id: barbeiroId,
        ...(servicoId && { servico_id: servicoId }),
        ...(planoId && { plano_id: planoId }),
        data: dataSelecionada,
        horario: horarioSelecionado,
      } as any);

      // SE FOR PLANO/PACOTE -> Abre o Modal do PIX
      if (planoId) {
        setAgendamentoCriado({
          id: resposta.id,
          valor: Number(resposta.valor || resposta.preco || 0),
        });
        setModalVisible(true);
      } else {
        // SE FOR SERVIÇO AVULSO -> Conclui diretamente
        Alert.alert(
          "Agendamento Realizado!",
          "Seu agendamento foi confirmado com sucesso. O pagamento será feito no local.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      }
    } catch (error: any) {
      console.log("Erro ao criar agendamento:", error);
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Não foi possível realizar o agendamento.",
      );
    } finally {
      setLoadingAgendamento(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Banner Informativo */}
        <View
          style={[
            styles.bannerInfoType,
            planoId ? styles.bannerPlano : styles.bannerServico,
          ]}
        >
          <Text
            style={[
              styles.bannerInfoTitle,
              planoId ? styles.textoPlano : styles.textoServico,
            ]}
          >
            {planoId ? "Agendamento via Plano / Pacote" : "Agendamento Avulso"}
          </Text>
          <Text style={styles.bannerInfoSub}>
            {planoId
              ? "Você está agendando um plano com pagamento online via app."
              : "Serviço avulso com pagamento presencial na barbearia."}
          </Text>
        </View>

        {/* Listagem dos Barbeiros */}
        <View style={styles.headerBarbeiros}>
          <FlatList
            data={barbeiros}
            keyExtractor={(item) => String(item.id)}
            refreshing={loadingBarbeiros}
            onRefresh={carregarBarbeiro}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            renderItem={({ item }) => {
              const isSelected = item.id === barbeiroId;
              const nomeBarbeiro = item.usuarios?.nome ?? "Barbeiro";

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => selecionarBarbeiro(item.id)}
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
                      {nomeBarbeiro.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.nomeBarbeiro,
                      isSelected && styles.nomeBarbeiroSelecionado,
                    ]}
                    numberOfLines={1}
                  >
                    {nomeBarbeiro.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Calendário */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(date) => {
              setDay(date);
              selecionarData(date.dateString);
            }}
            enableSwipeMonths={true}
            markedDates={
              day && {
                [day.dateString]: {
                  selected: true,
                  selectedColor: "#155DFC",
                },
              }
            }
            headerStyle={{
              borderBottomWidth: 0.5,
              borderBottomColor: "#E8e8e8",
              paddingBottom: 10,
            }}
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
            minDate={new Date().toISOString().split("T")[0]}
          />
        </View>

        {/* Grid de Horários Disponíveis */}
        <View style={styles.gridhora}>
          {loadingHorarios ? (
            <ActivityIndicator
              size="small"
              color="#155DFC"
              style={{ marginVertical: 12 }}
            />
          ) : horarios.length > 0 ? (
            horarios.map((hora) => {
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
            })
          ) : (
            <Text style={styles.textoVazio}>
              {dataSelecionada && barbeiroId
                ? "Nenhum horário disponível para esta data."
                : "Selecione um barbeiro e uma data."}
            </Text>
          )}
        </View>

        <View style={styles.footerContainer}>
          <Button
            label={
              loadingAgendamento ? "Agendando..." : "Confirmar Agendamento"
            }
            onPress={handleConfirmarAgendamento}
            disabled={loadingAgendamento || !horarioSelecionado}
          />
        </View>
      </ScrollView>

      {/* MODAL PIX - Renderizado apenas quando for plano e o agendamento for criado */}
      {agendamentoCriado && (
        <ModalPix
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          agendamentoId={agendamentoCriado.id}
          valor={agendamentoCriado.valor}
          nomeServico="Pagamento de Pacote / Plano"
          onSuccess={() => {
            setModalVisible(false);
            navigation.goBack();
          }}
        />
      )}
    </View>
  );
}

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
  headerBarbeiros: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderRadius: 16,
    borderBottomColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  listaContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gridhora: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
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
  textoVazio: {
    fontSize: 14,
    color: "#64748B",
    paddingVertical: 12,
  },
  footerContainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
});
