// 1. Importações do React e do Navigation
import AgendaBarbeiro from "@/app/Barbeiro/AgendaBarbeiro";
import HorariosTrabalho from "@/app/Barbeiro/HorariosTrabalho";
import PerfilBarbeiro from "@/app/Barbeiro/PerfilBarbeiro";
import RelatoriosFinanceiros from "@/app/Barbeiro/RelatoriosFinanceiros";
import Servicos from "@/app/Barbeiro/Servicos";
import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeBarbeiro from "../app/Barbeiro/HomeBarbeiro";
// Crie esses arquivos futuramente se precisar, ou substitua temporariamente
// import AgendaBarbeiro from "../app/Barbeiro/AgendaBarbeiro";
// import PerfilBarbeiro from "../app/Barbeiro/PerfilBarbeiro";

const AbasBarbeiro = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: "#2563EB",
    tabBarInactiveTintColor: "#8E8E93",
  },

  tabBarStyle: {
    paddingBottom: 15,
    height: 60,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  screens: {
    HomeBarbeiro: {
      screen: HomeBarbeiro,
      options: {
        tabBarLabel: "Início",
        tabBarIcon: ({ color, size }) => (
          <Feather name="home" size={size} color={color} />
        ),
      },
    },

    // Você pode adicionar mais abas aqui conforme o app crescer (ex: Agenda, Servicos, Perfil)
    AgendaBarbeiro: {
      screen: AgendaBarbeiro, // Substitua pela tela de agenda futuramente
      options: {
        tabBarLabel: "Agenda",
        tabBarIcon: ({ color, size }) => (
          <Feather name="calendar" size={size} color={color} />
        ),
      },
    },

    PerfilBarbeiro: {
      screen: PerfilBarbeiro, // Substitua pela tela de perfil futuramente
      options: {
        tabBarLabel: "Perfil",
        tabBarIcon: ({ color, size }) => (
          <Feather name="user" size={size} color={color} />
        ),
      },
    },
  },
});

const NavegacaoGeralBarbeiro = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    AbasBarbeiroPrincipais: {
      screen: AbasBarbeiro,
    },
    RelatoriosFinanceiros: {
      screen: RelatoriosFinanceiros,
    },
    Servicos: {
      screen: Servicos,
    },
    HorariosTrabalho: {
      screen: HorariosTrabalho,
    },
  },
});

export const NavegacaoBarbeiroPrincipal = createStaticNavigation(
  NavegacaoGeralBarbeiro,
);
