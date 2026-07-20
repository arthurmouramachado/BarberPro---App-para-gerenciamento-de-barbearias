import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';

export interface AgendamentoData {
  id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
  servicos: {
    nome: string;
    preco: number | string;
  };
  barbeiros: {
    usuarios: {
      nome: string;
    };
    barbearias: {
      nome: string;
    };
  };
}

interface AgendamentoCardProps {
  agendamento: AgendamentoData;
  onCancelar?: (id: number) => void;
}

export function AgendamentoCard({ agendamento, onCancelar }: AgendamentoCardProps) {
  if (!agendamento) return null;

  // Extração de dados com segurança
  const barbeariaNome = agendamento.barbeiros?.barbearias?.nome || 'Barbearia';
  const barbeiroNome = agendamento.barbeiros?.usuarios?.nome || 'Barbeiro';
  const servicoNome = agendamento.servicos?.nome || 'Serviço';
  const preco = Number(agendamento.servicos?.preco || 0).toFixed(2).replace('.', ',');

  // Formatação de Data (Ex: "27 de fev.")
  const dateObj = new Date(agendamento.data);
  const dataFormatada = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  // Formatação de Horário (Ex: "14:00")
  const horaObj = new Date(agendamento.hora_inicio);
  const horaFormatada = horaObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Mapeamento visual de status
  const isAgendado = agendamento.status === 'AGENDADO';
  const isCancelado = agendamento.status === 'CANCELADO';

  const statusTextMap = {
    AGENDADO: 'Agendado',
    CONCLUIDO: 'Concluído',
    CANCELADO: 'Cancelado',
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.barbeariaName}>{barbeariaNome}</Text>

        {/* O Balãozinho de Status dinâmico */}
        <View
          style={[
            styles.statusBadge,
            isCancelado && { backgroundColor: '#FFE2E2' },
            agendamento.status === 'CONCLUIDO' && { backgroundColor: '#E0F2FE' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCancelado && { color: '#EF4444' },
              agendamento.status === 'CONCLUIDO' && { color: '#0284C7' },
            ]}
          >
            {statusTextMap[agendamento.status] || agendamento.status}
          </Text>
        </View>
      </View>

      <View style={styles.row1}>
        <View style={styles.icon}>
          <Feather name="user" size={24} color="#3B82F6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text1}>Profissional</Text>
          <Text style={styles.text2}>{barbeiroNome}</Text>
        </View>
      </View>

      <View style={styles.row1}>
        <View style={styles.icon}>
          <Feather name="scissors" size={24} color="#3B82F6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text1}>Serviço</Text>
          <Text style={styles.text2}>{servicoNome}</Text>
        </View>
      </View>

      <View style={styles.dateTimeRow}>
        {/* Bloco da Data */}
        <View style={styles.row1}>
          <View style={styles.icon}>
            <Feather name="calendar" size={24} color="#3B82F6" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.text1}>Data</Text>
            <Text style={styles.text2}>{dataFormatada}</Text>
          </View>
        </View>

        {/* Bloco do Horário */}
        <View style={styles.row1}>
          <View style={styles.icon}>
            <Feather name="clock" size={24} color="#3B82F6" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.text1}>Horário</Text>
            <Text style={styles.text2}>{horaFormatada}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider}></View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Total pago</Text>
        <Text style={styles.priceValue}>R$ {preco}</Text>
      </View>

      <View style={styles.actionsRow}>
        {/* Botão Cancelar aparece apenas se estiver AGENDADO */}
        {isAgendado && onCancelar && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancelar(agendamento.id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <Button label="Ver Detalhes" isActive={true} style={styles.button} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  barbeariaName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusText: {
    color: '#155DFC',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  text1: {
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  text2: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  priceLabel: {
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    fontSize: 16,
  },
  priceValue: {
    fontFamily: 'Inter_700Bold',
    color: '#2563EB',
    fontSize: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF1F2',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  button: {
    height: 50,
    width: '100%',
  },
});