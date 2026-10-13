"use client";

import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { useMemo, type ReactNode } from "react";
import type { PrivyMinimo } from "./contexto";

function Puente({ hijo }: { hijo: (privy: PrivyMinimo) => ReactNode }) {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const privy = useMemo<PrivyMinimo>(() => {
    const cuentaBilletera = user?.linkedAccounts.find((c) => c.type === "wallet" && c.walletClientType === "privy");
    return {
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
export default function PuentePrivy({ appId, hijo }: { appId: string; hijo: (privy: PrivyMinimo) => ReactNode }) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google"],
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        appearance: { showWalletLoginFirst: false },
      }}
    >
      <Puente hijo={hijo} />
    </PrivyProvider>
  );
}
