// Tipografía del evento: solo la importa TemaEvento, así Next solo la precarga en las rutas del Congreso.
// Nota de portabilidad: next/font ata a Next. Si la vitrina se sirve fuera de Next, este es el único archivo a
// reemplazar (por un <link> a Google Fonts).
import { Hanken_Grotesk, Unbounded } from "next/font/google";

export const fuenteTitulos = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--evento-fuente-titulos",
  display: "swap",
});

export const fuenteTexto = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--evento-fuente-texto",
  display: "swap",
});
