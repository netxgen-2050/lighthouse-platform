import { redirect } from "next/navigation";

// Lo que se abría en Canales ahora se ve en cada sello del pasaporte.
export default function CanalesPage() {
  redirect("/pasaporte");
}
