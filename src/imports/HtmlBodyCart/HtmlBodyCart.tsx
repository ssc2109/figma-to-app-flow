import svgPaths from "./svg-sewtlin4gc";
import imgIncaKola500Ml from "./7a7a1a54128ef8e3dee020a1832b332677bb1994.png";
import imgPanFrances from "./1c39aebd1210a98a2c75e829f94bd8645a88f4eb.png";
import imgPapasLays from "./3a77978991e368fdd70c8d4fe2924a0360f31f6e.png";
import imgAguaCielo625Ml from "./7116e7f14366b3de536ae878d0d68b60ba863748.png";
import imgCafeAltomayo from "./738991cfc153ecd60d0d17f1aa95d7363de49eeb.png";
import imgArrozCosteno1Kg from "./2a5a5d04c1cbde4cdb39bd0b1e366e37882d08eb.png";
import imgUserProfilePhoto from "./4cf959c18b729fe922c16cc3a6fed53eeb16ef8a.png";

function Margin() {
  return (
    <div className="h-[18px] relative shrink-0 w-[30px]" data-name="Margin">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 18">
        <g id="Margin">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, white)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.3)] w-full">
        <p className="leading-[normal]">Buscar productos o códigos...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[10px] pt-[9px] px-[12px] relative size-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[18px] relative shrink-0 w-[30px]" data-name="Margin">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 18">
        <g id="Margin">
          <path d={svgPaths.p67a2900} fill="var(--fill-0, white)" fillOpacity="0.6" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="bg-[#161616] h-[56px] relative rounded-[9999px] shrink-0 w-full" data-name="Search Bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] relative size-full">
          <Margin />
          <Input />
          <Margin1 />
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-center justify-center left-[20px] px-[24px] py-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-black text-center whitespace-nowrap">
        <p className="leading-[24px]">Todo</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex flex-col items-center justify-center left-[115.09px] px-[24px] py-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.6)] text-center whitespace-nowrap">
        <p className="leading-[24px]">Bebidas</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex flex-col items-center justify-center left-[234.27px] px-[24px] py-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.6)] text-center whitespace-nowrap">
        <p className="leading-[24px]">Snacks</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex flex-col items-center justify-center left-[347.91px] px-[24px] py-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.6)] text-center whitespace-nowrap">
        <p className="leading-[24px]">Pan</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[#161616] content-stretch flex flex-col items-center justify-center left-[436.02px] px-[24px] py-[8px] rounded-[9999px] top-[8px]" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.6)] text-center whitespace-nowrap">
        <p className="leading-[24px]">Abarrotes</p>
      </div>
    </div>
  );
}

function CategoriesChips() {
  return (
    <div className="h-[56px] overflow-auto relative shrink-0 w-[390px]" data-name="Categories Chips">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function IncaKola500Ml() {
  return (
    <div className="absolute inset-[0_0_-0.5px_0]" data-name="Inca Kola 500ml">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-15.87%] max-w-none top-0 w-[131.74%]" src={imgIncaKola500Ml} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[12px] py-[4px] right-[12px] rounded-[9999px] top-[12px]" data-name="Overlay+OverlayBlur">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">S/ 3.50</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[20px]">Inca Kola 500ml</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.6)] w-full">
        <p className="leading-[16.5px]">Stock: 24 u.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Heading1 />
        <Container2 />
      </div>
    </div>
  );
}

function ProductCard1IncaKola() {
  return (
    <div className="bg-[#161616] col-1 content-stretch flex flex-col items-start justify-end justify-self-stretch min-h-[220px] overflow-clip pt-[151.5px] relative rounded-[28px] row-1 self-start shrink-0" data-name="Product Card 1: Inca Kola">
      <IncaKola500Ml />
      <div className="absolute bg-gradient-to-t from-black inset-[0_0_-0.5px_0] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.4)]" data-name="Gradient" />
      <OverlayOverlayBlur />
      <Container1 />
    </div>
  );
}

function PanFrances() {
  return (
    <div className="absolute inset-[0_0_-0.5px_0]" data-name="Pan Francés">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-15.87%] max-w-none top-0 w-[131.74%]" src={imgPanFrances} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur1() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[12px] py-[4px] right-[11.99px] rounded-[9999px] top-[12px]" data-name="Overlay+OverlayBlur">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">S/ 0.30</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[20px]">Pan Francés</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.6)] w-full">
        <p className="leading-[16.5px]">Stock: 120 u.</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Heading2 />
        <Container4 />
      </div>
    </div>
  );
}

function ProductCard2PanFrances() {
  return (
    <div className="bg-[#161616] col-2 content-stretch flex flex-col items-start justify-end justify-self-stretch min-h-[220px] overflow-clip pt-[151.5px] relative rounded-[28px] row-1 self-start shrink-0" data-name="Product Card 2: Pan Francés">
      <PanFrances />
      <div className="absolute bg-gradient-to-t from-black inset-[0_0_-0.5px_0] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.4)]" data-name="Gradient" />
      <OverlayOverlayBlur1 />
      <Container3 />
    </div>
  );
}

function PapasLays() {
  return (
    <div className="absolute inset-[0_0_-0.5px_0]" data-name="Papas Lay's">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-15.87%] max-w-none top-0 w-[131.74%]" src={imgPapasLays} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur2() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[12px] py-[4px] right-[12px] rounded-[9999px] top-[12px]" data-name="Overlay+OverlayBlur">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">S/ 4.20</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[20px]">{`Papas Lay's`}</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.6)] w-full">
        <p className="leading-[16.5px]">Stock: 15 u.</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Heading3 />
        <Container6 />
      </div>
    </div>
  );
}

function ProductCard3PapasLays() {
  return (
    <div className="bg-[#161616] col-1 content-stretch flex flex-col items-start justify-end justify-self-stretch min-h-[220px] overflow-clip pt-[151.5px] relative rounded-[28px] row-2 self-start shrink-0" data-name="Product Card 3: Papas Lay's">
      <PapasLays />
      <div className="absolute bg-gradient-to-t from-black inset-[0_0_-0.5px_0] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.4)]" data-name="Gradient" />
      <OverlayOverlayBlur2 />
      <Container5 />
    </div>
  );
}

function AguaCielo625Ml() {
  return (
    <div className="absolute inset-[0_0_-0.5px_0]" data-name="Agua Cielo 625ml">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-15.87%] max-w-none top-0 w-[131.74%]" src={imgAguaCielo625Ml} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur3() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[12px] py-[4px] right-[12px] rounded-[9999px] top-[12px]" data-name="Overlay+OverlayBlur">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">S/ 2.00</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[20px]">Agua Cielo 625ml</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.6)] w-full">
        <p className="leading-[16.5px]">Stock: 48 u.</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Heading4 />
        <Container8 />
      </div>
    </div>
  );
}

function ProductCard4AguaCielo() {
  return (
    <div className="bg-[#161616] col-2 content-stretch flex flex-col items-start justify-end justify-self-stretch min-h-[220px] overflow-clip pt-[151.5px] relative rounded-[28px] row-2 self-start shrink-0" data-name="Product Card 4: Agua Cielo">
      <AguaCielo625Ml />
      <div className="absolute bg-gradient-to-t from-black inset-[0_0_-0.5px_0] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.4)]" data-name="Gradient" />
      <OverlayOverlayBlur3 />
      <Container7 />
    </div>
  );
}

function CafeAltomayo() {
  return (
    <div className="absolute inset-[0_0_-0.5px_0]" data-name="Café Altomayo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-15.87%] max-w-none top-0 w-[131.74%]" src={imgCafeAltomayo} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur4() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[12px] py-[4px] right-[12px] rounded-[9999px] top-[12px]" data-name="Overlay+OverlayBlur">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">S/ 1.50</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[20px]">Café Altomayo</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.6)] w-full">
        <p className="leading-[16.5px]">Stock: 30 u.</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Heading5 />
        <Container10 />
      </div>
    </div>
  );
}

function ProductCard5CafeAltomayo() {
  return (
    <div className="bg-[#161616] col-1 content-stretch flex flex-col items-start justify-end justify-self-stretch min-h-[220px] overflow-clip pt-[151.5px] relative rounded-[28px] row-3 self-start shrink-0" data-name="Product Card 5: Café Altomayo">
      <CafeAltomayo />
      <div className="absolute bg-gradient-to-t from-black inset-[0_0_-0.5px_0] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.4)]" data-name="Gradient" />
      <OverlayOverlayBlur4 />
      <Container9 />
    </div>
  );
}

function ArrozCosteno1Kg() {
  return (
    <div className="absolute inset-[0_0_-0.5px_0]" data-name="Arroz Costeño 1kg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-15.87%] max-w-none top-0 w-[131.74%]" src={imgArrozCosteno1Kg} />
      </div>
    </div>
  );
}

function OverlayOverlayBlur5() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-start px-[12px] py-[4px] right-[12px] rounded-[9999px] top-[12px]" data-name="Overlay+OverlayBlur">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">S/ 12.50</p>
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[20px]">Arroz Costeño 1kg</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.6)] w-full">
        <p className="leading-[16.5px]">Stock: 60 u.</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Heading6 />
        <Container12 />
      </div>
    </div>
  );
}

function ProductCard6ArrozCosteno() {
  return (
    <div className="bg-[#161616] col-2 content-stretch flex flex-col items-start justify-end justify-self-stretch min-h-[220px] overflow-clip pt-[151.5px] relative rounded-[28px] row-3 self-start shrink-0" data-name="Product Card 6: Arroz Costeño">
      <ArrozCosteno1Kg />
      <div className="absolute bg-gradient-to-t from-black inset-[0_0_-0.5px_0] to-[rgba(0,0,0,0)] via-1/2 via-[rgba(0,0,0,0.4)]" data-name="Gradient" />
      <OverlayOverlayBlur5 />
      <Container11 />
    </div>
  );
}

function SectionProductGrid() {
  return (
    <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[___220px_220px_220px] relative shrink-0 w-full" data-name="Section - Product Grid">
      <ProductCard1IncaKola />
      <ProductCard2PanFrances />
      <ProductCard3PapasLays />
      <ProductCard4AguaCielo />
      <ProductCard5CafeAltomayo />
      <ProductCard6ArrozCosteno />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[512px] relative shrink-0 w-full" data-name="Main">
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center max-w-[inherit] pt-[16px] px-[20px] relative size-full">
          <SearchBar />
          <CategoriesChips />
          <SectionProductGrid />
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[16.667px] relative shrink-0 w-[16.651px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6513 16.6667">
        <g id="Container">
          <path d={svgPaths.p2413c700} fill="var(--fill-0, black)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-[#adc1f3] content-stretch flex items-center justify-center p-[2px] right-[-4px] rounded-[9999px] size-[20px] top-[-4px]" data-name="Background+Border">
      <div aria-hidden className="absolute border-2 border-[#161616] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[10px] text-black text-center whitespace-nowrap">
        <p className="leading-[15px]">12</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#a4c639] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Background">
      <Container14 />
      <BackgroundBorder />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.75px] right-0 top-[-1px]" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
        <p className="leading-[13.75px]">Subtotal</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[13.75px]" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white whitespace-nowrap">
        <p className="leading-[25px]">S/ 45.20</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[38.75px] relative shrink-0 w-[84.42px]" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <Background />
      <Container15 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[8px] relative shrink-0" data-name="Margin">
      <Container13 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#adc1f3] content-stretch flex h-[44px] items-center justify-center pb-[10.5px] pt-[9.5px] px-[24px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0)] h-[44px] left-0 right-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-1/2" data-name="Button:shadow" />
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#1a2b5a] text-[16px] text-center whitespace-nowrap">
        <p className="leading-[24px]">Carrito</p>
      </div>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-start pr-[8px] relative shrink-0" data-name="Button:margin">
      <Button5 />
    </div>
  );
}

function OverlayOverlayBlur6() {
  return (
    <div className="backdrop-blur-[20px] bg-[rgba(22,22,22,0.9)] max-w-[512px] relative rounded-[9999px] shrink-0 w-full" data-name="Overlay+OverlayBlur">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] p-[12px] relative size-full">
          <Margin2 />
          <ButtonMargin />
        </div>
      </div>
    </div>
  );
}

function FloatingCartStickyPanel() {
  return (
    <div className="absolute bottom-[176px] content-stretch flex flex-col items-start left-0 px-[20px] right-0" data-name="Floating Cart Sticky Panel">
      <OverlayOverlayBlur6 />
    </div>
  );
}

function UserProfilePhoto() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="User profile photo">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUserProfilePhoto} />
      </div>
    </div>
  );
}

function Border() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <UserProfilePhoto />
      </div>
      <div aria-hidden className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white tracking-[-0.5px] whitespace-nowrap">
        <p className="leading-[28px]">Trax</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, white)" fillOpacity="0.7" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Button">
      <Container19 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[64px] max-w-[512px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] pl-[20px] pr-[20.02px] relative size-full">
          <Border />
          <Heading />
          <Button6 />
        </div>
      </div>
    </div>
  );
}

function HeaderTopAppBar() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(0,0,0,0.8)] content-stretch flex flex-col items-start left-0 top-0 w-[390px]" data-name="Header - Top App Bar">
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[21px] relative shrink-0 w-[18.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.6667 21">
        <g id="Container">
          <path d={svgPaths.p103cff00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">
        <p className="leading-[15px]">Inicio</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Container21 />
    </div>
  );
}

function ButtonTab1Inicio() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[28.42px] top-1/2" data-name="Button - Tab 1: Inicio">
      <Container20 />
      <Margin3 />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[21px] relative shrink-0 w-[22.167px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.1667 21">
        <g id="Container">
          <path d={svgPaths.p15c2ea00} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[10px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">Ventas</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Container23 />
    </div>
  );
}

function ButtonTab2VentasActive() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[81.3px] top-1/2" data-name="Button - Tab 2: Ventas (Active)">
      <Container22 />
      <Margin4 />
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[21px] relative shrink-0 w-[23.443px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.4429 21">
        <g id="Container">
          <path d={svgPaths.p20bb9e00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">
        <p className="leading-[15px]">Negocio</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Container25 />
    </div>
  );
}

function ButtonTab4Negocio() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[227.61px] top-1/2" data-name="Button - Tab 4: Negocio">
      <Container24 />
      <Margin5 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[14px] relative shrink-0 w-[23.333px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.3333 14">
        <g id="Container">
          <path d={svgPaths.paf0ed00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">
        <p className="leading-[15px]">Crecer</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Container27 />
    </div>
  );
}

function ButtonTab5Crecer() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[291.11px] top-1/2" data-name="Button - Tab 5: Crecer">
      <Container26 />
      <Margin6 />
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 size-[29.333px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29.3333 29.3333">
        <g id="Container">
          <path d={svgPaths.pb610e00} fill="var(--fill-0, black)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[64px]" data-name="Background">
      <Container28 />
    </div>
  );
}

function ButtonTab3TraxFab() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[138.75px] top-[calc(50%-24px)]" data-name="Button - Tab 3: Trax (FAB)">
      <Background1 />
    </div>
  );
}

function BottomNavigationBarIdenticalToInicio() {
  return (
    <div className="absolute bg-[#161616] bottom-[88px] h-[80px] left-[19.5px] rounded-[9999px] w-[351px]" data-name="Bottom Navigation Bar (Identical to Inicio)">
      <ButtonTab1Inicio />
      <ButtonTab2VentasActive />
      <ButtonTab4Negocio />
      <ButtonTab5Crecer />
      <ButtonTab3TraxFab />
    </div>
  );
}

export default function HtmlBody() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[200px] pt-[64px] relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Html → Body">
      <Main />
      <FloatingCartStickyPanel />
      <HeaderTopAppBar />
      <BottomNavigationBarIdenticalToInicio />
    </div>
  );
}