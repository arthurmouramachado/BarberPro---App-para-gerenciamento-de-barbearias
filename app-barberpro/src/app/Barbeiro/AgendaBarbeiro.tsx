import React, { useState } from "react";
import {
  FlatList,
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

import { colors } from "@/colors";

interface Agendamento {
  id: string;
  clienteNome: string;
  servico: string;
  horario: string;
  preco: string;
  status: "confirmado" | "concluido" | "cancelado";
}

const agendamentosExemplo: Agendamento[] = [
  {
    id: "1",
    clienteNome: "Lucas Silva",
    servico: "Corte + Barba",
    horario: "09:00",
    preco: "R$ 60,00",
    status: "confirmado",
  },
  {
    id: "2",
    clienteNome: "Matheus Oliveira",
    servico: "Corte Degradê",
    horario: "10:00",
    preco: "R$ 40,00",
    status: "confirmado",
  },
  {
    id: "3",
    clienteNome: "Gabriel Santos",
    servico: "Barboterapia",
    horario: "11:30",
    preco: "R$ 35,00",
    status: "concluido",
  },
];

export default function AgendaBarbeiro() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const [filtroData, setFiltroData] = useState<"hoje" | "amanha">("hoje");

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header com o padrão LinearGradient do app */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Agenda do Barbeiro</Text>
        <Text style={styles.headerSubtitle}>Gerencie seus horários e atendimentos</Text>

        {/* Filtro rápido de data */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filtroData === "hoje" && styles.filterButtonActive,
            ]}
            onPress={() => setFiltroData("hoje")}
          >
            <Text
              style={[
                styles.filterText,
                filtroData === "hoje" && styles.filterTextActive,
              ]}
            >
              Hoje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filtroData === "amanha" && styles.filterButtonActive,
            ]}
            onPress={() => setFiltroData("amanha")}
          >
            <Text
              style={[
                styles.filterText,
                filtroData === "amanha" && styles.filterTextActive,
              ]}
            >
              Amanhã
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lista de Agendamentos */}
      <FlatList
        data={agendamentosExemplo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.timeBadge}>
                <Feather name="clock" size={14} color={colors.primary} />
                <Text style={styles.timeText}>{item.horario}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === "concluido"
                    ? styles.statusConcluido
                    : styles.statusConfirmado,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === "concluido"
                      ? styles.statusTextConcluido
                      : styles.statusTextConfirmado,
                  ]}
                >
                  {item.status === "concluido" ? "Concluído" : "Confirmado"}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.clientName}>{item.clienteNome}</Text>
              <Text style={styles.serviceName}>{item.servico}</Text>
              <Text style={styles.priceText}>{item.preco}</Text>
            </View>

            {item.status === "confirmado" && (
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.btnActionSecondary}>
                  <Feather name="x-circle" size={16} color="#EF4444" />
                  <Text style={styles.btnTextSecondary}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnActionPrimary}>
                  <Feather name="check-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.btnTextPrimary}>Concluir</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

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
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  filterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  filterTextActive: {
    color: colors.primary,
  },
  listContainer: {
    padding: 24,
    paddingBottom: 40,
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
  statusConfirmado: {
    backgroundColor: "#FEF3C7",
  },
  statusConcluido: {
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  statusTextConfirmado: {
    color: "#D97706",
  },
  statusTextConcluido: {
    color: "#059669",
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