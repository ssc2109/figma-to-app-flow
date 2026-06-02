import imgIncaKola from "@/imports/HtmlBody/7a7a1a54128ef8e3dee020a1832b332677bb1994.png";
import imgPanFrances from "@/imports/HtmlBody/1c39aebd1210a98a2c75e829f94bd8645a88f4eb.png";
import imgPapasLays from "@/imports/HtmlBody/3a77978991e368fdd70c8d4fe2924a0360f31f6e.png";
import imgAguaCielo from "@/imports/HtmlBody/7116e7f14366b3de536ae878d0d68b60ba863748.png";
import imgCafe from "@/imports/HtmlBody/738991cfc153ecd60d0d17f1aa95d7363de49eeb.png";
import imgArroz from "@/imports/HtmlBody/2a5a5d04c1cbde4cdb39bd0b1e366e37882d08eb.png";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export const PRODUCTS: Product[] = [
  { id: "inca-kola", name: "Inca Kola 500ml", price: 3.5, image: imgIncaKola },
  { id: "pan-frances", name: "Pan Francés", price: 0.3, image: imgPanFrances },
  { id: "papas-lays", name: "Papas Lay's", price: 4.2, image: imgPapasLays },
  { id: "agua-cielo", name: "Agua Cielo 625ml", price: 2.0, image: imgAguaCielo },
  { id: "cafe-altomayo", name: "Café Altomayo", price: 1.5, image: imgCafe },
  { id: "arroz-costeno", name: "Arroz Costeño 1kg", price: 12.5, image: imgArroz },
];

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

export const formatSoles = (n: number) => `S/ ${n.toFixed(2)}`;
