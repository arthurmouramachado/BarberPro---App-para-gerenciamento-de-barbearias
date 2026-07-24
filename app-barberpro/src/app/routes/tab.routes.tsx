// 1. Importações do React e do Navigation
import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStaticNavigation } from "@react-navigation/native";

import AgendamentosCliente from "../Clientes/AgendamentosCliente";
import HomeCliente from "../Clientes/HomeCliente";
import PerfilCliente from "../Clientes/PerfilCliente";

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

export const NavegacaoPrincipal = createStaticNavigation(MinhasAbas);
