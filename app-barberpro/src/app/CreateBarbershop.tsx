import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react"; // IMPORTADO O USESTATE
import {
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
import { colors } from "@/colors";

export default function SingupScreen() {
  const router = useRouter();

  // 1. Estados para monitorar os 4 inputs
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // 2. Validação: Todos os campos cheios E as duas senhas iguais
  const isFormValid = 
    nomeBarbearia.trim() !== "" && 
    endereco.trim() !== "" && 
    cidade.trim() !== "" && 
    estado.trim() !== "";

  const handleCadastro = () => {
    if (isFormValid) {
      router.push("/SelectScreen"); 
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.background]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={["#155DFC", "#3B82F6"]} style={styles.view}>
             <FontAwesome6 name="building" size={40} color="#FFFFFF" />
          </LinearGradient>

          <Text style={styles.title}>Dados da Barbeaia</Text>
          <Text style={styles.subtitle}>Preencha as informações do seu negócio</Text>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Octicons name="upload" size={24} color="#64748B" />
            <Text style={styles.uploadText}>Foto da Barbearia</Text>
            <Text style={styles.subupload}>Clique para fazer upload da imgaem</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <FontAwesome6 name="building" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Nome da Barbearia"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              style={styles.input}
              value={nomeBarbearia}
              onChangeText={setNomeBarbearia}
            />
          </View>

          <View style={styles.inputContainer}>
            <SimpleLineIcons name="location-pin" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Endereço completo"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
            />
          </View>

          <View style={styles.inputContainer}>
            <SimpleLineIcons name="location-pin" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Cidade"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={cidade}
              onChangeText={setCidade}
            />
          </View>

          <View style={styles.inputContainer}>
            <SimpleLineIcons name="location-pin" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Estado"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={estado}
              onChangeText={setEstado}
            />
          </View>

          {/* Botão dinâmico controlado pelo estado do form */}
          <Button
            label="Criar Conta"
            style={styles.button}
            isActive={isFormValid}
            onPress={handleCadastro}
            icon={<FontAwesome5 name="check-circle" size={24} color={isFormValid ? "#FFFFFF" : "#94A3B8"} />}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  view: {
    width: 100,
    height: 100,
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
    fontSize: 40,
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
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#000",
    borderRadius: 20,
  },
  button: {
    marginTop: 40,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  signUpText: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 16,
  },
  signUpLink: {
    fontFamily: "Inter_700Bold",
    color: "#155DFC",
    fontSize: 16,
  },
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
    justifyContent: "center",
    alignItems: "center",
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
});
