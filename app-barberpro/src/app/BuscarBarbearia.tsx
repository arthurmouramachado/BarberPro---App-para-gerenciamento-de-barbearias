import { Input } from "@/_components/Input";
import { colors } from "@/colors";
import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarbeariaCard } from "../_components/BarbeariaCard";
import { ConfirmBarbeariaModal } from "../_components/ConfirmBarbeariaModal";
import {
  BarbeariaCardDTO,
  barbeariaService,
} from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";
import { userService } from "../services/userService";

export default function BuscarBarbearia() {
  const router = useRouter();

  // Recebe todos os params acumulados desde o cadastro
  const {
    nome = "",
    email = "",
    telefone = "",
    senha = "",
    data_nascimento = "",
  } = useLocalSearchParams<{
    nome?: string;
    email?: string;
    telefone?: string;
    senha?: string;
    data_nascimento?: string;
  }>();

  const [busca, setBusca] = useState("");
  const [barbearias, setBarbearias] = useState<BarbeariaCardDTO[]>([]);
  const [barbeariasFiltradas, setBarbeariasFiltradas] = useState<
    BarbeariaCardDTO[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [barbeariaSelecionada, setBarbeariaSelecionada] =
    useState<BarbeariaCardDTO | null>(null);
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
        b.endereco.toLowerCase().includes(texto.toLowerCase()),
    );
    setBarbeariasFiltradas(filtradas);
  };

  const handleSelecionarBarbearia = (barbearia: BarbeariaCardDTO) => {
    setBarbeariaSelecionada(barbearia);
    setModalVisivel(true);
  };

  // Função utilitária para converter "DD/MM/AAAA" para ISO (AAAA-MM-DD)
  const formatarDataParaISO = (dataStr?: string) => {
    if (!dataStr) return undefined;
    if (dataStr.includes("/")) {
      const [dia, mes, ano] = dataStr.split("/");
      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T00:00:00.000Z`;
    }
    return dataStr;
  };

  const handleConfirmarVinculo = async () => {
    if (!barbeariaSelecionada) return;

    try {
      setSalvando(true);

      const dataFormatada = formatarDataParaISO(data_nascimento);

      // 1. Cria o usuário com a função em maiúsculas
      const novoUsuario = await userService.criarUser({
        nome: nome.trim(),
        email: email.trim().toLowerCase(), 
        telefone: telefone.trim(),
        senha: senha.trim(),
        data_nascimento: dataFormatada,
        funcao: "BARBEIRO",
      });

      const barbeiroId =
        novoUsuario?.barbeiro?.id ||
        (Array.isArray(novoUsuario?.barbeiros)
          ? novoUsuario?.barbeiros[0]?.id
          : novoUsuario?.barbeiros?.id);

      if (!barbeiroId) {
        throw new Error(
          "O cadastro do usuário foi criado, mas a conta de barbeiro associada não foi encontrada.",
        );
      }

      // 4. Vincula a barbearia ao barbeiro
      await barbeiroService.atualizar(barbeiroId, {
        barbearia_id: Number(barbeariaSelecionada.id),
      });

      setModalVisivel(false);
      Alert.alert(
        "Sucesso!",
        "Sua conta de barbeiro foi criada e vinculada com sucesso!",
      );
      router.replace({
        pathname: "/LoginScreen",
        params: { emailCadastrado: email.trim().toLowerCase() }
      });
    } catch (error: any) {
      console.error(
        "Erro detalhado ao cadastrar barbeiro:",
        error?.response?.data || error,
      );

      const mensagemErro =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível concluir o cadastro do barbeiro.";

      Alert.alert(
        "Erro no Cadastro",
        Array.isArray(mensagemErro) ? mensagemErro.join("\n") : mensagemErro,
      );
    } finally {
      setSalvando(false);
    }
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

      {carregando || salvando ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
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
