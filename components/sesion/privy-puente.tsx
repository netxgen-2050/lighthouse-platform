"use client";

import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { useMemo, type ReactNode } from "react";
import type { IdentidadMinima } from "./contexto";

function Puente({ hijo }: { hijo: (privy: IdentidadMinima) => ReactNode }) {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const privy = useMemo<IdentidadMinima>(() => {
    const cuentaBilletera = user?.linkedAccounts.find((c) => c.type === "wallet" && c.walletClientType === "privy");
    return {
      proveedor: "privy",
      ready,
      authenticated,
      email: user?.email?.address ?? user?.google?.email ?? null,
      nombre: user?.google?.name ?? null,
      billetera: cuentaBilletera && "address" in cuentaBilletera ? cuentaBilletera.address : null,
      login: () => login(),
      logout,
      getAccessToken,
    };
  }, [ready, authenticated, user, login, logout, getAccessToken]);
  return <>{hijo(privy)}</>;
}

/**
 * Único lugar que importa el SDK de Privy. Se carga solo si hay `NEXT_PUBLIC_PRIVY_APP_ID` (ver `ProveedorSesion`):
 * sin Privy (por ejemplo en los e2e) el SDK ni se evalúa.
 */
export default function PuentePrivy({ appId, hijo }: { appId: string; hijo: (privy: IdentidadMinima) => ReactNode }) {
  const origen = typeof window === "undefined" ? "" : window.location.origin;
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google"],
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        // Solo informa: la aceptación es la de las casillas del paso previo (consentimiento-alta).
        appearance: { showWalletLoginFirst: false },
        legal: {
          privacyPolicyUrl: `${origen}/privacidad`,
          termsAndConditionsUrl: `${origen}/privacidad#terminos`,
        },
      }}
    >
      <Puente hijo={hijo} />
    </PrivyProvider>
  );
}
