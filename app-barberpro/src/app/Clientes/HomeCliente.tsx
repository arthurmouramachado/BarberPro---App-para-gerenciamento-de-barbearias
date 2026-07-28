import { BarbeariaCard } from "@/_components/BarbeariaCard";
import { Input } from "@/_components/Input";
import { StaggeredText } from "@/_components/ui/AnimatedText";
import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Inter_400Regular, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BarbeariaCardDTO,
  barbeariaService,
} from "../../services/barbeariaService";
import { useAgendamento } from "@/contexts/AgendamentoContext";

export default function HomeCliente() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const [localizacaoTexto, setLocalizacaoTexto] = useState<string>("");
  const [buscarBarbearia, setBuscarBarbearia] = useState<string>("");
  const [carregandoGPS, setCarregandoGPS] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const [barbearia, setBarbearia] = useState<BarbeariaCardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const primeiroNome = user?.nome ? user.nome.split(" ")[0] : "Cliente";
  const navigation = useNavigation<any>();
  const { selecionarBarbearia } = useAgendamento();


  const handleSelectBarbearia = (item: BarbeariaCardDTO) => {
    console.log("Clicou na barbearia ID:", item.id);

    try {
      
      selecionarBarbearia(item.id);

      // 3. Navegue usando o navigation.navigate do React Navigation
      navigation.navigate("DetalhesBarbearia", { id: item.id });

    } catch (error) {
      console.error("Erro ao selecionar e navegar:", error);
    }
  };
  

  const buscarDadosBarbearia = async () => {
    try {
      const listarBarbearias = await barbeariaService.listarTodas();
      setBarbearia(listarBarbearias);
      setLoading(false);
    } catch {
      console.error("Erro de requisição");
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const barbeariasFiltradas = barbearia.filter((item) => {
    const nomeBarbearia = item.nome.toLocaleLowerCase();

    const textoBuscado = buscarBarbearia.toLocaleLowerCase();

    return nomeBarbearia.includes(textoBuscado);
  })

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
            <StaggeredText text={primeiroNome} style={styles.text2} />
          </View>

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

      {loading ? (
        <ActivityIndicator size={"large"} color={"#000"} />
      ) : (
        <FlatList
          data={barbeariasFiltradas}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={buscarDadosBarbearia}
          renderItem={({ item }) => (
          <BarbeariaCard 
            barbearia={item} 
            onPress={() => handleSelectBarbearia(item)} 
          />
        )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 30,
            paddingVertical: 10,
            paddingBottom: 20,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headercontainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "center", 
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
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Branco com 20% de opacidade (efeito vidro)
    justifyContent: "center",
    alignItems: "center", 
  },
});
