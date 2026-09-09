import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { barbeiroService, BarbeiroDTO } from "@/services/barbeiroService";

// =========================================================
// TELA
// =========================================================

export default function ExcluirBarbeiroAdmin() {
  const { user } = useAuth();

  const [barbeiros, setBarbeiros] = useState<BarbeiroDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  // =========================================================
  // CARREGAR BARBEIROS DA API
  // =========================================================

  const carregarBarbeiros = useCallback(async () => {
    setLoading(true);
    try {
      let barbeariaId: number | null = null;

      // Descobre a barbearia do barbeiro logado
      if (user?.barbeiroId) {
        try {
          const barbeiroLogado = await barbeiroService.buscarPorId(
            String(user.barbeiroId),
          );
          barbeariaId = barbeiroLogado?.barbearia_id ?? null;
        } catch (err) {
          console.warn("Erro ao buscar dados do barbeiro logado:", err);
        }
      }

      if (barbeariaId) {
        const lista = await barbeiroService.listarPorBarbearia(barbeariaId);
        setBarbeiros(lista);
      } else {
        // Fallback: lista todos sem filtro de barbearia
        const lista = await barbeiroService.listarPorBarbearia(0);
        setBarbeiros(lista);
      }
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de barbeiros.");
    } finally {
      setLoading(false);
    }
  }, [user?.barbeiroId]);

  useEffect(() => {
    carregarBarbeiros();
  }, [carregarBarbeiros]);

  // =========================================================
  // CONFIRMAR E EXCLUIR BARBEIRO
  // =========================================================

  const confirmarExclusao = (id: number, nome: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o barbeiro ${nome}? Essa ação não poderá ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deletarBarbeiro(id),
        },
      ],
    );
  };

  const deletarBarbeiro = async (id: number) => {
    setExcluindo(id);
    try {
      await barbeiroService.deletar(String(id));
      setBarbeiros((prev) => prev.filter((b) => b.id !== id));
      Alert.alert("Sucesso", "Barbeiro removido da equipe com sucesso!");
    } catch (error: any) {
      console.error("Erro ao deletar barbeiro:", error);
      const mensagem =
        error?.response?.data?.message ||
        "Não foi possível remover o barbeiro. Tente novamente.";
      Alert.alert(
        "Erro",
        Array.isArray(mensagem) ? mensagem.join("\n") : mensagem,
      );
    } finally {
      setExcluindo(null);
    }
  };

  // =========================================================
  // CARD DO BARBEIRO
  // =========================================================

  const renderBarbeiroItem = ({ item }: { item: BarbeiroDTO }) => {
    const estaExcluindo = excluindo === item.id;
    const nome = item.usuarios?.nome ?? "Barbeiro";
    const email = item.usuarios?.email ?? "";
    const especialidade = item.especialidade ?? "";

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nomeText}>{nome}</Text>
          {especialidade ? (
            <Text style={styles.subText}>{especialidade}</Text>
          ) : null}
          {email ? <Text style={styles.emailText}>{email}</Text> : null}
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            estaExcluindo && styles.deleteButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={estaExcluindo}
          onPress={() => confirmarExclusao(item.id, nome)}
        >
          {estaExcluindo ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="trash-outline" size={21} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================
  // ESTADO DE CARREGAMENTO
  // =========================================================

  if (loading) {
    return (
      <View style={styles.centroContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingTexto}>Carregando barbeiros...</Text>
      </View>
    );
  }

  // =========================================================
  // TELA
  // =========================================================

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciar Barbeiros</Text>

      <Text style={styles.subtitulo}>
        Selecione um barbeiro para remover da equipe
      </Text>

      {/* Indicador de quantidade */}
      <View style={styles.counterContainer}>
        <View style={styles.counterIcon}>
          <Ionicons name="people-outline" size={20} color="#2563EB" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.counterLabel}>Barbeiros cadastrados</Text>
          <Text style={styles.counterValue}>
            {barbeiros.length}{" "}
            {barbeiros.length === 1 ? "profissional" : "profissionais"}
          </Text>
        </View>

        {/* Botão atualizar */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={carregarBarbeiros}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={barbeiros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBarbeiroItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onRefresh={carregarBarbeiros}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Nenhum barbeiro encontrado</Text>
            <Text style={styles.emptyText}>
              Não existem barbeiros cadastrados nesta barbearia.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  centroContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingTexto: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },

  // =========================================================
  // CONTADOR
  // =========================================================

  counterContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  counterIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  counterLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  counterValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  refreshButton: {
    marginLeft: "auto",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // =========================================================
  // LISTA
  // =========================================================

  listContent: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",

    elevation: 2,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
  },

  // =========================================================
  // AVATAR
  // =========================================================

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3730A3",
  },

  // =========================================================
  // INFORMAÇÕES
  // =========================================================

  infoContainer: {
    flex: 1,
    marginRight: 10,
  },

  nomeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  subText: {
    fontSize: 13,
    color: "#475569",
    marginTop: 3,
  },

  emailText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 3,
  },

  // =========================================================
  // BOTÃO EXCLUIR
  // =========================================================

  deleteButton: {
    width: 42,
    height: 42,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonDisabled: {
    backgroundColor: "#FCA5A5",
  },

  // =========================================================
  // ESTADO VAZIO
  // =========================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 6,
    fontSize: 14,
    paddingHorizontal: 30,
  },
});