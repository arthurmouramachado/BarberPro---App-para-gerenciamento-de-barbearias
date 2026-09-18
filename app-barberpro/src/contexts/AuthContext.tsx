import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService'; 
import { jwtDecode } from 'jwt-decode';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Estrutura do Usuário Logado
interface User {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  clienteId?: number; 
  barbeiroId?: number;
  barbeariaId?: number;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<User>;
  signOut: () => Promise<void>;
}

interface TokenPayload {
  sub: number,
  nome: string,
  funcao: string,
  exp: number,
  clienteId?: number;
  barbeiroId?: number;
  barbeariaId?: number;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const versaoSessao = useRef(0);
  const filaStorage = useRef<Promise<void>>(Promise.resolve());

  // A limpeza da conta anterior termina antes de salvar uma nova sessão.
  function executarStorage(acao: () => Promise<void>): Promise<void> {
    const operacao = filaStorage.current.then(acao);
    filaStorage.current = operacao.catch(() => {});
    return operacao;
  }

  useEffect(() => {
    let ativo = true;
    const versaoInicial = versaoSessao.current;
    async function loadStorageData() {
      try {
        const [storagedUser, storagedToken] = await Promise.all([
          AsyncStorage.getItem('@BarberPro:user'),
          AsyncStorage.getItem('@BarberPro:token'),
        ]);
        if (!ativo || versaoInicial !== versaoSessao.current) return;
        if (storagedUser && storagedToken) {
          const payload = jwtDecode<TokenPayload>(storagedToken);
          if (!payload.exp || payload.exp * 1000 <= Date.now()) {
            throw new Error('Sessão expirada');
          }
          const salvo = JSON.parse(storagedUser) as User;
          setUser({ ...salvo, funcao: String(salvo.funcao).trim().toUpperCase() });
        }
      } catch (error) {
        if (!ativo || versaoInicial !== versaoSessao.current) return;
        setUser(null);
        console.warn('Não foi possível restaurar a sessão:', error);
      } finally {
        if (ativo && versaoInicial === versaoSessao.current) setLoading(false);
      }
    }

    loadStorageData();
    return () => { ativo = false; };
  }, []);


  async function signIn(email: string, pass: string) {
    const numeroSessao = ++versaoSessao.current;
    const data = await authService.login(email, pass);
    const token = data.access_token;

    const decodedPayload: any = jwtDecode(token);
 
    const loggedUser: User = {
      id: decodedPayload.sub || decodedPayload.id,
      nome: decodedPayload.nome || decodedPayload.name || "",
      email: email,
      funcao: String(decodedPayload.funcao || decodedPayload.role || '').trim().toUpperCase(),

      clienteId:
        decodedPayload.clienteId ??
        decodedPayload.cliente_id ??
        decodedPayload.cliente?.id,

      barbeiroId:
        decodedPayload.barbeiroId ??
        decodedPayload.barbeiro_id ??
        decodedPayload.barbeiro?.id,

      barbeariaId:
        decodedPayload.barbeariaId ??
        decodedPayload.barbearia_id ??
        decodedPayload.barbearia?.id,
    };

    if (numeroSessao !== versaoSessao.current) throw new Error('Login interrompido.');
    await executarStorage(async () => {
      if (numeroSessao !== versaoSessao.current) throw new Error('Login interrompido.');
      await AsyncStorage.multiSet([
        ['@BarberPro:token', token],
        ['@BarberPro:user', JSON.stringify(loggedUser)],
      ]);
    });
    if (numeroSessao !== versaoSessao.current) throw new Error('Login interrompido.');
    setUser(loggedUser);
    setLoading(false);

    return loggedUser;
  }


  async function signOut() {
    // Encerra a sessão em memória e abre o login imediatamente.
    versaoSessao.current += 1;
    setUser(null);
    setLoading(false);
    const limpeza = executarStorage(() =>
      AsyncStorage.multiRemove(['@BarberPro:token', '@BarberPro:user']),
    );
    router.replace('/LoginScreen');
    try {
      await limpeza;
    } catch (error) {
      console.error('Erro ao limpar a sessão salva:', error);
      Alert.alert('Sessão encerrada', 'Não foi possível limpar os dados salvos no aparelho. Se a conta voltar ao reabrir o aplicativo, saia novamente.');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}