import { RedirigirExplorar } from "@/components/explorar/redirigir-explorar";

// Explorar (spec explorar-paginas): `/explorar` lleva a la primera pestaña, o a la de su ancla (`#lotes`, de enlaces viejos).
export default function ExplorarPage() {
  return <RedirigirExplorar />;
}
