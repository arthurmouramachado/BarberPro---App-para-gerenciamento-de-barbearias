import { colors } from "@/colors";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function UserCard() {
  const [image, setImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const { user } = useAuth()

  const pickImage = async () => {
    const permissonResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissonResult.granted === false) {
      alert("Permissão para acessar a galeria é necessária!");
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

  const gerarIniciais = (name?: string) => {
    if(!name) return " ";

    const palavra = name.trim().split(" ")

    const primeiraLetra = palavra[0][0];

    if(palavra.length === 1){
      return primeiraLetra.toUpperCase();
    }

    const ultimaPalavra = palavra[palavra.length -1];

    const ultimaLetra = ultimaPalavra[0];

    return (primeiraLetra + ultimaLetra).toUpperCase()
  }

  
  useEffect(() => {
    const carregarPerfil = async () => {
      if (!user?.id) return;
      
      const data = await userService.buscarPorId(String(user.id));
      setUserData(data);
    };
    
    carregarPerfil();
  }, [user?.id]);
  
  const nomeUsuario = userData?.nome || user?.nome || "Cliente";
  const iniciais = gerarIniciais(nomeUsuario);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.avatar} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{iniciais}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{nomeUsuario}</Text>
        {/* No futuro podemos colocar um email ou status aqui */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    color: "#000000",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
