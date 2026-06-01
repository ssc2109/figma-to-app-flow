import svgPaths from "./svg-hc6bxk0av9";
import imgProfile from "./752b2ffc6c9d7d95b1254f5a3ea754226cbf7bb2.png";

function Profile() {
  return (
    <div className="pointer-events-none relative rounded-[9999px] shrink-0 size-[48px]" data-name="Profile">
      <div className="absolute inset-0 overflow-hidden rounded-[9999px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgProfile} />
      </div>
      <div aria-hidden className="absolute border-2 border-[rgba(255,255,255,0.1)] border-solid inset-0 rounded-[9999px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.6)] tracking-[0.6px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Ecoarom</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[20px] text-white tracking-[-0.5px] w-full">
        <p className="leading-[25px]">Buenos días, Alberto</p>
      </div>
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0 w-full" data-name="Heading 1:margin">
      <Heading />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[200px]" data-name="Container">
      <Container3 />
      <Heading1Margin />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <Profile />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[21px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
        <g id="Container">
          <path d={svgPaths.p23e76100} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container4 />
    </div>
  );
}

function HeaderTopAppBar() {
  return (
    <div className="relative shrink-0 w-full" data-name="Header - TopAppBar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-[16px] relative size-full">
          <Container1 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.7)] text-center tracking-[1.4px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">VENTAS DE HOY</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[3.99px] items-start justify-center leading-[0] not-italic relative shrink-0 text-center tracking-[-1.6px] whitespace-nowrap" data-name="Paragraph">
      <div className="flex flex-col font-['Bai_Jamjuree:Medium',sans-serif] justify-center relative shrink-0 text-[32px] text-[rgba(255,255,255,0.6)]">
        <p className="leading-[32px]">S/</p>
      </div>
      <div className="flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center relative shrink-0 text-[64px] text-white">
        <p className="leading-[64px]">1.25K</p>
      </div>
    </div>
  );
}

function Shadow() {
  return (
    <div className="content-stretch drop-shadow-[0px_0px_10px_rgba(255,255,255,0.3)] flex items-start justify-center relative shrink-0" data-name="Shadow">
      <Paragraph />
    </div>
  );
}

function HeroSectionFloatingNumberKeepsBaiJamjureeAsRequestedForHero() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center py-[32px] relative shrink-0 w-full" data-name="Hero Section (Floating Number) - Keeps Bai Jamjuree as requested for Hero">
      <Margin />
      <Shadow />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Container">
          <path d={svgPaths.p421b880} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container6 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px]">Cobrar</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#161616] col-1 content-stretch flex flex-col gap-[8px] items-center justify-center justify-self-start px-[13.75px] py-[26px] relative rounded-[32px] row-1 self-start shrink-0" data-name="Button">
      <Overlay />
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[18px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
        <g id="Container">
          <path d={svgPaths.p13a1f810} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container8 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px]">Fiar</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#161616] col-2 content-stretch flex flex-col gap-[8px] items-center justify-center justify-self-start px-[13.75px] py-[26px] relative rounded-[32px] row-1 self-start shrink-0" data-name="Button">
      <Overlay1 />
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Container">
          <path d={svgPaths.p8f89580} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px]">Escanear</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#161616] col-3 content-stretch flex flex-col gap-[8px] items-center justify-center justify-self-start px-[8px] py-[26px] relative rounded-[32px] row-1 self-start shrink-0" data-name="Button">
      <Overlay2 />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[4px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 4">
        <g id="Container">
          <path d={svgPaths.p3a256b80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-center pl-[7.06px] pr-[7.08px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[20px] mb-0">Ver</p>
        <p className="leading-[20px]">todo</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#161616] col-4 content-stretch flex flex-col gap-[8px] items-center justify-center justify-self-start px-[13.75px] py-[16px] relative rounded-[32px] row-1 self-start shrink-0" data-name="Button">
      <Overlay3 />
      <Container13 />
    </div>
  );
}

function SectionQuickActions() {
  return (
    <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_128px] relative shrink-0 w-full" data-name="Section - Quick Actions">
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[19px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19">
        <g id="Container">
          <path d={svgPaths.p24855620} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay4() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <Container15 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[200px] pr-[6.19px] relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.8)] whitespace-nowrap">
        <p className="leading-[20px] mb-0">Hoy tienes 3 cosas que cuidar.</p>
        <p className="leading-[20px]">¿Te las muestro?</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Overlay4 />
      <Container16 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[10px] relative shrink-0 w-[6.167px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.16667 10">
        <g id="Container">
          <path d={svgPaths.p2ba68100} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Button">
      <Container17 />
    </div>
  );
}

function SectionAiSlot() {
  return (
    <div className="bg-[#161616] relative rounded-[32px] shrink-0 w-full" data-name="Section - AI Slot">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Container14 />
          <Button5 />
        </div>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white w-full">
        <p className="leading-[30px]">Para ti hoy</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 size-[18.333px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
        <g id="Container">
          <path d={svgPaths.p3ca8ed80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.7px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">TRAX AI</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex gap-[8px] items-center opacity-70 relative shrink-0 w-full" data-name="Container">
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[280px] relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.9)] whitespace-nowrap">
        <p className="leading-[26px] mb-0">Rosa, hoy es un buen día para</p>
        <p className="leading-[26px] mb-0">reponer stock de abarrotes. Tus</p>
        <p className="leading-[26px]">ventas subieron un 12%.</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-[236.03px]" data-name="Container">
      <Container19 />
      <Container22 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="h-[22px] relative shrink-0 w-[8.633px]" data-name="Margin">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.63333 22">
        <g id="Margin">
          <path d={svgPaths.p1468d600} fill="var(--fill-0, white)" fillOpacity="0.4" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#2a2a2a] relative rounded-[32px] shrink-0 w-full" data-name="Background">
      <div className="content-stretch flex items-start justify-between p-[24px] relative size-full">
        <Container18 />
        <Margin1 />
      </div>
    </div>
  );
}

function AiTipsSectionParaTiHoyNowUsingGeist() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="AI Tips Section: Para ti hoy - Now using Geist">
      <Heading1 />
      <Background />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-white w-full">
        <p className="leading-[30px]">Actividad Reciente</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[15px] relative shrink-0 w-[16.745px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7449 15">
        <g id="Container">
          <path d={svgPaths.p982c280} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay5() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[20px]">Venta Mostrador</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
        <p className="leading-[16px]">Hoy, 10:42 AM</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[109.72px]" data-name="Container">
      <Container27 />
      <Container28 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Overlay5 />
      <Container26 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[24px]">+S/ 120.00</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="bg-[#161616] relative rounded-[32px] shrink-0 w-full" data-name="Item 1">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Container24 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[16.667px] relative shrink-0 w-[18.342px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3417 16.6667">
        <g id="Container">
          <path d={svgPaths.p3d742120} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay6() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container31 />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[20px]">Pago de Fiado</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
        <p className="leading-[16px]">Hoy, 09:15 AM</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[92.47px]" data-name="Container">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Overlay6 />
      <Container32 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[24px]">+S/ 45.50</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="bg-[#161616] relative rounded-[32px] shrink-0 w-full" data-name="Item 2">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Container30 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[13.333px] relative shrink-0 w-[18.333px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 13.3333">
        <g id="Container">
          <path d={svgPaths.pfffa80} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay7() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container37 />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[20px]">Pago Proveedor</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
        <p className="leading-[16px]">Ayer, 04:30 PM</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[103.89px]" data-name="Container">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Overlay7 />
      <Container38 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb4ab] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">-S/ 350.00</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="bg-[#161616] relative rounded-[32px] shrink-0 w-full" data-name="Item 3">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[16px] pr-[15.99px] py-[16px] relative size-full">
          <Container36 />
          <Container41 />
        </div>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[18.333px] relative shrink-0 w-[12.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 18.3333">
        <g id="Container">
          <path d={svgPaths.p36b67580} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay8() {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
      <Container43 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[20px]">Cobro Yape</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Geist:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.6)] whitespace-nowrap">
        <p className="leading-[16px]">Ayer, 02:10 PM</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[81.77px]" data-name="Container">
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Overlay8 />
      <Container44 />
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Bai_Jamjuree:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[24px]">+S/ 18.00</p>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="bg-[#161616] relative rounded-[32px] shrink-0 w-full" data-name="Item 4">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Container42 />
          <Container47 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function SectionActividadRecienteNowUsingGeistForAllTextAndNumbers() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Section - Actividad Reciente - Now using Geist for all text and numbers">
      <Heading2 />
      <Container23 />
    </div>
  );
}

function Main() {
  return (
    <div className="relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[40px] items-start px-[20px] relative size-full">
        <HeroSectionFloatingNumberKeepsBaiJamjureeAsRequestedForHero />
        <SectionQuickActions />
        <SectionAiSlot />
        <AiTipsSectionParaTiHoyNowUsingGeist />
        <SectionActividadRecienteNowUsingGeistForAllTextAndNumbers />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="Container">
      <HeaderTopAppBar />
      <Main />
    </div>
  );
}