import { SubnavExplorar } from "@/components/subnav-explorar";

export default function TribusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubnavExplorar actual="/tribus" />
      {children}
    </>
  );
}
