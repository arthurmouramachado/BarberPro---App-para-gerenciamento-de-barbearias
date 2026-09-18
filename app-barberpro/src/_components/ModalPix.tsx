import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Image,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { pagamentoService } from "@/services/pagamentoService";

interface ModalPixProps {
  visible: boolean;
  onClose: () => void;
  agendamentoId: number;
  valor: number;
  nomeServico?: string;
  onSuccess: () => void;
}

export const ModalPix: React.FC<ModalPixProps> = ({
  visible,
  onClose,
  agendamentoId,
  valor,
  nomeServico,
  onSuccess,
}) => {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados do Pagamento Real
  const [pixGerado, setPixGerado] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [pagamentoId, setPagamentoId] = useState<number | null>(null);
  const [codigoPix, setCodigoPix] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const geracaoAtual = useRef(0);

  // ==================================================
  // LIMPEZA DO POLLING
  // ==================================================
  const pararPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // ==================================================
  // POLLING: VERIFICAR STATUS DO PAGAMENTO NA API
  // ==================================================
  useEffect(() => {
    if (!visible || !pixGerado || !pagamentoId || confirmado) return;

    let ativo = true;
    let consultando = false;
    const verificar = async () => {
      if (consultando) return;
      consultando = true;
      try {
        const res = await pagamentoService.verificarStatus(pagamentoId);
        if (!ativo) return;
        const pago = [res?.status, res?.localStatus, res?.abacateStatus, res?.data?.status]
          .some((status) => ["CONFIRMADO", "PAID", "PAGO", "COMPLETED"]
            .includes(String(status ?? "").trim().toUpperCase()));
        if (pago) {
          pararPolling();
          setConfirmado(true);
        }
      } catch (error) {
        if (ativo) console.warn("Erro ao checar status do pagamento:", error);
      } finally {
        consultando = false;
      }
    };

    pollingRef.current = setInterval(() => { void verificar(); }, 3500);
    void verificar();
    return () => {
      ativo = false;
      pararPolling();
    };
  }, [visible, pixGerado, pagamentoId, confirmado]);

  useEffect(() => {
    geracaoAtual.current += 1;
    resetarEstados();
    setLoading(false);
    return () => {
      geracaoAtual.current += 1;
      pararPolling();
    };
  }, [agendamentoId]);

  // ==================================================
  // 1. GERAR PIX VIA API
  // ==================================================
  const handleGerarPix = async () => {
    if (loading || pixGerado) return;
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      Alert.alert(
        "CPF Inválido",
        "Por favor, informe um CPF válido com 11 dígitos."
      );
      return;
    }

    const numeroGeracao = ++geracaoAtual.current;
    setLoading(true);

    try {
      const response = await pagamentoService.criarPix({
        agendamento_id: agendamentoId,
        valor: valor,
        metodo: "PIX",
        cpf: cpfLimpo,
      });
      if (numeroGeracao !== geracaoAtual.current) return;

      // Suporta múltiplos formatos de resposta da sua API/AbacatePay
      const idRetornado =
        response?.pagamentoId ||
        response?.id ||
        response?.pagamento?.id ||
        response?.data?.id;

      const pixString =
        response?.brCode ||
        response?.pixCopiaECola ||
        response?.codigoPix ||
        response?.emv ||
        response?.data?.brCode ||
        response?.data?.pixCopiaECola ||
        "";

      const rawQrCode =
        response?.brCodeBase64 ||
        response?.qrCodeUrl ||
        response?.qrCodeBase64 ||
        response?.imagemQrcode ||
        response?.data?.brCodeBase64 ||
        response?.data?.qrCodeUrl ||
        null;

      if (!Number.isInteger(Number(idRetornado)) || Number(idRetornado) <= 0 || typeof pixString !== "string" || !pixString.trim()) {
        throw new Error("A API não retornou um pagamento válido com o código Pix.");
      }

      const formattedQrCode = typeof rawQrCode === "string" && rawQrCode
        ? rawQrCode.startsWith("http") || rawQrCode.startsWith("data:")
          ? rawQrCode
          : `data:image/png;base64,${rawQrCode}`
        : null;

      setPagamentoId(Number(idRetornado));
      setCodigoPix(pixString);
      setQrCodeUrl(formattedQrCode);
      setPixGerado(true);
    } catch (error: any) {
      if (numeroGeracao !== geracaoAtual.current) return;
      console.error("Erro ao gerar PIX:", error?.response?.data || error?.message);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Não foi possível gerar a cobrança PIX. Verifique sua conexão e tente novamente.";
      Alert.alert("Erro ao gerar PIX", Array.isArray(msg) ? msg.join("\n") : msg);
    } finally {
      if (numeroGeracao === geracaoAtual.current) setLoading(false);
    }
  };

  // ==================================================
  // 2. COPIAR CÓDIGO PIX
  // ==================================================
  const handleCopiarPix = async () => {
    if (!codigoPix) {
      Alert.alert("Aviso", "Código PIX indisponível para cópia.");
      return;
    }

    await Clipboard.setStringAsync(codigoPix);

    Alert.alert(
      "Copiado!",
      "Código PIX copiado para a área de transferência."
    );
  };

  // ==================================================
  // 3. SIMULAR PAGAMENTO (MODO DEV)
  // ==================================================
  const handleSimularPagamento = async () => {
    if (!__DEV__ || !pagamentoId || loading) return;
    const numeroGeracao = geracaoAtual.current;
    setLoading(true);

    try {
      const resposta = await pagamentoService.simularPagamento(pagamentoId);
      if (numeroGeracao !== geracaoAtual.current) return;
      if (resposta?.success !== true) {
        throw new Error("A API não confirmou a simulação do pagamento.");
      }
      pararPolling();
      setConfirmado(true);

      Alert.alert(
        "Pagamento Confirmado!",
        "Pagamento simulado com sucesso via API."
      );
    } catch (error: any) {
      if (numeroGeracao !== geracaoAtual.current) return;
      Alert.alert(
        "Erro na simulação",
        error?.response?.data?.message || "A simulação falhou. O pagamento continua aguardando confirmação."
      );
    } finally {
      if (numeroGeracao === geracaoAtual.current) setLoading(false);
    }
  };

  // ==================================================
  // 4. FINALIZAR
  // ==================================================
  const handleFinalizar = () => {
    if (!confirmado) return;
    pararPolling();
    onSuccess();
  };

  // ==================================================
  // 5. FECHAR
  // ==================================================
  const handleFechar = () => {
    pararPolling();
    // Preserva a cobrança para reabrir o mesmo Pix sem criar outro pagamento.
    onClose();
  };

  const resetarEstados = () => {
    setPixGerado(false);
    setConfirmado(false);
    setCpf("");
    setPagamentoId(null);
    setCodigoPix("");
    setQrCodeUrl(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleFechar}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Pagamento PIX</Text>

            {nomeServico && <Text style={styles.subtitle}>{nomeServico}</Text>}

            <Text style={styles.valor}>
              R$ {valor.toFixed(2).replace(".", ",")}
            </Text>

            {/* ==========================================
                PAGAMENTO CONFIRMADO
            ========================================== */}
            {confirmado ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✓</Text>

                <Text style={styles.successTitle}>Pagamento Confirmado!</Text>

                <Text style={styles.successSubtitle}>
                  Seu agendamento foi finalizado com sucesso.
                </Text>

                <View style={styles.agendamentoBox}>
                  <Text style={styles.agendamentoLabel}>Agendamento</Text>
                  <Text style={styles.agendamentoValue}>#{agendamentoId}</Text>
                </View>

                <TouchableOpacity
                  style={styles.finalizarButton}
                  onPress={handleFinalizar}
                >
                  <Text style={styles.finalizarText}>Finalizar</Text>
                </TouchableOpacity>
              </View>
            ) : !pixGerado ? (
              /* ========================================
                  FORMULÁRIO CPF
              ======================================== */
              <View style={styles.stepContainer}>
                <Text style={styles.label}>CPF do Titular do Pagamento:</Text>

                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#888"
                  value={cpf}
                  onChangeText={setCpf}
                  keyboardType="numeric"
                  maxLength={14}
                  editable={!loading}
                />

                <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={handleGerarPix}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#1E1E24" />
                  ) : (
                    <Text style={styles.buttonText}>Gerar QR Code PIX</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* ========================================
                  PIX GERADO / QR CODE
              ======================================== */
              <View style={styles.stepContainer}>
                <View style={styles.fakeQRCode}>
                  {qrCodeUrl ? (
                    <Image
                      source={{ uri: qrCodeUrl }}
                      style={{ width: 190, height: 190, borderRadius: 8 }}
                      resizeMode="contain"
                    />
                  ) : (
                   <Text style={{ color: "#475569", textAlign: "center" }}>
                      A imagem do QR Code não está disponível. Use o botão Copiar Código PIX.
                    </Text>
                  )}
                </View>

                <Text style={styles.pixInfo}>
                  Escaneie o QR Code ou copie a chave com o app do seu banco
                </Text>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopiarPix}
                >
                  <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
                </TouchableOpacity>

                <View style={styles.statusRow}>
                  <ActivityIndicator size="small" color="#E5BF60" />
                  <Text style={styles.statusText}>
                    Aguardando confirmação do pagamento...
                  </Text>
                </View>

                {/* BOTÃO DE TESTES / DEV */}
               {__DEV__ && <TouchableOpacity
                  style={styles.simularButton}
                  onPress={handleSimularPagamento}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#D4B2FF" />
                  ) : (
                    <Text style={styles.simularText}> Simular Pagamento</Text>
                  )}
                </TouchableOpacity>}
              </View>
            )}
          </ScrollView>

          {!confirmado && (
            <TouchableOpacity style={styles.closeButton} onPress={handleFechar}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#1E1E24",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#AAA",
    marginBottom: 8,
  },
  valor: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E5BF60",
    marginBottom: 20,
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#CCC",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#2A2A32",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#E5BF60",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#1E1E24",
    fontSize: 16,
    fontWeight: "bold",
  },
  fakeQRCode: {
    width: 220,
    height: 220,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  qrPattern: {
    width: 190,
    height: 190,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  qrPixel: {
    width: 19,
    height: 19,
    backgroundColor: "#000",
  },
  pixInfo: {
    color: "#AAA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  copyButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#2A2A32",
    borderColor: "#E5BF60",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  copyButtonText: {
    color: "#E5BF60",
    fontSize: 16,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  statusText: {
    color: "#AAA",
    fontSize: 14,
  },
  simularButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#332940",
    borderRadius: 8,
    marginBottom: 10,
  },
  simularText: {
    color: "#D4B2FF",
    fontSize: 13,
    fontWeight: "600",
  },
  successBox: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
    fontSize: 45,
    textAlign: "center",
    lineHeight: 70,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
  },
  successSubtitle: {
    color: "#CCC",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  agendamentoBox: {
    width: "100%",
    backgroundColor: "#2A2A32",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  agendamentoLabel: {
    color: "#999",
    fontSize: 12,
  },
  agendamentoValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  finalizarButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  finalizarText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#888",
    fontSize: 16,
  },
});
