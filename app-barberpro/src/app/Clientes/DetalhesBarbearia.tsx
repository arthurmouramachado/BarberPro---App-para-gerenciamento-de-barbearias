import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/_components/Button";
import { useAgendamento } from "@/contexts/AgendamentoContext";
import { api } from "@/services/api";
import {
  BarbeariaDetalhesDTO,
  barbeariaService,
} from "@/services/barbeariaService";
import { ServicoDTO } from "@/services/servicosService";

export default function DetalhesBarbearia() {
  console.log("--- CHEGOU NA TELA DETALHES BARBEARIA ---");
  const [barbearia, setBarbearia] = useState<BarbeariaDetalhesDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    barbeariaId: idDoContexto,
    servicoId,
    selecionarServico,
  } = useAgendamento();
  const params = useLocalSearchParams<{ id?: string }>();
  const navigation = useNavigation<any>();

  const barbeariaId = idDoContexto || (params.id ? Number(params.id) : null);

  // Pega a URL do ngrok/backend configurada no Axios
  const BASE_URL = api.defaults.baseURL;

  const handleProsseguir = () => {
     // Trava de segurança: só avança se realmente houver um serviço selecionado
    if (!servicoId) {
    Alert.alert("Atenção", "Por favor, selecione um serviço para continuar.");
    return;
    }

    try {
      
      navigation.navigate("AgendarServico");
      
    } catch (error) {
      console.error("Erro ao navegar para agendamento:", error);
    }
  };

  async function carregarDados() {
    if (!barbeariaId) return;

    try {
      setLoading(true);
      const dados = await barbeariaService.buscarPorId(barbeariaId);
      setBarbearia(dados);
    } catch (err) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar as informações da barbearia.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [barbeariaId]);

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#155DFC" />
      </View>
    );
  }

  // Concatena a URL base com a rota '/uploads/...' do backend
  const fotoUri = barbearia?.foto_url
    ? `${BASE_URL}${barbearia.foto_url}`
    : "https://via.placeholder.com/400x200";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Imagem de Banner da Barbearia */}
      <Image source={{ uri: fotoUri }} style={styles.bannerImagem} />

      {/* 2. Container com Cantos Arredondados (Efeito de Sobreposição) */}
      <View style={styles.contentContainer}>
        <Text style={styles.nomeBarbearia}>
          {barbearia?.nome ?? "Barbearia"}
        </Text>

        {/* Avaliação */}
        <View style={styles.avaliacaoRow}>
          <Text style={styles.estrelaIcon}>★</Text>
          <Text style={styles.mediaNota}>
            {barbearia?.mediaAvaliacoes
              ? barbearia.mediaAvaliacoes.toFixed(1)
              : "5.0"}
          </Text>
        </View>

        {/* Seção de Serviços */}
        <Text style={styles.tituloSecao}>Serviços</Text>

        {barbearia?.servicos && barbearia.servicos.length > 0 ? (
          barbearia.servicos.map((servico) => {
            const isSelected = servico.id === servicoId;

            return (
              <TouchableOpacity
                key={servico.id}
                activeOpacity={0.7}
                onPress={() => selecionarServico(servico.id)}
                style={[
                  styles.cardServico,
                  isSelected && styles.cardServicoSelecionado,
                ]}
              >
                <View style={styles.infoServico}>
                  <Text
                    style={[styles.nomeServico, isSelected && styles.textoAzul]}
                  >
                    {servico.nome}
                  </Text>
                  {servico.duracaoMinutos && (
                    <Text style={styles.duracaoServico}>
                      {servico.duracaoMinutos} min
                    </Text>
                  )}
                </View>

                <Text
                  style={[styles.precoServico, isSelected && styles.textoAzul]}
                >
                  R$ {Number(servico.preco).toFixed(2).replace(".", ",")}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.semServicos}>Nenhum serviço cadastrado.</Text>
        )}

        {/* Botão de Prosseguir */}
        <View style={styles.containerBotao}>
          <Button
            label="Prosseguir"
            isActive={!!servicoId}
            onPress={() => handleProsseguir()}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImagem: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -30, // Eleva o card para sobrepor a foto
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  nomeBarbearia: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  avaliacaoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
    gap: 4,
  },
  estrelaIcon: {
    color: "#EAB308",
    fontSize: 16,
  },
  mediaNota: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  tituloSecao: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
    marginBottom: 12,
  },
  cardServico: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardServicoSelecionado: {
    borderColor: "#155DFC",
    borderWidth: 2,
    backgroundColor: "#EFF6FF",
  },
  infoServico: {
    flex: 1,
    gap: 4,
  },
  nomeServico: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  duracaoServico: {
    fontSize: 13,
    color: "#64748B",
  },
  precoServico: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  textoAzul: {
    color: "#155DFC",
  },
  semServicos: {
    color: "#94A3B8",
    marginVertical: 12,
  },
  containerBotao: {
    marginTop: 20,
    alignItems: "center",
  },
});
