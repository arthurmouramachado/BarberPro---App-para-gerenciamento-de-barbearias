import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  Text,
} from "react-native";
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { AgendamentoCard, AgendamentoData } from "@/_components/AgendamentoCard";
import { useAuth } from "@/contexts/AuthContext";
import { agendamentosService } from "@/services/agendamentosService"; // Ajuste o caminho se necessário


export default function AgendamentosCliente() {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [agendamentos, setAgendamentos] = useState<AgendamentoData[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para buscar agendamentos na API
  const carregarAgendamentos = useCallback(async () => {
    if (!user?.clienteId) return;
    
    try {
      setLoading(true);
      const data = await agendamentosService.buscarPorCliente(user.clienteId);
      setAgendamentos(data);
      
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os agendamentos.");
    } finally {
      setLoading(false);
    }
  }, [user?.clienteId]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  // Função para cancelar agendamento
  const handleCancelar = (id: number) => {
    Alert.alert("Cancelar Agendamento", "Tem certeza que deseja cancelar esse horário?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            await agendamentosService.cancelar(String(id));
            Alert.alert("Sucesso", "Agendamento cancelado com sucesso!");
            carregarAgendamentos(); // Atualiza a lista automaticamente
          } catch (error) {
            Alert.alert("Erro", "Não foi possível cancelar o agendamento.");
          }
        },
      },
    ]);
  };

  // Filtro inteligente baseado no SegmentedControl
  const agendamentosFiltrados = agendamentos.filter((item) => {
    if (selectedIndex === 0) {
      return item.status === 'AGENDADO'; // Aba 'Próximos'
    }
    return item.status === 'CONCLUIDO' || item.status === 'CANCELADO'; // Aba 'Histórico'
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={{ padding: 45, borderRadius: 20, marginBottom: 20 }}
      >
        <View style={styles.headercontainer}>
          {/* 1. Bloco da Esquerda (Textos) */}
          <View>
            <StaggeredText text="Meus Agendamentos" style={styles.text1} />
          </View>
        </View>

        <SegmentedControl
          values={['Próximos', 'Histórico']}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor="#FFFFFF"
          fontStyle={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold' }}
          activeFontStyle={{ color: '#155DFC', fontFamily: 'Inter_700Bold' }}
          style={styles.switch}
        />
      </LinearGradient>

      <FlatList
        data={agendamentosFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={carregarAgendamentos}
        renderItem={({ item }) => (
          <AgendamentoCard agendamento={item} onCancelar={handleCancelar} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 32, fontFamily: 'Inter_400Regular' }}>
            Nenhum agendamento encontrado nesta seção.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headercontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  text1: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  switch: {
    backgroundColor: "rgba(252, 251, 251, 0.2)",
    height: 40,
    marginTop: 10,
  },
});
