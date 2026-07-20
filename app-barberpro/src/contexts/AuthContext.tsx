import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService'; 

// Estrutura do Usuário Logado
interface User {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  clienteId?: number; 
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
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

 
    const loggedUser: User = {
      id: data.user.id,
      nome: data.user.nome,
      email: data.user.email,
      funcao: data.user.funcao,
      clienteId: data.user.cliente?.id || data.clienteId, 
    };

    setUser(loggedUser);


    await AsyncStorage.setItem('@BarberPro:token', data.token);
    await AsyncStorage.setItem('@BarberPro:user', JSON.stringify(loggedUser));
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