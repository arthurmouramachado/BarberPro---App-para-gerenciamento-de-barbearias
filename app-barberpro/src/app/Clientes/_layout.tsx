import React from 'react'
import { NavegacaoPrincipal } from '../routes/tab.routes';
import { NavigationIndependentTree } from '@react-navigation/native';
import { AuthProvider } from '@/contexts/AuthContext';


export default function _layout() {
  return (
        <NavigationIndependentTree>
          <AuthProvider>
            <NavegacaoPrincipal />
          </AuthProvider>
        </NavigationIndependentTree>
  )
}