import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
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
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // 2. Validação: Todos os campos cheios E as duas senhas iguais
  const isFormValid = 
    email.trim() !== "" && 
    telefone.trim() !== "" && 
    senha.trim() !== "" && 
    confirmarSenha.trim() !== "" &&
    senha === confirmarSenha;

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
            <Feather name="user" size={60} color="#FFFFFF" />
          </LinearGradient>

          <Text style={styles.title}>Cadastro de Usuário</Text>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

          <View style={styles.inputContainer}>
            <Fontisto name="email" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="phone" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Telefone"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Senha"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={24} color="#64748B" style={styles.icon} />
            <Input
              placeholder="Confirmar Senha"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
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

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Já tem uma conta? </Text>
            <Link href="/LoginScreen" asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.signUpLink}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
});
