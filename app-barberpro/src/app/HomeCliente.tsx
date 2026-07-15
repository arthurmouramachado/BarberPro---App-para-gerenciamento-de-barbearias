import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/colors';
import { Input } from '@/_components/Input';
import { StaggeredText } from '@/_components/ui/AnimatedText';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

export default function HomeCliente() {

  // 2. Carrega a fonte dentro do componente
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  // 3. Se a fonte não carregou, exibe uma tela vazia (ou um indicador de carregamento)
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={{ padding: 45, borderRadius: 20, marginBottom: 20 }}>
      
        <View style={styles.headercontainer}>
  
          {/* 1. Bloco da Esquerda (Textos) */}
          <View>
            <StaggeredText text="Olá," style={styles.text1} />
            <StaggeredText text="Cliente!" style={styles.text2} />
          </View>

          {/* 2. Bloco da Direita (Botão de Localização) */}
          <TouchableOpacity style={styles.locationButton} onPress={() => { /* Aqui você pode adicionar a lógica para pegar a localização */ }}>
            <SimpleLineIcons name="location-pin" size={24} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

      <Input placeholder='Digite o nome da Barbearia' style={styles.input} />
      <Input placeholder='Digite sua localização' style={styles.input} />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headercontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Joga o texto para a esquerda e o botão para a direita
    alignItems: 'center',            // Alinha os dois verticalmente ao centro
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 45,
    paddingHorizontal: 15,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  text1: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  text2: {
    color: '#FFFFFF',
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  locationButton: {
    width: 50,                       // Largura física do botão
    height: 50,                      // Altura física do botão
    borderRadius: 25,                // Metade de 50 = Círculo Perfeito!
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Branco com 20% de opacidade (efeito vidro)
    justifyContent: 'center',        // Centraliza o ícone dentro da bolinha (vertical)
    alignItems: 'center',            // Centraliza o ícone dentro da bolinha (horizontal)
  },
})