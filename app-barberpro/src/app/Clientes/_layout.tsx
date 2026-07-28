import React from 'react'
import { NavegacaoPrincipal } from '../routes/tab.routes';
import { NavigationIndependentTree } from '@react-navigation/native';
import { AuthProvider } from '@/contexts/AuthContext';
import { AgendamentoProvider } from '@/contexts/AgendamentoContext';


export default function _layout() {
  return (
        <NavigationIndependentTree>
          <AuthProvider>
            <AgendamentoProvider>
              <NavegacaoPrincipal />
            </AgendamentoProvider>
          </AuthProvider>
        </NavigationIndependentTree>
  )
}