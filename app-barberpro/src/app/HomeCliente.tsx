import { Input } from "@/_components/Input";
import BarbeariaCard, {} from '@/_components/BarbeariaCard'
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { barbeariaService, BarbeariaCardDTO } from '../services/barbeariaService';  

export default function HomeCliente() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const [localizacaoTexto, setLocalizacaoTexto] = useState<string>("");
  const [buscarBarbearia, setBuscarBarbearia] = useState<string>("");
  const [carregandoGPS, setCarregandoGPS] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  
  const [barbearia, setBarbearia] = useState<BarbeariaCardDTO[]>([])
  const [loading, setLoading] = useState(true)

  const buscarDadosBarbearia = async () => {
    try{
      const listarBarbearias = await barbeariaService.listarTodas();
      setBarbearia(listarBarbearias);
      setLoading(false);
    } catch{
        console.error("Erro de requisição")
        setLoading(false)
    } 
  }

  useEffect(() =>{
    buscarDadosBarbearia();
  }, []);

  console.log(location);
  console.log(barbearia);

  const obterLocalizacao = async () => {
    setCarregandoGPS(true);
    setErrorMsg(null); // Limpa mensagens de erro anteriores

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permissão para acessar a localização foi negada");
      setCarregandoGPS(false);
      return;
    }

    try {
      const posicaoObtida = await Location.getCurrentPositionAsync({});
      setLocation(posicaoObtida);
      setLocalizacaoTexto(
        `${posicaoObtida.coords.latitude}, ${posicaoObtida.coords.longitude}`,
      );

      const resposta = await Location.reverseGeocodeAsync({
        latitude: posicaoObtida.coords.latitude,
        longitude: posicaoObtida.coords.longitude,
      });

      if (resposta.length > 0) {
        const local = resposta[0];
        const numero = local.streetNumber ? `, ${local.streetNumber}` : "";
        const endereco = `${local.street}${numero}, ${local.district}, ${local.subregion}, ${local.region}`;
        setLocalizacaoTexto(endereco);
      }
    } catch (error) {
      setErrorMsg("Erro ao obter a localização");
    } finally {
      setCarregandoGPS(false);
    }
  };

 
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={{ padding: 45, borderRadius: 20, marginBottom: 20 }}
      >
        <View style={styles.headercontainer}>
          {/* 1. Bloco da Esquerda (Textos) */}
          <View>
            <StaggeredText text="Olá," style={styles.text1} />
            <StaggeredText text="Cliente!" style={styles.text2} />
          </View>

          {/* 2. Bloco da Direita (Botão de Localização) */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => {
              obterLocalizacao();
            }}
          >
            <SimpleLineIcons name="location-pin" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Digite o nome da Barbearia"
          style={styles.input}
          value={buscarBarbearia} // Conecta o input ao estado
          onChangeText={setBuscarBarbearia} // Atualiza o estado quando o usuário digita
        />

        <Input
          placeholder="Digite sua localização"
          style={styles.input}
          editable={!carregandoGPS} // Fica desativado se estiver carregando, e ativo quando terminar
          value={localizacaoTexto} // Mostra o endereço do GPS ou o que o usuário digitar
          onChangeText={setLocalizacaoTexto} // Permite que o usuário digite e corrija o texto!
          multiline={true} // Permite que o texto quebre linhas se o endereço for muito longo
          numberOfLines={2}
        />

        {errorMsg && (
          <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            {errorMsg}
          </Text>
        )}
      </LinearGradient>

      {loading ? <ActivityIndicator size={"large"} color={"#000"} /> : <FlatList 
      data={barbearia}
      keyExtractor={(item) => String(item.id)}
      renderItem={({item}) => <BarbeariaCard barbearia={item}/>}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />}

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
  input: {
    height: 45,
    paddingHorizontal: 15,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  text1: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  text2: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  locationButton: {
    width: 50, // Largura física do botão
    height: 50, // Altura física do botão
    borderRadius: 25, // Metade de 50 = Círculo Perfeito!
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Branco com 20% de opacidade (efeito vidro)
    justifyContent: "center", // Centraliza o ícone dentro da bolinha (vertical)
    alignItems: "center", // Centraliza o ícone dentro da bolinha (horizontal)
  },
});
