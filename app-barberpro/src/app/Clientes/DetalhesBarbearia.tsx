import Feather from "@expo/vector-icons/Feather";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/_components/Button";
import { useAgendamento } from "@/contexts/AgendamentoContext";
import { avaliacoesService } from "@/services/avaliacoes";
import { barbeariaService } from "@/services/barbeariaService";
import { servicosService } from "@/services/servicosService";

// ======================================================
// TIPOS
// ======================================================

export type ServicoItem = {
  id: number;
  nome: string;
  duracao_minutos?: number;
  duracao?: number;
  preco: number;
  descricao?: string;
  tipo?: string;
  ativo?: boolean;
};

export type BarbeariaDetalhes = {
  id: number;
  nome: string;
  foto_url?: string;
  endereco?: string;
  diaEHorario?: string;
  mediaAvaliacoes?: number;
  totalAvaliacoes?: number;
};

// ======================================================
// TELA
// ======================================================

export default function DetalhesBarbearia() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    barbeariaId,
    selecionarBarbearia,
    selecionarServico,
    selecionarPlano,
    servicoId: servicoIdContexto,
    planoId: planoIdContexto,
  } = useAgendamento();

  // ID da barbearia: capturado via parâmetro de rota ou pelo contexto
  const idDaBarbearia = id ? Number(id) : barbeariaId || null;

  // ====================================================
  // ESTADOS
  // ====================================================

  const [barbearia, setBarbearia] = useState<BarbeariaDetalhes | null>(null);
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [planos, setPlanos] = useState<ServicoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState<string | null>(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState<number>(0);

  const [servicoSelecionado, setServicoSelecionado] = useState<number | null>(
    servicoIdContexto || null,
  );
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(
    planoIdContexto || null,
  );

  // ====================================================
  // CARREGAR DADOS DA API
  // ====================================================

  const carregarDados = useCallback(
    async (isRefreshing = false) => {
      if (!idDaBarbearia) {
        setLoading(false);
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const idNumero = Number(idDaBarbearia);
        selecionarBarbearia(idNumero);

        let dadosBarbearia: BarbeariaDetalhes | null = null;
        let servicosRetornados: ServicoItem[] = [];

        // 1. Buscar detalhes da Barbearia
        try {
          const resposta = await barbeariaService.buscarPorId(idNumero);
          if (resposta) {
            dadosBarbearia = {
              id: resposta.id,
              nome: resposta.nome,
              foto_url: resposta.foto_url,
              endereco: resposta.endereco,
              diaEHorario: resposta.diaEHorario,
              mediaAvaliacoes: resposta.mediaAvaliacoes,
            };

            if (
              Array.isArray(resposta.servicos) &&
              resposta.servicos.length > 0
            ) {
              servicosRetornados = resposta.servicos as any;
            }
          }
        } catch (err) {
          console.warn("buscarPorId direto falhou, buscando lista geral:", err);
          try {
            const todas = await barbeariaService.listarTodas();
            const encontrada = todas.find((b) => b.id === idNumero);
            if (encontrada) {
              dadosBarbearia = encontrada;
            }
          } catch (listErr) {
            console.error("Erro ao listar barbearias no fallback:", listErr);
          }
        }

        // 2. Buscar avaliações reais da barbearia pela API
        try {
          const todasAvaliacoes = await avaliacoesService.listarTodas();
          const avaliacoesDaBarbearia = Array.isArray(todasAvaliacoes)
            ? todasAvaliacoes.filter(
                (item: any) =>
                  item.agendamentos?.barbearia_id === idNumero ||
                  item.agendamentos?.barbearias?.id === idNumero,
              )
            : [];

          if (avaliacoesDaBarbearia.length > 0) {
            const soma = avaliacoesDaBarbearia.reduce(
              (acc: number, item: any) => acc + (item.nota || 0),
              0,
            );
            const media = (soma / avaliacoesDaBarbearia.length).toFixed(1);
            setMediaAvaliacoes(media);
            setTotalAvaliacoes(avaliacoesDaBarbearia.length);
          } else if (dadosBarbearia?.mediaAvaliacoes) {
            // Fallback: usa o campo mediaAvaliacoes retornado pela barbearia
            setMediaAvaliacoes(
              Number(dadosBarbearia.mediaAvaliacoes).toFixed(1),
            );
            setTotalAvaliacoes(0);
          } else {
            setMediaAvaliacoes(null);
            setTotalAvaliacoes(0);
          }
        } catch (avalErr) {
          console.warn("Erro ao buscar avaliações:", avalErr);
          // Fallback: usa o campo retornado pela barbearia (se disponível)
          if (dadosBarbearia?.mediaAvaliacoes) {
            setMediaAvaliacoes(
              Number(dadosBarbearia.mediaAvaliacoes).toFixed(1),
            );
          } else {
            setMediaAvaliacoes(null);
          }
          setTotalAvaliacoes(0);
        }

        setBarbearia(dadosBarbearia);

        // 2. Se a barbearia não trouxe serviços embutidos, buscar endpoint de serviços
        if (servicosRetornados.length === 0) {
          try {
            const servicosApi = await servicosService.listarTodas(idNumero);
            if (Array.isArray(servicosApi)) {
              servicosRetornados = servicosApi as any;
            }
          } catch (servErr) {
            console.warn(
              "Erro ao buscar serviços avulsos via servicosService:",
              servErr,
            );
          }
        }

        // 3. Filtrar ativos e separar em Serviços e Planos/Pacotes
        const itensAtivos = servicosRetornados.filter(
          (item) => item.ativo !== false,
        );

        const listaServicos = itensAtivos.filter(
          (item) => item.tipo !== "PACOTE" && item.tipo !== "PLANO",
        );
        const listaPlanos = itensAtivos.filter(
          (item) => item.tipo === "PACOTE" || item.tipo === "PLANO",
        );

        setServicos(listaServicos);
        setPlanos(listaPlanos);

        // 4. Se nada estiver selecionado, auto-seleciona o primeiro serviço para conveniência
        if (!servicoSelecionado && !planoSelecionado) {
          if (listaServicos.length > 0) {
            setServicoSelecionado(listaServicos[0].id);
            selecionarServico(listaServicos[0].id);
          } else if (listaPlanos.length > 0) {
            setPlanoSelecionado(listaPlanos[0].id);
            selecionarPlano(listaPlanos[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar barbearia:", error);
        Alert.alert(
          "Erro",
          "Não foi possível carregar os detalhes da barbearia.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idDaBarbearia],
  );

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ====================================================
  // SELECIONAR SERVIÇO
  // ====================================================

  const handleSelecionarServico = (id: number) => {
    setServicoSelecionado(id);
    setPlanoSelecionado(null);
    selecionarServico(id);
  };

  // ====================================================
  // SELECIONAR PLANO
  // ====================================================

  const handleSelecionarPlano = (id: number) => {
    setPlanoSelecionado(id);
    setServicoSelecionado(null);
    selecionarPlano(id);
  };

  // ====================================================
  // PROSSEGUIR
  // ====================================================

  const handleProsseguir = () => {
    if (!servicoSelecionado && !planoSelecionado) {
      Alert.alert("Atenção", "Selecione um serviço ou plano para continuar.");
      return;
    }

    try {
      router.push("/Clientes/AgendarServico");
    } catch (error) {
      console.error("Erro ao navegar para agendamento:", error);
    }
  };

  // ====================================================
  // ESTADO DE CARREGAMENTO
  // ====================================================

  if (loading) {
    return (
      <View style={styles.centroContainer}>
        <ActivityIndicator size="large" color="#155DFC" />
        <Text style={styles.loadingTexto}>Carregando barbearia...</Text>
      </View>
    );
  }

  // ====================================================
  // ESTADO DE ERRO OU NÃO ENCONTRADO
  // ====================================================

  if (!barbearia) {
    return (
      <View style={styles.centroContainer}>
        <Feather name="alert-circle" size={50} color="#EF4444" />
        <Text style={styles.erroTitulo}>Barbearia não encontrada</Text>
        <Text style={styles.erroSubtitulo}>
          Não foi possível encontrar as informações desta barbearia.
        </Text>
        <TouchableOpacity
          style={styles.botaoTentarNovamente}
          onPress={() => carregarDados()}
          activeOpacity={0.8}
        >
          <Text style={styles.botaoTentarNovamenteTexto}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoVoltarErro}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoVoltarErroTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fotoUri =
    barbearia.foto_url && barbearia.foto_url.startsWith("http")
      ? barbearia.foto_url
      : null;

  return (
    <View style={styles.container}>
      {/* BOTÃO VOLTAR FLUTUANTE */}
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Feather name="arrow-left" size={22} color="#0F172A" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarDados(true)}
            colors={["#155DFC"]}
            tintColor="#155DFC"
          />
        }
      >
        {/* ==================================================
            BANNER
        ================================================== */}
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.bannerImagem} />
        ) : (
          <View style={[styles.bannerImagem, styles.bannerPlaceholder]}>
            <Feather name="scissors" size={40} color="#CBD5E1" />
            <Text style={styles.bannerPlaceholderTexto}>{barbearia.nome}</Text>
          </View>
        )}

        {/* ==================================================
            CONTEÚDO
        ================================================== */}
        <View style={styles.contentContainer}>
          {/* NOME */}
          <Text style={styles.nomeBarbearia}>{barbearia.nome}</Text>

          {/* AVALIAÇÃO */}
          {mediaAvaliacoes !== null ? (
            <View style={styles.avaliacaoRow}>
              <Text style={styles.estrelaIcon}>★</Text>
              <Text style={styles.mediaNota}>{mediaAvaliacoes}</Text>
              <Text style={styles.avaliacaoTexto}>
                {Number(mediaAvaliacoes) >= 4.5 ? "Excelente" : "Muito bom"}
              </Text>
              {totalAvaliacoes > 0 && (
                <Text style={styles.totalAvaliacoes}>
                  ({totalAvaliacoes} avaliações)
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.avaliacaoRow}>
              <Feather name="star" size={15} color="#94A3B8" />
              <Text style={styles.semAvaliacaoTexto}>Sem avaliações ainda</Text>
            </View>
          )}

          {/* ENDEREÇO E HORÁRIO */}
          {barbearia.endereco ? (
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={15} color="#64748B" />
              <Text style={styles.infoTexto}>{barbearia.endereco}</Text>
            </View>
          ) : null}

          {barbearia.diaEHorario ? (
            <View style={styles.infoRow}>
              <Feather name="clock" size={15} color="#64748B" />
              <Text style={styles.infoTexto}>{barbearia.diaEHorario}</Text>
            </View>
          ) : null}

          {/* ==================================================
              SERVIÇOS
          ================================================== */}
          <View style={styles.secaoHeader}>
            <Text style={styles.tituloSecao}>Serviços</Text>
            <Text style={styles.subtituloSecao}>
              Pagamento realizado no estabelecimento
            </Text>
          </View>

          {servicos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTexto}>
                Nenhum serviço cadastrado para esta barbearia no momento.
              </Text>
            </View>
          ) : (
            servicos.map((servico) => {
              const isSelected = servico.id === servicoSelecionado;
              const duracao = servico.duracao_minutos || servico.duracao || 30;

              return (
                <TouchableOpacity
                  key={servico.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelecionarServico(servico.id)}
                  style={[
                    styles.cardServico,
                    isSelected && styles.cardServicoSelecionado,
                  ]}
                >
                  <View style={styles.infoServico}>
                    <Text
                      style={[
                        styles.nomeServico,
                        isSelected && styles.textoAzul,
                      ]}
                    >
                      {servico.nome}
                    </Text>

                    {duracao ? (
                      <Text style={styles.duracaoServico}>{duracao} min</Text>
                    ) : null}

                    {servico.descricao ? (
                      <Text style={styles.descricaoServico}>
                        {servico.descricao}
                      </Text>
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.precoServico,
                      isSelected && styles.textoAzul,
                    ]}
                  >
                    R${" "}
                    {Number(servico.preco || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}

          {/* ==================================================
              PACOTES (SE HOUVER)
          ================================================== */}
          {planos.length > 0 && (
            <>
              <View style={[styles.secaoHeader, { marginTop: 24 }]}>
                <Text style={styles.tituloSecao}>Pacotes & Planos</Text>
                <Text style={styles.subtituloSecao}>
                  Pague no app via PIX ou Cartão e economize
                </Text>
              </View>

              {planos.map((plano) => {
                const isSelected = plano.id === planoSelecionado;

                return (
                  <TouchableOpacity
                    key={plano.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelecionarPlano(plano.id)}
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
                        style={[
                          styles.nomeServico,
                          isSelected && styles.textoAzul,
                        ]}
                      >
                        {plano.nome}
                      </Text>

                      {plano.descricao ? (
                        <Text style={styles.duracaoServico}>
                          {plano.descricao}
                        </Text>
                      ) : null}
                    </View>

                    <Text
                      style={[
                        styles.precoServico,
                        isSelected && styles.textoAzul,
                      ]}
                    >
                      R${" "}
                      {Number(plano.preco || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* ==================================================
              BOTÃO
          ================================================== */}
          <View style={styles.containerBotao}>
            <Button
              label="Prosseguir"
              isActive={!!servicoSelecionado || !!planoSelecionado}
              onPress={handleProsseguir}
            />
          </View>
        </View>
      </ScrollView>
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
  },

  centroContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingTexto: {
    marginTop: 14,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  erroTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
  },

  erroSubtitulo: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  botaoTentarNovamente: {
    backgroundColor: "#155DFC",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  botaoTentarNovamenteTexto: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  botaoVoltarErro: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  botaoVoltarErroTexto: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 14,
  },

  botaoVoltar: {
    position: "absolute",
    top: 48,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  bannerImagem: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },

  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -28,
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
    marginBottom: 10,
    gap: 5,
  },

  estrelaIcon: {
    color: "#EAB308",
    fontSize: 18,
  },

  mediaNota: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  avaliacaoTexto: {
    fontSize: 13,
    color: "#64748B",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  infoTexto: {
    fontSize: 13,
    color: "#64748B",
  },

  secaoHeader: {
    marginTop: 20,
  },

  tituloSecao: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },

  subtituloSecao: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 12,
  },

  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyTexto: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
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
    paddingRight: 12,
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

  descricaoServico: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  precoServico: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  textoAzul: {
    color: "#155DFC",
  },

  bannerPlaceholder: {
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  bannerPlaceholderTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  totalAvaliacoes: {
    fontSize: 12,
    color: "#94A3B8",
  },

  semAvaliacaoTexto: {
    fontSize: 13,
    color: "#94A3B8",
    marginLeft: 4,
  },

  containerBotao: {
    marginTop: 24,
    alignItems: "center",
  },

  tagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },

  tagBadgeTexto: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
});
