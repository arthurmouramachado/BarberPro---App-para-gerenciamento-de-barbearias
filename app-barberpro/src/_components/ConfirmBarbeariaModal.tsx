import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { BarbeariaCardDTO } from "../services/barbeariaService";

interface ConfirmBarbeariaModalProps {
  visible: boolean;
  barbearia: BarbeariaCardDTO | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmBarbeariaModal({
  visible,
  barbearia,
  onClose,
  onConfirm,
}: ConfirmBarbeariaModalProps) {
  if (!barbearia) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirmar Barbearia</Text>
          <Text style={styles.subtitle}>
            Confirme se esta é a barbearia onde você trabalha:
          </Text>

          {barbearia.foto_url ? (
            <Image source={{ uri: barbearia.foto_url }} style={styles.image} />
          ) : null}

          <Text style={styles.barberName}>{barbearia.nome}</Text>
          <Text style={styles.barberDetail}>{barbearia.endereco}</Text>
          <Text style={styles.barberDetail}>{barbearia.diaEHorario}</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    marginBottom: 12,
  },
  barberName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#155DFC",
    marginBottom: 4,
    textAlign: "center",
  },
  barberDetail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 2,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  cancelText: {
    color: "#64748B",
    fontFamily: "Inter_700Bold",
  },
  confirmButton: {
    backgroundColor: "#155DFC",
  },
  confirmText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
});