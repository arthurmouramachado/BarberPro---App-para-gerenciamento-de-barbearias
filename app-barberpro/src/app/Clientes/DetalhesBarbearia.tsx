import { useLocalSearchParams, useNavigation } from "expo-router";
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

type PlanoDTO = {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
};

type BarbeariaDetalhesDTOComPlanos = BarbeariaDetalhesDTO & {
  planos?: PlanoDTO[];
};

export default function DetalhesBarbearia() {
  const [barbearia, setBarbearia] = useState<BarbeariaDetalhesDTOComPlanos | null>(null);
  const [loading, setLoading] = useState(false);

  // No contexto, você pode guardar se o usuário escolheu um 'servico' ou um 'plano'
  const {
    barbeariaId: idDoContexto,
    servicoId,
    planoId, 
    selecionarServico,
    selecionarPlano,   
  } = useAgendamento();

  const params = useLocalSearchParams<{ id?: string }>();
  const navigation = useNavigation<any>();

  const barbeariaId = idDoContexto || (params.id ? Number(params.id) : null);
  const BASE_URL = api.defaults.baseURL;

  const handleProsseguir = () => {
    // Trava de segurança: avança se tiver serviço OU plano selecionado
    if (!servicoId && !planoId) {
      Alert.alert("Atenção", "Selecione um serviço ou plano para continuar.");
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
        "Não foi possível carregar as informações da barbearia."
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

  const fotoUri = barbearia?.foto_url
    ? `${BASE_URL}${barbearia.foto_url}`
    : "https://via.placeholder.com/400x200";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner da Barbearia */}
      <Image source={{ uri: fotoUri }} style={styles.bannerImagem} />

      {/* Conteúdo */}
      <View style={styles.contentContainer}>
        <Text style={styles.nomeBarbearia}>
          {barbearia?.nome ?? "Barbearia"}
        </Text>

        <View style={styles.avaliacaoRow}>
          <Text style={styles.estrelaIcon}>★</Text>
          <Text style={styles.mediaNota}>
            {barbearia?.mediaAvaliacoes
              ? barbearia.mediaAvaliacoes.toFixed(1)
              : "5.0"}
          </Text>
        </View>

        {/* 1. SEÇÃO DE SERVIÇOS AVULSOS */}
        <Text style={styles.tituloSecao}>Serviços</Text>
        <Text style={styles.subtituloSecao}>Pagamento realizado no estabelecimento</Text>

        {barbearia?.servicos && barbearia.servicos.length > 0 ? (
          barbearia.servicos.map((servico) => {
            const isSelected = servico.id === servicoId && !planoId;

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
          <Text style={styles.semServicos}>Nenhum serviço disponível.</Text>
        )}

        {/* 2. SEÇÃO DE PACOTES */}
        <Text style={[styles.tituloSecao, { marginTop: 24 }]}>
         Pacotes
        </Text>
        <Text style={styles.subtituloSecao}>
          Pague no app via PIX ou Cartão e economize
        </Text>

        {barbearia?.planos && barbearia.planos.length > 0 ? (
          barbearia.planos.map((plano) => {
            const isSelected = plano.id === planoId;

            return (
              <TouchableOpacity
                key={plano.id}
                activeOpacity={0.7}
                onPress={() => selecionarPlano(plano.id)}
                style={[
                  styles.cardServico,
                  isSelected && styles.cardServicoSelecionado,
                ]}
              >
                <View style={styles.infoServico}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeTexto}>ONLINE</Text>
                  </View>
                  <Text
                    style={[styles.nomeServico, isSelected && styles.textoAzul]}
                  >
                    {plano.nome}
                  </Text>
                  {plano.descricao && (
                    <Text style={styles.duracaoServico}>{plano.descricao}</Text>
                  )}
                </View>

                <Text
                  style={[styles.precoServico, isSelected && styles.textoAzul]}
                >
                  R$ {Number(plano.preco).toFixed(2).replace(".", ",")}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.semServicos}>
            Nenhum pacote disponível nesta barbearia.
          </Text>
        )}

        <View style={styles.containerBotao}>
          <Button
            label="Prosseguir"
            isActive={!!servicoId || !!planoId}
            onPress={() => handleProsseguir()}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerImagem: { width: "100%", height: 200, resizeMode: "cover" },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  nomeBarbearia: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0F172A" },
  avaliacaoRow: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 20, gap: 4 },
  estrelaIcon: { color: "#EAB308", fontSize: 16 },
  mediaNota: { fontSize: 14, fontWeight: "600", color: "#475569" },
  tituloSecao: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0F172A" },
  subtituloSecao: { fontSize: 12, color: "#64748B", marginBottom: 12 },
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
  infoServico: { flex: 1, gap: 4 },
  nomeServico: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  duracaoServico: { fontSize: 13, color: "#64748B" },
  precoServico: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  textoAzul: { color: "#155DFC" },
  semServicos: { color: "#94A3B8", marginVertical: 8 },
  containerBotao: { marginTop: 20, alignItems: "center" },
  tagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeTexto: { fontSize: 10, fontWeight: "700", color: "#166534" },
});