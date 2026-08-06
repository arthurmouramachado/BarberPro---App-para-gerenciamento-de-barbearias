import { colors } from "@/colors";
import { barbeariaService } from "@/services/barbeariaService";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Octicons from "@expo/vector-icons/Octicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../_components/Button";
import { Input } from "../_components/Input";

export default function CreateBarbershop() {
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados dos inputs do formulário
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const handleBuscarCep = (texto: string) => {
    const cepLimpo = texto.replace(/\D/g, "");
    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.erro) {
            setEndereco(`${data.logradouro}, ${data.bairro}`);
            setCidade(data.localidade);
            setEstado(data.uf);
          } else {
            Alert.alert("Erro", "CEP não encontrado!");
          }
        })
        .catch((error) => {
          console.error("Erro ao buscar CEP:", error);
          Alert.alert("Erro", "Erro ao buscar CEP. Tente novamente.");
        });
    } else {
      // Limpa os campos quando o CEP for alterado/apagado
      setEndereco("");
      setCidade("");
      setEstado("");
    }
  };

  const isFormValid =
    nomeBarbearia.trim() !== "" &&
    telefone.trim() !== "" &&
    cep.trim().length === 8 &&
    endereco.trim() !== "" &&
    numero.trim() !== "" &&
    cidade.trim() !== "" &&
    estado.trim() !== "";

  const handleCadastro = async () => {
    if (!isFormValid || loading) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("nome", nomeBarbearia);
      formData.append("telefone", telefone);

      const enderecoCompleto = `${endereco}, nº ${numero} - ${cidade}/${estado} (CEP: ${cep})`;
      formData.append("endereco", enderecoCompleto);

      if (image) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("foto", {
          uri: image,
          name: `barbearia_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await barbeariaService.cadastrar(formData as any);

      Alert.alert("Sucesso", "Barbearia cadastrada com sucesso!", [
        { text: "OK", onPress: () => router.replace("./HomeBarbeiro") },
      ]);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      const mensagemErro =
        error.response?.data?.message ||
        "Não foi possível conectar ao servidor.";
      Alert.alert("Erro", mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissonResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissonResult.granted === false) {
      Alert.alert("Permissão necessária", "Permissão para acessar a galeria é necessária!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.view}>
            <FontAwesome6 name="building" size={40} color="#FFFFFF" />
          </LinearGradient>

          <Text style={styles.title}>Dados da Barbearia</Text>
          <Text style={styles.subtitle}>
            Preencha as informações do seu negócio
          </Text>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, borderRadius: 20 }}
              />
            ) : (
              <>
                <Octicons name="upload" size={24} color="#64748B" />
                <Text style={styles.uploadText}>Foto da Barbearia</Text>
                <Text style={styles.subupload}>
                  Clique para fazer upload da imagem
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Nome da Barbearia */}
          <View style={styles.inputContainer}>
            <FontAwesome6
              name="building"
              size={24}
              color="#64748B"
              style={styles.icon}
            />
            <Input
              placeholder="Nome da barbearia"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={nomeBarbearia}
              onChangeText={setNomeBarbearia}
            />
          </View>

          {/* Telefone */}
          <View style={styles.inputContainer}>
            <Feather
              name="phone"
              size={24}
              color="#64748B"
              style={styles.icon}
            />
            <Input
              placeholder="Telefone / Celular"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
            />
          </View>

          {/* CEP */}
          <View style={styles.inputContainer}>
            <SimpleLineIcons
              name="envelope"
              size={24}
              color="#64748B"
              style={styles.icon}
            />
            <Input
              placeholder="Digite seu CEP"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={8}
              style={styles.input}
              value={cep}
              onChangeText={handleBuscarCep}
            />
          </View>

          {/* Endereço */}
          <View style={styles.inputContainer}>
            <SimpleLineIcons
              name="location-pin"
              size={24}
              color="#64748B"
              style={styles.icon}
            />
            <Input
              placeholder="Endereço completo (Rua e Bairro)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
            />
          </View>

          {/* Número / Complemento */}
          <View style={styles.inputContainer}>
            <FontAwesome5
              name="home"
              size={20}
              color="#64748B"
              style={styles.icon}
            />
            <Input
              placeholder="Número / Complemento"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={numero}
              onChangeText={setNumero}
            />
          </View>

          {/* Cidade e Estado */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <SimpleLineIcons
                name="location-pin"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <Input
                placeholder="Cidade"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={cidade}
                onChangeText={setCidade}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <SimpleLineIcons
                name="location-pin"
                size={20}
                color="#64748B"
                style={styles.icon}
              />
              <Input
                placeholder="Estado"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                maxLength={2}
                style={styles.input}
                value={estado}
                onChangeText={setEstado}
              />
            </View>
          </View>

          <Button
            label={loading ? "Cadastrando..." : "Criar Barbearia"}
            style={styles.button}
            isActive={isFormValid && !loading}
            onPress={handleCadastro}
            icon={
              loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <FontAwesome5
                  name="check-circle"
                  size={24}
                  color={isFormValid ? "#FFFFFF" : "#94A3B8"}
                />
              )
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, width: "100%" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  view: {
    width: 90,
    height: 90,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#000",
    fontSize: 30,
    marginTop: 28,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    height: 60,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 0.4,
    borderColor: "#9CA3AF",
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#000",
    borderRadius: 20,
  },
  button: { marginTop: 40 },
  uploadButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 20,
    borderStyle: "dashed",
    paddingVertical: 10,
    paddingHorizontal: 50,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
  },
  uploadText: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 16,
    marginTop: 10,
  },
  subupload: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 14,
    marginTop: 5,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 300,
  },
  halfInput: {
    width: 144,
  },
});