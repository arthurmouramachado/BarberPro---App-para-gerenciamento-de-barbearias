// 1. Importações do React e do Navigation
import Feather from "@expo/vector-icons/Feather";
import {
    createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
    createStaticNavigation,
} from "@react-navigation/native";
import AgendamentosCliente from "../app/Clientes/AgendamentosCliente";
import DetalhesBarbearia from "../app/Clientes/DetalhesBarbearia";
import HomeCliente from "../app/Clientes/HomeCliente";
import PerfilCliente from "../app/Clientes/PerfilCliente";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AgendarServico from "../app/Clientes/AgendarServico";

const MinhasAbas = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: "#2563EB",
    tabBarInactiveTintColor: "#8E8E93",
  },

  tabBarStyle: {
    paddingBottom: 15,

    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  screens: {
    HomeCliente: {
      screen: HomeCliente,
      options: {
        tabBarLabel: "Início",
        tabBarIcon: ({ color, size }) => (
          <Feather name="home" size={size} color={color} />
        ),
      },
    },

    AgendamentosCliente: {
      screen: AgendamentosCliente,
      options: {
        tabBarLabel: "Agendamentos",
        tabBarIcon: ({ color, size }) => (
          <Feather name="calendar" size={size} color={color} />
        ),
      },
    },

    PerfilCliente: {
      screen: PerfilCliente,
      options: {
        tabBarLabel: "Perfil",
        tabBarIcon: ({ color, size }) => (
          <Feather name="user" size={size} color={color} />
        ),
      },
    },
  },
});

const NavegacaoGeral = createNativeStackNavigator({
  screenOptions: {
    headerShown: false, 
  },
  screens: {
    AbasPrincipais: {
      screen: MinhasAbas, 
    },
    DetalhesBarbearia: {
      screen: DetalhesBarbearia, 
    },
    AgendarServico: {
      screen: AgendarServico, 
    },
  },
});

export const NavegacaoPrincipal = createStaticNavigation(NavegacaoGeral);
