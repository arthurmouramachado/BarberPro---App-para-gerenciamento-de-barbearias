import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { barbeiroService, BarbeiroDTO } from '@/services/barbeiroService';

interface ExcluirBarbeiroAdminProps {
  barbeariaId: number; // Recebe o ID da barbearia atual
}

export default function ExcluirBarbeiroAdmin({ barbeariaId }: ExcluirBarbeiroAdminProps) {
  const [barbeiros, setBarbeiros] = useState<BarbeiroDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const carregarBarbeiros = async () => {
    try {
      setLoading(true);
      // Filtra apenas os barbeiros vinculados a esta barbearia
      const data = await barbeiroService.listarPorBarbearia(barbeariaId);
      setBarbeiros(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a lista de barbeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barbeariaId) {
      carregarBarbeiros();
    }
  }, [barbeariaId]);

  const confirmarExclusao = (id: number, nome: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o barbeiro ${nome}? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletarBarbeiro(id),
        },
      ]
    );
  };

  const deletarBarbeiro = async (id: number | string) => {
    try {
      // barbeiroService.deletar espera uma string; garantir conversão
      await barbeiroService.deletar(id.toString());
      Alert.alert('Sucesso', 'Barbeiro removido com sucesso!');
      setBarbeiros((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao excluir o barbeiro.');
    }
  };

  const renderBarbeiroItem = ({ item }: { item: BarbeiroDTO }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.nomeText}>{item.usuarios?.nome || 'Barbeiro'}</Text>
        <Text style={styles.subText}>
          {item.especialidade || item.usuarios?.email}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmarExclusao(item.id, item.usuarios?.nome || '')}
      >
        <Ionicons name="trash-outline" size={22} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E293B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciar Barbeiros</Text>
      <Text style={styles.subtitulo}>
        Selecione um barbeiro para remover da equipe
      </Text>

      <FlatList
        data={barbeiros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBarbeiroItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum barbeiro encontrado para esta barbearia.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  nomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 15,
  },
});