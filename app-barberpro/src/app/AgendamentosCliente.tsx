import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    StyleSheet,
    View,
    FlatList
} from "react-native";
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { AgendamentoCard } from "@/_components/AgendamentoCard";

export default function AgendamntosCliente() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const AGENDAMENTOS_MOCK = [
    { id: '1', barbearia: 'Barbearia Moderna' },
    { id: '2', barbearia: 'Barba & Navalha' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={{ padding: 45, borderRadius: 20, marginBottom: 20 }}
      >
        <View style={styles.headercontainer}>
          {/* 1. Bloco da Esquerda (Textos) */}
          <View>
            <StaggeredText text="Meus Agendamentos" style={styles.text1} />
          </View>
        </View>

        <SegmentedControl
          values={['Próximos', 'Histórico']}
          selectedIndex={selectedIndex}
          onChange={event => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor="#FFFFFF"
          fontStyle={{ color: '#FFFFFF', fontFamily: 'Inter_400Regular' }}
          activeFontStyle={{ color: '#155DFC', fontFamily: 'Inter_700Bold' }}
          style={styles.switch}
        />

      </LinearGradient>
      
      <FlatList 
        data={AGENDAMENTOS_MOCK}
        keyExtractor={(item) => String(item.id)}
        renderItem={() => <AgendamentoCard />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headercontainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Joga o texto para a esquerda e o botão para a direita
    alignItems: "center", // Alinha os dois verticalmente ao centro
    width: "100%",
    marginBottom: 20,
  },
  text1: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  switch:{
    backgroundColor: "rgba(252, 251, 251, 0.2)", // O efeito de vidro azulado
    height: 40, // Uma altura um pouco maior para dar mais conforto ao clique
    marginTop: 10, // Desgruda um pouquinho do título de cima
  },
});
