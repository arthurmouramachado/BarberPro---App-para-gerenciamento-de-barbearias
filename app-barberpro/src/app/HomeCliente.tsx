import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/colors';
import { Input } from '@/_components/Input';

export default function HomeCliente() {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={{ padding: 70, borderRadius: 20, marginBottom: 20 }}>
      <View>
        <Text>Olá, Cliente!</Text> {/* Aqui irei colocar uma varivael de quando o cliente acessar já vir com o nome dele */}
        <SimpleLineIcons name="location-pin" size={24} color="#FFFFFF" />
      </View>
      <Input placeholder='Digite sua localização' style={styles.input} />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  }
})