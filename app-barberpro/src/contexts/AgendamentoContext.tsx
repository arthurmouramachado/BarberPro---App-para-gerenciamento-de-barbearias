import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipagem do contexto atualizada com Plano
interface AgendamentoContextData {
  barbeariaId: number | null;
  servicoId: number | null;
  planoId: number | null; 
  barbeiroId: number | null;
  dataSelecionada: string | null; // Formato YYYY-MM-DD
  horarioSelecionado: string | null; // Formato HH:MM
  selecionarBarbearia: (id: number) => void;
  selecionarServico: (id: number) => void;
  selecionarPlano: (id: number) => void; 
  selecionarBarbeiro: (id: number) => void;
  selecionarData: (data: string) => void;
  selecionarHorario: (horario: string) => void;
  limparFluxo: () => void;
}

const AgendamentoContext = createContext<AgendamentoContextData>({} as AgendamentoContextData);

export const AgendamentoProvider = ({ children }: { children: ReactNode }) => {
  const [barbeariaId, setBarbeariaId] = useState<number | null>(null);
  const [servicoId, setServicoId] = useState<number | null>(null);
  const [planoId, setPlanoId] = useState<number | null>(null); // 👈 Adicionado
  const [barbeiroId, setBarbeiroId] = useState<number | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Regra de Negócio: Mudou a barbearia, reseta todo o fluxo seguinte!
  const selecionarBarbearia = (id: number) => {
    setBarbeariaId(id);
    setServicoId(null);
    setPlanoId(null);
    setBarbeiroId(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  // Se selecionar serviço avulso, reseta o plano e os passos de agendamento
  const selecionarServico = (id: number) => {
    setServicoId(id);
    setPlanoId(null); // Reseta o plano para não conflitar
    setBarbeiroId(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  // Se selecionar um pacote, reseta o serviço avulso e os passos de agendamento
  const selecionarPlano = (id: number) => {
    setPlanoId(id);
    setServicoId(null); // Reseta o serviço avulso para não conflitar
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
    setPlanoId(null);
    setBarbeiroId(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  };

  return (
    <AgendamentoContext.Provider
      value={{
        barbeariaId,
        servicoId,
        planoId,
        barbeiroId,
        dataSelecionada,
        horarioSelecionado,
        selecionarBarbearia,
        selecionarServico,
        selecionarPlano,
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

export const useAgendamento = () => useContext(AgendamentoContext);