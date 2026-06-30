import { Text, TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

type ButtonProps = TouchableOpacityProps & {
    label: string;
    icon?: React.ReactNode; 
    isActive?: boolean; 
}

export function Button({ label, style, icon, isActive = false, ...rest }: ButtonProps) {
  
  // O SEGREDO ESTÁ AQUI: Forçamos o TypeScript a entender que são exatamente 2 cores obrigatórias
  const gradientColors = isActive 
    ? ["#155DFC", "#3B82F6"] as const
    : ["#E2E8F0", "#E2E8F0"] as const;

  // Alterna as cores do texto/ícone
  const textColor = isActive ? '#FFFFFF' : '#94A3B8';

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={[
        styles.baseButton, 
        !isActive && { shadowOpacity: 0, elevation: 0 }, 
        style
      ]} 
      disabled={!isActive} 
      {...rest}
    >
      <LinearGradient
        colors={gradientColors} 
        style={styles.gradient}
      >
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        {icon}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  baseButton: {
    width: 300,               
    height: 56,                  
    borderRadius: 16,            
    shadowColor: "#155DFC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,            
    flexDirection: 'row',     
    justifyContent: 'center',  
    alignItems: 'center',      
    gap: 10,                   
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  }
})