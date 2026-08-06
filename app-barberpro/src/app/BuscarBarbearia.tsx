import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { BarbeariaCard } from "../_components/BarbeariaCard";
import { ConfirmBarbeariaModal } from "../_components/ConfirmBarbeariaModal";
import { barbeariaService, BarbeariaCardDTO } from "../services/barbeariaService";
import { Input } from "@/_components/Input";
import { colors } from "@/colors";

export default function BuscarBarbearia() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [barbearias, setBarbearias] = useState<BarbeariaCardDTO[]>([]);
  const [barbeariasFiltradas, setBarbeariasFiltradas] = useState<BarbeariaCardDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [barbeariaSelecionada, setBarbeariaSelecionada] = useState<BarbeariaCardDTO | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    carregarBarbearias();
  }, []);

  const carregarBarbearias = async () => {
    try {
      setCarregando(true);
      const dados = await barbeariaService.listarTodas();
      setBarbearias(dados);
      setBarbeariasFiltradas(dados);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as barbearias.");
    } finally {
      setCarregando(false);
    }
  };

  const handleFiltrar = (texto: string) => {
    setBusca(texto);
    if (!texto.trim()) {
      setBarbeariasFiltradas(barbearias);
      return;
    }
    const filtradas = barbearias.filter(
      (b) =>
        b.nome.toLowerCase().includes(texto.toLowerCase()) ||
        b.endereco.toLowerCase().includes(texto.toLowerCase())
    );
    setBarbeariasFiltradas(filtradas);
  };

  const handleSelecionarBarbearia = (barbearia: BarbeariaCardDTO) => {
    setBarbeariaSelecionada(barbearia);
    setModalVisivel(true);
  };

  const handleConfirmarVinculo = () => {
    setModalVisivel(false);
    router.replace("./HomeBarbeiro");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onde você trabalha?</Text>
      <Text style={styles.subtitle}>
        Pesquise e selecione a barbearia para acessar sua área de atendimento
      </Text>

      <View style={styles.inputContainer}>
        <Feather name="search" size={20} color="#94A3B8" />
        <Input
          style={styles.input}
          placeholder="Buscar por nome ou endereço..."
          placeholderTextColor="#94A3B8"
          value={busca}
          onChangeText={handleFiltrar}
        />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={barbeariasFiltradas}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma barbearia encontrada.</Text>
          }
          renderItem={({ item }) => (
            <BarbeariaCard
              barbearia={item}
              onPress={() => handleSelecionarBarbearia(item)}
            />
          )}
        />
      )}

      <ConfirmBarbeariaModal
        visible={modalVisivel}
        barbearia={barbeariaSelecionada}
        onClose={() => setModalVisivel(false)}
        onConfirm={handleConfirmarVinculo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#0F172A",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    fontFamily: "Inter_400Regular",
    marginTop: 30,
  },
});