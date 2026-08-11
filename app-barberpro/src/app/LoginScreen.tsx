import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react"; // IMPORTADO O USESTATE
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../_components/Button";
import { Input } from "../_components/Input";
import { authService } from "@/services/authService";

export default function LoginScreen() {
  const router = useRouter();

  const { user, signIn } = useAuth();
  const { emailCadastrado } = useLocalSearchParams<{ emailCadastrado?: string }>();

  // 1. Criando os estados para monitorar o que é digitado
  const [email, setEmail] = useState(emailCadastrado || "");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Regra de validação: Só é válido se email E senha não estiverem vazios
  const isFormValid = email.trim() !== "" && senha.trim() !== "";

  useEffect(() => {
    if (emailCadastrado) {
      setEmail(emailCadastrado);
    }
  }, [emailCadastrado]);

  
  const handleLogin = async () => {
    
    if(!isFormValid) return;
    

    try {
      setIsLoading(true);
      const response = await authService.login(
        email.trim().toLowerCase(), 
        senha.trim()
      );
      const loginFeito = await signIn(email, senha);
      const perfil = loginFeito?.funcao;

      if (perfil === "CLIENTE") {
        router.replace("./Clientes/HomeCliente");
      } else if (perfil === "BARBEIRO" || perfil === "ADMIN") {
        router.replace("./Barbeiro/HomeBarbeiro");
      }
    } catch (error) {
      Alert.alert("Email ou Senha Incorretos", "Tente novamente");
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword = () => {
    alert("Email para redefinir senha enviado!");
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={styles.container}
    >
      <LinearGradient colors={["#155DFC", "#3B82F6"]} style={styles.view}>
        <Feather name="scissors" size={60} color="#FFFFFF" />
      </LinearGradient>

      <Text style={styles.title}>Bem-Vindo!</Text>
      <Text style={styles.subtitle}>Entre com sua Conta</Text>

      <View style={styles.inputContainer}>
        <Fontisto name="email" size={24} color="#64748B" style={styles.icon} />
        <Input
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          style={styles.input}
          value={email} // Vincula o valor ao estado
          onChangeText={setEmail} // Atualiza o estado ao digitar
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={24} color="#64748B" style={styles.icon} />
        <Input
          placeholder="Senha"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          secureTextEntry
          value={senha} // Vincula o valor ao estado
          onChangeText={setSenha} // Atualiza o estado ao digitar
        />
      </View>

      <TouchableOpacity
        style={styles.esqueciSenhaContainer}
        onPress={handleForgotPassword}
      >
        <Text style={styles.esquecisenhaText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      {/* O botão recebe dinamicamente o resultado da validação */}
      <Button label="Entrar" style={styles.button} isActive={isFormValid && !isLoading} onPress={handleLogin} />

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Não tem conta? </Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.signUpLink}>
            <Link href={"./SingupScreen"}>Cadastre-se</Link>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// ... Seus styles do Login permanecem iguais (lembrando de tirar o marginTop: -400 do container se o clique sumir)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  view: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: "#000",
    fontSize: 40,
    marginTop: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    fontSize: 16,
    marginTop: 12,
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
  esqueciSenhaContainer: {
    width: 300,
    alignItems: "flex-end",
    marginTop: 8, // Deixa colado embaixo do input como no Figma
    paddingRight: 8, // Ajuste fino para alinhar com a parte reta do input
  },
  esquecisenhaText: {
    fontFamily: "Inter_400Regular", // Um peso médio fica excelente para links
    color: "#155DFC", // O azul do seu projeto
    fontSize: 18, // Tamanho ideal para não carregar o visual
  },
  button: {
    marginTop: 50,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
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
