import { AgendamentoProvider } from "@/contexts/AgendamentoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationIndependentTree } from "@react-navigation/native";
import React from "react";
import { NavegacaoPrincipal } from "../../routes/tab.routes";

export default function _layout() {
  return (
    <NavigationIndependentTree>
      <AuthProvider>
        <AgendamentoProvider>
          <NavegacaoPrincipal />
        </AgendamentoProvider>
      </AuthProvider>
    </NavigationIndependentTree>
  );
}
