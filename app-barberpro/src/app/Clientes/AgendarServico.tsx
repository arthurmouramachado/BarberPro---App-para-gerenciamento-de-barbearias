import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAgendamento } from '@/contexts/AgendamentoContext';
import { barbeiroService } from '@/services/barbeiroService';

export default function AgendarServico() {
  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [loadingBarbeiros, setLoadingBarbeiros] = useState(false);

  // Desestruturando o planoId e servicoId do contexto
  const { barbeiroId, barbeariaId, selecionarBarbeiro, servicoId, planoId } =
    useAgendamento();

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
      <View
        style={[
          styles.bannerInfoType,
          planoId ? styles.bannerPlano : styles.bannerServico,
        ]}
      >
        <Text
          style={[
            styles.bannerInfoTitle,
            planoId ? styles.textoPlano : styles.textoServico,
          ]}
        >
          {planoId ? 'Agendamento via Plano / Pacote' : 'Agendamento Avulso'}
        </Text>
        <Text style={styles.bannerInfoSub}>
          {planoId
            ? 'Você está agendando um plano com pagamento online via app.'
            : 'Serviço avulso com pagamento presencial na barbearia.'}
        </Text>
      </View>

      {/* 2. Bloco dos Barbeiros e Calendário */}
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

                {/* Nome simplificado */}
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

      </View>
      
      <View style={styles.calendarContainer}>
        <Calendar onDayPress={day => {
          console.log('select day', day);
        }}
        style={styles.calendar}
        headerStyle={{borderBottomWidth: 0.5, borderBottomColor:"#E8e8e8", paddingBottom: 10 }}
        theme={{
          textMonthFontSize: 15,
          textDayFontSize: 10,
          textMonthFontFamily:"Inter_400Regular",
          textDayFontFamily: "Inter_400Regular",
        }}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 16,
    marginTop: 30,
  },
  /* Estilos do Card Informativo de Plano/Serviço */
  bannerInfoType: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerPlano: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  bannerServico: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  bannerInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  textoPlano: {
    color: '#065F46',
  },
  textoServico: {
    color: '#1E40AF',
  },
  bannerInfoSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  headerBarbeiros: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderRadius: 16,
    borderBottomColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16, 
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendar:{

  }
});