import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipagem do nosso contexto
interface AgendamentoContextData {
  barbeariaId: number | null;
  servicoId: number | null;
  barbeiroId: number | null;
  dataSelecionada: string | null; // Formato YYYY-MM-DD
  horarioSelecionado: string | null; // Formato HH:MM
  selecionarBarbearia: (id: number) => void;
  selecionarServico: (id: number) => void;
  selecionarBarbeiro: (id: number) => void;
  selecionarData: (data: string) => void;
  selecionarHorario: (horario: string) => void;
  limparFluxo: () => void;
}

const AgendamentoContext = createContext<AgendamentoContextData>({} as AgendamentoContextData);

export const AgendamentoProvider = ({ children }: { children: ReactNode }) => {
  const [barbeariaId, setBarbeariaId] = useState<number | null>(null);
  const [servicoId, setServicoId] = useState<number | null>(null);
  const [barbeiroId, setBarbeiroId] = useState<number | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Regra de Negócio: Se mudar a barbearia, precisamos resetar tudo o que veio depois!
  const selecionarBarbearia = (id: number) => {
    setBarbeariaId(id);
    setServicoId(null);
    setBarbeiroId(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  // Se mudar o serviço, reseta o barbeiro e os horários para evitar conflitos
  const selecionarServico = (id: number) => {
    setServicoId(id);
    setBarbeiroId(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  const selecionarBarbeiro = (id: number) => {
    setBarbeiroId(id);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  const selecionarData = (data: string) => {
    setDataSelecionada(data);
    setHorarioSelecionado(null);
  };

  const selecionarHorario = (horario: string) => {
    setHorarioSelecionado(horario);
  };

  const limparFluxo = () => {
    setBarbeariaId(null);
    setServicoId(null);
    setBarbeiroId(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  return (
    <AgendamentoContext.Provider
      value={{
        barbeariaId,
        servicoId,
        barbeiroId,
        dataSelecionada,
        horarioSelecionado,
        selecionarBarbearia,
        selecionarServico,
        selecionarBarbeiro,
        selecionarData,
        selecionarHorario,
        limparFluxo,
      }}
    >
      {children}
    </AgendamentoContext.Provider>
  );
};

// Hook personalizado para facilitar o uso nas telas
export const useAgendamento = () => useContext(AgendamentoContext);