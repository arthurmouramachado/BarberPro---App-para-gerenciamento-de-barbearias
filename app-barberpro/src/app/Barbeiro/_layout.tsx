import { AgendamentoProvider } from "@/contexts/AgendamentoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationIndependentTree } from "@react-navigation/native";
import React from "react";
import { NavegacaoBarbeiroPrincipal } from "../../routes/tabBarber.routes";

export default function _layout() {
  return (
    <NavigationIndependentTree>
      <AuthProvider>
        <AgendamentoProvider>
          <NavegacaoBarbeiroPrincipal />
        </AgendamentoProvider>
      </AuthProvider>
    </NavigationIndependentTree>
  );
}
