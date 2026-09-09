import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService'; 
import { jwtDecode } from 'jwt-decode';

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

  useEffect(() => {
    async function loadStorageData() {
      const storagedUser = await AsyncStorage.getItem('@BarberPro:user');
      const storagedToken = await AsyncStorage.getItem('@BarberPro:token');

      if (storagedUser && storagedToken) {
        setUser(JSON.parse(storagedUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);


  async function signIn(email: string, pass: string) {

    const data = await authService.login(email, pass);
    const token = data.access_token;

    const decodedPayload: any = jwtDecode(token);
 
    const loggedUser: User = {
      id: decodedPayload.sub || decodedPayload.id,
      nome: decodedPayload.nome || decodedPayload.name || "",
      email: email,
      funcao: decodedPayload.funcao || decodedPayload.role,

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

    setUser(loggedUser);

    await AsyncStorage.setItem('@BarberPro:token', token);
    await AsyncStorage.setItem('@BarberPro:user', JSON.stringify(loggedUser));

    return loggedUser;
  }


  async function signOut() {
    await AsyncStorage.removeItem('@BarberPro:token');
    await AsyncStorage.removeItem('@BarberPro:user');
    setUser(null);
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