import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";

import { BarbeariaCardDTO } from "../services/barbeariaService";

import {
    formatarEnderecoBarbearia,
    obterUrlFotoBarbearia,
} from "@/utils/barbeariaFormatada";

interface BarbeariaCardProps extends TouchableOpacityProps {
  barbearia: BarbeariaCardDTO;
}

export function BarbeariaCard({
  barbearia,
  style,
  ...rest
}: BarbeariaCardProps) {
  const fotoUri = obterUrlFotoBarbearia(barbearia.foto_url);

  const enderecoFormatado = formatarEnderecoBarbearia(barbearia.endereco);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.8}
      {...rest}
    >
      {/* FOTO DA BARBEARIA */}

      {fotoUri ? (
        <Image
          source={{ uri: fotoUri }}
          style={styles.image}
          resizeMode="cover"
          onError={(event) => {
            console.error(
              "Erro ao carregar foto da barbearia:",
              fotoUri,
              event.nativeEvent.error,
            );
          }}
        />
      ) : (
        <View
          style={[
            styles.image,
            {
              backgroundColor: "#F1F5F9",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Feather name="image" size={36} color="#94A3B8" />

          <Text style={{ color: "#64748B", marginTop: 8 }}>
            Imagem indisponível
          </Text>
        </View>
      )}

      {/* INFORMAÇÕES */}

      <View style={styles.content}>
        <Text style={styles.title}>{barbearia.nome}</Text>

        <Text style={styles.subtitle}>{enderecoFormatado}</Text>

        <Text style={styles.subtitle}>{barbearia.diaEHorario}</Text>
      </View>

      <View style={styles.divider} />

      {/* RODAPÉ */}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{barbearia.mediaAvaliacoes}</Text>

        {barbearia.distanciaKM ? (
          <Text style={styles.footerText}>{barbearia.distanciaKM} km</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
  },
});
