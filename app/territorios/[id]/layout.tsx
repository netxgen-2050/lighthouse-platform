import { SubnavExplorar } from "@/components/subnav-explorar";

export default function TerritorioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubnavExplorar actual="/territorios/lighthouse" />
      {children}
    </>
  );
}
