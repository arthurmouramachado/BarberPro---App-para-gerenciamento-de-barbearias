import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

import { AnimatedSwitch } from "@/_components/ui/AnimatedSwitch";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  DisponibilidadeDTO,
  disponibilidadeService,
} from "@/services/disponibilidadeService";

interface DiaFormState {
  dbId?: number;
  diaSemana: number;
  dia: string;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
}

const ESTRUTURA_DIAS = [
  { diaSemana: 1, dia: "Segunda-feira" },
  { diaSemana: 2, dia: "Terça-feira" },
  { diaSemana: 3, dia: "Quarta-feira" },
  { diaSemana: 4, dia: "Quinta-feira" },
  { diaSemana: 5, dia: "Sexta-feira" },
  { diaSemana: 6, dia: "Sábado" },
  { diaSemana: 0, dia: "Domingo" },
];

export default function HorariosTrabalho() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const { user } = useAuth();
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [horarios, setHorarios] = useState<DiaFormState[]>([]);

  useEffect(() => {
    async function carregarDisponibilidade() {
      if (!user?.id) {
        setCarregando(false);
        return;
      }

      try {
        const dadosApi: DisponibilidadeDTO[] =
          await disponibilidadeService.listarPorBarbeiro(Number(user.id));

        const estadoInicial: DiaFormState[] = ESTRUTURA_DIAS.map((item) => {
          const encontrado = dadosApi.find(
            (d) => d.dia_da_semana === item.diaSemana
          );

          if (encontrado) {
            return {
              dbId: encontrado.id,
              diaSemana: item.diaSemana,
              dia: item.dia,
              ativo: true,
              hora_inicio: encontrado.hora_inicio || "09:00",
              hora_fim: encontrado.hora_fim || "18:00",
            };
          }

          return {
            diaSemana: item.diaSemana,
            dia: item.dia,
            ativo: false,
            hora_inicio: "09:00",
            hora_fim: "18:00",
          };
        });

        setHorarios(estadoInicial);
      } catch (error) {
        console.error("Erro ao carregar horários do barbeiro:", error);
        Alert.alert("Erro", "Não foi possível carregar sua disponibilidade.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDisponibilidade();
  }, [user?.id]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const toggleDia = (diaSemana: number, novoValor: boolean) => {
    setHorarios((prev) =>
      prev.map((item) =>
        item.diaSemana === diaSemana ? { ...item, ativo: novoValor } : item
      )
    );
  };

  const alterarHorario = (
    diaSemana: number,
    campo: "hora_inicio" | "hora_fim",
    valor: string
  ) => {
    setHorarios((prev) =>
      prev.map((item) =>
        item.diaSemana === diaSemana ? { ...item, [campo]: valor } : item
      )
    );
  };

  const salvarHorarios = async () => {
    if (!user?.id) {
      Alert.alert("Erro", "Barbeiro não identificado.");
      return;
    }

    setSalvando(true);

    try {
      for (const item of horarios) {
        if (item.ativo) {
          const payload = {
            barbeiro_id: Number(user.id),
            dia_da_semana: item.diaSemana,
            hora_inicio: item.hora_inicio,
            hora_fim: item.hora_fim,
          };

          if (item.dbId) {
            await disponibilidadeService.atualizarDisponibilidade(
              String(item.dbId),
              payload
            );
          } else {
            const resposta = await disponibilidadeService.criarDisponibilidade(
              payload
            );
            item.dbId = resposta?.id;
          }
        } else if (item.dbId) {
          await disponibilidadeService.deletarDisponibilidade(
            String(item.dbId)
          );
          delete item.dbId;
        }
      }

      Alert.alert("Sucesso", "Horários de atendimento atualizados!");
    } catch (error) {
      console.error("Erro ao salvar disponibilidade:", error);
      Alert.alert("Erro", "Falha ao salvar as alterações no servidor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Horários de Trabalho</Text>
          <Text style={styles.headerSubtitle}>
            Defina sua disponibilidade de atendimento
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando disponibilidade...</Text>
            </View>
          ) : (
            <>
              {horarios.map((item) => (
                <View key={item.diaSemana} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.dayTitle}>{item.dia}</Text>
                    <AnimatedSwitch
                      value={item.ativo}
                      onValueChange={(novoValor) =>
                        toggleDia(item.diaSemana, novoValor)
                      }
                      onColor={colors.primary}
                      offColor="#CBD5E1"
                      width={50}
                      height={28}
                      iconAnimationType="bounce"
                    />
                  </View>

                  {item.ativo ? (
                    <View style={styles.timesContainer}>
                      <View style={styles.timeBlock}>
                        <Text style={styles.timeLabel}>Expediente</Text>
                        <View style={styles.timeInputsRow}>
                          <View style={styles.timeBox}>
                            <Feather name="clock" size={14} color="#64748B" />
                            <TextInput
                              style={styles.timeInput}
                              value={item.hora_inicio}
                              onChangeText={(texto) =>
                                alterarHorario(
                                  item.diaSemana,
                                  "hora_inicio",
                                  texto
                                )
                              }
                              placeholder="09:00"
                              placeholderTextColor="#94A3B8"
                              maxLength={5}
                            />
                          </View>
                          <Text style={styles.separator}>até</Text>
                          <View style={styles.timeBox}>
                            <Feather name="clock" size={14} color="#64748B" />
                            <TextInput
                              style={styles.timeInput}
                              value={item.hora_fim}
                              onChangeText={(texto) =>
                                alterarHorario(
                                  item.diaSemana,
                                  "hora_fim",
                                  texto
                                )
                              }
                              placeholder="18:00"
                              placeholderTextColor="#94A3B8"
                              maxLength={5}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.offDayBadge}>
                      <Text style={styles.offDayText}>Folga / Não atende</Text>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  salvando && { opacity: 0.7 },
                ]}
                onPress={salvarHorarios}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
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
    paddingBottom: 30,
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
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
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
  },
  dayTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
  },
  timesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  timeBlock: {
    gap: 6,
  },
  timeLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#64748B",
  },
  timeInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeInput: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
  },
  separator: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#94A3B8",
  },
  offDayBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  offDayText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  saveButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});