import Feather from "@expo/vector-icons/Feather";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {

  return (
    <LinearGradient
      colors={[ '#155DFC', '#3B82F6' ]} 
      style={styles.container}
    >
      <View style={styles.view}>
      <Feather name="scissors" size={60} color="#155DFC" />
      </View>
      <Text style={styles.title}>BarberPro</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  view: {
    backgroundColor: '#FFFFFF',
    width: 120,
    height: 120,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6, 
    },
    shadowOpacity: 0.18, 
    shadowRadius: 12,     
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: 'Inter_700Bold',
    color: "#FFFFFF",
    fontSize: 50,
    marginTop: 28,
  },
});
