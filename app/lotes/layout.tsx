import { SubnavExplorar } from "@/components/subnav-explorar";

export default function LotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubnavExplorar actual="/lotes" />
      {children}
    </>
  );
}
