import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { pagamentoService } from '../services/pagamentoService';

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
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    pagamentoId: number;
    brCode: string;
    brCodeBase64: string;
    status: string;
  } | null>(null);

  // Polling automático para verificar a confirmação do pagamento
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (pixData?.pagamentoId && pixData.status !== 'Confirmado') {
      interval = setInterval(async () => {
        try {
          const res = await pagamentoService.verificarStatus(pixData.pagamentoId);
          if (res.abacateStatus === 'PAID' || res.localStatus === 'Confirmado') {
            setPixData((prev) => (prev ? { ...prev, status: 'Confirmado' } : null));
            if (interval) clearInterval(interval);
            Alert.alert('Sucesso!', 'Pagamento verificado com sucesso!');
            onSuccess();
          }
        } catch (error) {
          console.log('Erro ao checar status do pagamento:', error);
        }
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixData?.pagamentoId, pixData?.status]);

  const handleGerarPix = async () => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      Alert.alert('CPF Inválido', 'Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const data = await pagamentoService.criarPix({
        agendamento_id: agendamentoId,
        valor,
        metodo: 'PIX',
        cpf: cpfLimpo,
      });

      setPixData(data);
    } catch (error: any) {
      Alert.alert(
        'Erro ao Gerar PIX',
        error?.response?.data?.message || 'Ocorreu um erro ao conectar com o servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarPix = async () => {
    if (pixData?.brCode) {
      await Clipboard.setStringAsync(pixData.brCode);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
    }
  };

  const handleSimularPagamento = async () => {
    if (!pixData?.pagamentoId) return;
    try {
      await pagamentoService.simularPagamento(pixData.pagamentoId);
      Alert.alert('Simulação enviada', 'Em alguns segundos a confirmação será detectada pelo aplicativo.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível simular o pagamento.');
    }
  };

  const handleFechar = () => {
    setPixData(null);
    setCpf('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleFechar}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Pagamento PIX</Text>
            {nomeServico && <Text style={styles.subtitle}>{nomeServico}</Text>}
            <Text style={styles.valor}>R$ {valor.toFixed(2)}</Text>

            {!pixData ? (
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
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleGerarPix}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Gerar QR Code PIX</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.stepContainer}>
                {pixData.status === 'Confirmado' ? (
                  <View style={styles.successBox}>
                    <Text style={styles.successTitle}>✓ Pagamento Confirmado!</Text>
                    <Text style={styles.successSubtitle}>Seu agendamento foi finalizado com sucesso.</Text>
                  </View>
                ) : (
                  <>
                    <Image
                      source={{
                        uri: pixData.brCodeBase64.startsWith('data:')
                          ? pixData.brCodeBase64
                          : `data:image/png;base64,${pixData.brCodeBase64}`,
                      }}
                      style={styles.qrCode}
                      resizeMode="contain"
                    />

                    <TouchableOpacity style={styles.copyButton} onPress={handleCopiarPix}>
                      <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
                    </TouchableOpacity>

                    <View style={styles.statusRow}>
                      <ActivityIndicator size="small" color="#E5BF60" />
                      <Text style={styles.statusText}>Aguardando confirmação do pagamento...</Text>
                    </View>

                    <TouchableOpacity style={styles.simularButton} onPress={handleSimularPagamento}>
                      <Text style={styles.simularText}>🧪 Simular Pagamento (DevMode)</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={handleFechar}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1E1E24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 20,
  },
  scrollContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 8,
  },
  valor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E5BF60',
    marginBottom: 20,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#CCC',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2A2A32',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#E5BF60',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#1E1E24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrCode: {
    width: 220,
    height: 220,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  copyButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2A2A32',
    borderColor: '#E5BF60',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButtonText: {
    color: '#E5BF60',
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#AAA',
    fontSize: 14,
  },
  simularButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#332940',
    borderRadius: 8,
    marginBottom: 10,
  },
  simularText: {
    color: '#D4B2FF',
    fontSize: 13,
    fontWeight: '600',
  },
  successBox: {
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successSubtitle: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#888',
    fontSize: 16,
  },
});