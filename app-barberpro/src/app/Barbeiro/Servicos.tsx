import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import { servicosService } from "@/services/servicosService";

// Interface do serviço / pacote
export interface ServicoItem {
  id: string | number;
  nome: string;
  preco: number;
  duracao: number; // Em minutos
  descricao?: string;
  tipo: "SERVICO" | "PACOTE";
  ativo?: boolean;
}

export default function Servicos() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const router = useRouter();
  const { user } = useAuth();

  // Estados da lista
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [filtro, setFiltro] = useState<"TODOS" | "SERVICO" | "PACOTE">("TODOS");

  // Estados do Modal / Formulário
  const [modalVisivel, setModalVisivel] = useState<boolean>(false);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [itemEdicaoId, setItemEdicaoId] = useState<string | number | null>(
    null,
  );

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"SERVICO" | "PACOTE">("SERVICO");


  async function carregarServicos() {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const dados = await servicosService.listarPorBarbeiro(user.id);

      setServicos(
        dados.map((item) => ({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          duracao: item.duracao || 0,
          descricao: item.descricao,
          tipo: (item.tipo || "SERVICO") as "SERVICO" | "PACOTE",
          ativo: item.ativo,
        })),
      );
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de serviços.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, [user?.id]);

  function onRefresh() {
    setRefreshing(true);
    carregarServicos();
  }

  // ABRIR MODAL PARA CRIAR
  function abrirModalCriar() {
    setItemEdicaoId(null);
    setNome("");
    setPreco("");
    setDuracao("");
    setDescricao("");
    setTipo("SERVICO");
    setModalVisivel(true);
  }

  // ABRIR MODAL PARA EDITAR
  function abrirModalEditar(item: ServicoItem) {
    setItemEdicaoId(item.id);
    setNome(item.nome);
    setPreco(item.preco.toString());
    setDuracao(item.duracao.toString());
    setDescricao(item.descricao || "");
    setTipo(item.tipo);
    setModalVisivel(true);
  }

  // SALVAR (CRIAÇÃO OU EDIÇÃO)
  async function salvarServico() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do serviço/pacote.");
      return;
    }

    const valorPreco = parseFloat(preco.replace(",", "."));
    if (isNaN(valorPreco) || valorPreco <= 0) {
      Alert.alert("Atenção", "Informe um preço válido.");
      return;
    }

    const valorDuracao = parseInt(duracao, 10);
    if (isNaN(valorDuracao) || valorDuracao <= 0) {
      Alert.alert("Atenção", "Informe a duração em minutos.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Erro", "Usuário inválido.");
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        barbearia_id: user.id,
        nome: nome.trim(),
        preco: valorPreco,
        duracao_minutos: valorDuracao,
        descricao: descricao.trim(),
        tipo,
      };

      if (itemEdicaoId) {
        await servicosService.atualizar(itemEdicaoId, payload);
        setServicos((prev) =>
          prev.map((item) =>
            item.id === itemEdicaoId
              ? {
                  ...item,
                  nome: nome.trim(),
                  preco: valorPreco,
                  duracao: valorDuracao,
                  descricao: descricao.trim(),
                  tipo,
                }
              : item,
          ),
        );
        Alert.alert("Sucesso", "Item atualizado com sucesso!");
      } else {
        await servicosService.cadastrar(payload);
        const novoItem: ServicoItem = {
          id: Date.now().toString(),
          nome: nome.trim(),
          preco: valorPreco,
          duracao: valorDuracao,
          descricao: descricao.trim(),
          tipo,
          ativo: true,
        };
        setServicos((prev) => [novoItem, ...prev]);
        Alert.alert("Sucesso", "Novo item cadastrado!");
      }

      setModalVisivel(false);
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    } finally {
      setSalvando(false);
    }
  }

  // EXCLUIR ITEM
  function deletarServico(id: string | number) {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja remover este item?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
             await servicosService.deletar(id);
              setServicos((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              console.error("Erro ao deletar:", error);
              Alert.alert("Erro", "Falha ao excluir o serviço.");
            }
          },
        },
      ],
    );
  }

  // FILTRAGEM
  const servicosFiltrados = servicos.filter((item) => {
    if (filtro === "SERVICO") return item.tipo === "SERVICO";
    if (filtro === "PACOTE") return item.tipo === "PACOTE";
    return true;
  });

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Serviços & Pacotes</Text>
        </View>

        {/* Abas de Filtro */}
        <View style={styles.tabContainer}>
          {(["TODOS", "SERVICO", "PACOTE"] as const).map((aba) => (
            <TouchableOpacity
              key={aba}
              style={[
                styles.tabButton,
                filtro === aba && styles.tabButtonActive,
              ]}
              onPress={() => setFiltro(aba)}
            >
              <Text
                style={[styles.tabText, filtro === aba && styles.tabTextActive]}
              >
                {aba === "TODOS"
                  ? "Todos"
                  : aba === "SERVICO"
                    ? "Serviços"
                    : "Pacotes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Botão Novo Item */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.newButton}
          onPress={abrirModalCriar}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.newButtonText}>Adicionar Novo Item</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {servicosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="scissors" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Cadastre novos serviços ou pacotes/planos para seus clientes.
            </Text>
          </View>
        ) : (
          servicosFiltrados.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{item.nome}</Text>
                  <View
                    style={[
                      styles.badgeTipo,
                      item.tipo === "PACOTE" && styles.badgePacote,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeTipoText,
                        item.tipo === "PACOTE" && styles.badgePacoteText,
                      ]}
                    >
                      {item.tipo === "SERVICO" ? "Serviço" : "Pacote / Plano"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => abrirModalEditar(item)}
                  >
                    <Feather name="edit-2" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => deletarServico(item.id)}
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {item.descricao ? (
                <Text style={styles.cardDescription}>{item.descricao}</Text>
              ) : null}

              <View style={styles.cardFooter}>
                <View style={styles.metaInfo}>
                  <Feather name="clock" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.duracao} min</Text>
                </View>
                <Text style={styles.cardPrice}>
                  {formatarMoeda(item.preco)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Cadastro / Edição */}
      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {itemEdicaoId ? "Editar Item" : "Novo Serviço/Pacote"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Seletor de Tipo */}
              <Text style={styles.label}>Tipo de Oferta</Text>
              <View style={styles.tipoSelector}>
                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === "SERVICO" && styles.tipoOptionActive,
                  ]}
                  onPress={() => setTipo("SERVICO")}
                >
                  <Feather
                    name="scissors"
                    size={16}
                    color={tipo === "SERVICO" ? "#FFFFFF" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.tipoOptionText,
                      tipo === "SERVICO" && styles.tipoOptionTextActive,
                    ]}
                  >
                    Serviço Avulso
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === "PACOTE" && styles.tipoOptionActive,
                  ]}
                  onPress={() => setTipo("PACOTE")}
                >
                  <Feather
                    name="box"
                    size={16}
                    color={tipo === "PACOTE" ? "#FFFFFF" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.tipoOptionText,
                      tipo === "PACOTE" && styles.tipoOptionTextActive,
                    ]}
                  >
                    Pacote / Plano
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Nome */}
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Corte Degradê, Plano Mensal Barba..."
                placeholderTextColor="#94A3B8"
                value={nome}
                onChangeText={setNome}
              />

              {/* Preço e Duração na mesma linha */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Preço (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0,00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={preco}
                    onChangeText={setPreco}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Duração (min)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={duracao}
                    onChangeText={setDuracao}
                  />
                </View>
              </View>

              {/* Descrição */}
              <Text style={styles.label}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Detalhes sobre o serviço ou regras do pacote..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={descricao}
                onChangeText={setDescricao}
              />

              {/* Botão de Ação */}
              <TouchableOpacity
                style={[styles.saveButton, salvando && { opacity: 0.7 }]}
                onPress={salvarServico}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>
                      {itemEdicaoId ? "Salvar Alterações" : "Cadastrar Item"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  tabTextActive: {
    color: colors.primary,
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  newButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  newButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    gap: 12,
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
    alignItems: "flex-start",
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 4,
  },
  badgeTipo: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePacote: {
    backgroundColor: "#FEF3C7",
  },
  badgeTipoText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: colors.primary,
  },
  badgePacoteText: {
    color: "#D97706",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  cardDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#64748B",
  },
  cardPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#10B981",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0F172A",
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 6,
    marginTop: 12,
  },
  tipoSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  tipoOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  tipoOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tipoOptionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#64748B",
  },
  tipoOptionTextActive: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#0F172A",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 10,
  },
  saveButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
