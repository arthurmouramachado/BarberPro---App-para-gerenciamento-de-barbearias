import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import { useAgendamento } from '@/contexts/AgendamentoContext';
import { barbeiroService } from '@/services/barbeiroService';

export default function AgendarServico() {
  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [loadingBarbeiros, setLoadingBarbeiros] = useState(false);
  const { barbeiroId, barbeariaId, selecionarBarbeiro } = useAgendamento();

  async function carregarBarbeiro() {
    if (!barbeariaId) return;
    try {
      setLoadingBarbeiros(true);
      const dados = await barbeiroService.listarPorBarbearia(barbeariaId);
      setBarbeiros(dados);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os Barbeiros');
    } finally {
      setLoadingBarbeiros(false);
    }
  }

  useEffect(() => {
    carregarBarbeiro();
  }, [barbeariaId]);

  return (
    <View style={styles.container}>
      {/* Bloco Superior dos Barbeiros (Conforme o Rascunho) */}
      <View style={styles.headerBarbeiros}>
        <FlatList
          data={barbeiros}
          keyExtractor={(item) => String(item.id)}
          refreshing={loadingBarbeiros}
          onRefresh={carregarBarbeiro}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
          renderItem={({ item }) => {
            const isSelected = item.id === barbeiroId;
            const nomeBarbeiro = item.usuarios?.nome ?? 'Barbeiro';

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => selecionarBarbeiro(item.id)}
                style={styles.barbeiroItem}
              >
                {/* Avatar Circular */}
                <View
                  style={[
                    styles.avatarCircle,
                    isSelected && styles.avatarCircleSelecionado,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarTexto,
                      isSelected && styles.avatarTextoSelecionado,
                    ]}
                  >
                    {nomeBarbeiro.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Nome simplificado abaixo do círculo */}
                <Text
                  style={[
                    styles.nomeBarbeiro,
                    isSelected && styles.nomeBarbeiroSelecionado,
                  ]}
                  numberOfLines={1}
                >
                  {nomeBarbeiro.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <Calendar/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 16,
  },
  headerBarbeiros: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    margin: 20,
    borderBottomWidth: 1,
    borderRadius: 16,
    borderBottomColor: '#E2E8F0',
  },
  listaContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barbeiroItem: {
    alignItems: 'center',
    width: 68,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarCircleSelecionado: {
    borderColor: '#155DFC',
    backgroundColor: '#155DFC',
  },
  avatarTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
  avatarTextoSelecionado: {
    color: '#FFFFFF',
  },
  nomeBarbeiro: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  nomeBarbeiroSelecionado: {
    color: '#155DFC',
    fontWeight: '700',
  },
});