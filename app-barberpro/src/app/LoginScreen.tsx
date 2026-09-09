import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../_components/Button";
import { Input } from "../_components/Input";

export default function LoginScreen() {
  const router = useRouter();

  const { user, signIn } = useAuth();
  const { emailCadastrado } = useLocalSearchParams<{
    emailCadastrado?: string;
  }>();

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
    if (!isFormValid) return;

    try {
      setIsLoading(true);

      const emailDigitado = email.trim();
      const senhaTratada = senha.trim();

      // Tenta o login com o email digitado; se der 404 (usuário não encontrado),
      // tenta com lowercase ou capitalizado (compatibilidade com cadastros anteriores)
      let loginFeito;
      try {
        loginFeito = await signIn(emailDigitado, senhaTratada);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const emailLower = emailDigitado.toLowerCase();
          if (emailLower !== emailDigitado) {
            loginFeito = await signIn(emailLower, senhaTratada);
          } else {
            const emailCapitalizado =
              emailDigitado.charAt(0).toUpperCase() + emailDigitado.slice(1);
            if (emailCapitalizado !== emailDigitado) {
              loginFeito = await signIn(emailCapitalizado, senhaTratada);
            } else {
              throw err;
            }
          }
        } else {
          throw err;
        }
      }

      const perfil = loginFeito?.funcao;

      if (perfil === "CLIENTE") {
        router.replace("/Clientes/HomeClienteScreen" as any);
      } else if (perfil === "BARBEIRO" || perfil === "ADMIN") {
        router.replace("/Barbeiro/HomeBarbeiroScreen" as any);
      }
    } catch (error: any) {
      console.error(
        "Erro no login:",
        error?.response?.status,
        error?.response?.data || error?.message,
      );
      let mensagem = "Email ou Senha Incorretos. Tente novamente.";
      const backendMsg = error?.response?.data?.message;
      if (
        backendMsg === "User not found" ||
        backendMsg === "Invalid credentials"
      ) {
        mensagem = "Email ou senha incorretos. Verifique seus dados.";
      } else if (typeof backendMsg === "string") {
        mensagem = backendMsg;
      }
      Alert.alert("Erro no Login", mensagem);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Redefinir Senha", "Email para redefinir senha enviado!");
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
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={24} color="#64748B" style={styles.icon} />
        <Input
          placeholder="Senha"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <TouchableOpacity
        style={styles.esqueciSenhaContainer}
        onPress={handleForgotPassword}
      >
        <Text style={styles.esquecisenhaText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      {/* O botão recebe dinamicamente o resultado da validação */}
      <Button
        label="Entrar"
        style={styles.button}
        isActive={isFormValid && !isLoading}
        onPress={handleLogin}
      />

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Não tem conta? </Text>
        <Link href="/SingupScreen" asChild>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.signUpLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}

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
