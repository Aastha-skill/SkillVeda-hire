import safexpressLogo from "@assets/safexpress.png";
import springworksLogo from "@assets/springworks logo_1757256271179.png";
import evenLogo from "@assets/even_1757256454941.png";
import plumLogo from "@assets/plum_logo_1757256547595.png";
import atlysLogo from "@assets/Atlys_logo_highres_1757256644076.png";
import ongridLogo from "@assets/ongrid_1757259216389.png";
import bitespeedLogo from "@assets/bitespeed_1757259379417.png";
import buildeskLogo from "@assets/b2479200-14e9-4049-8674-c8c4743ce245_1772877933442.jpeg";
import ginesysLogo from "@assets/cc80205c-2e26-4218-b02a-b2f1e6baa14f_1772877933442.jpeg";
import padcareLogo from "@assets/ff4967f1-2c3a-481c-997a-a811b1acce37_1772877933442.jpeg";
import qoruzLogo from "@assets/341f83aa-1990-4b28-919b-b7db430fe897_1772877933442.jpeg";
import intugineLogo from "@assets/a72c0f1b-5cb0-4ee3-95a1-bd3a33aca2e5_1772877933442.jpeg";
import shopdeckLogo from "@assets/ceba08ca-2874-453a-b775-f92aeee7c2da_1772877933442.jpeg";
import leadratLogo from "@assets/87ff1f7f-c8ef-461b-a745-117f1b6ad7e1_1772877933442.jpeg";
import bizomLogo from "@assets/c10e3078-1cb8-4d06-af3b-1661cbef26e5_1772877933442.jpeg";
import itiliteLogo from "@assets/e702ea77-ec5c-40eb-b6ad-2e1292e2f443_1772877933442.jpeg";

const logos = [
  { src: safexpressLogo, alt: "Safexpress" },
  { src: springworksLogo, alt: "Springworks" },
  { src: evenLogo, alt: "Even" },
  { src: plumLogo, alt: "Plum" },
  { src: atlysLogo, alt: "Atlys" },
  { src: ongridLogo, alt: "OnGrid" },
  { src: bitespeedLogo, alt: "Bitespeed" },
  { src: buildeskLogo, alt: "Buildesk" },
  { src: ginesysLogo, alt: "Ginesys" },
  { src: padcareLogo, alt: "Padcare" },
  { src: qoruzLogo, alt: "Qoruz" },
  { src: intugineLogo, alt: "Intugine" },
  { src: shopdeckLogo, alt: "ShopDeck" },
  { src: leadratLogo, alt: "LeadRat" },
  { src: bizomLogo, alt: "Bizom" },
  { src: itiliteLogo, alt: "Itilite" },
  { src: undefined, alt: "Appknox", text: true, color: "#1A73E8" },
  { src: undefined, alt: "Prosperr", text: true, color: "#10B981" },
];

export default function CompanyRibbon({ title, titleClassName, titleStyle }: { title?: string; titleClassName?: string; titleStyle?: React.CSSProperties }) {
  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={titleClassName || "text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10"} style={titleStyle}>
          {title || "Unlock roles in the top 1% of the industry"}
        </h2>
      </div>
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="animate-marquee group-hover:[animation-play-state:paused]" style={{ display: "flex", width: "fit-content" }}>
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="flex-shrink-0 mx-5 sm:mx-7 lg:mx-9 flex items-center justify-center"
              style={{ height: 64, width: 160 }}
            >
              {logo.text ? (
                <span
                  className="text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap"
                  style={{ color: logo.color }}
                >
                  {logo.alt}
                </span>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-10 sm:max-h-12 max-w-32 sm:max-w-36 w-auto h-auto object-contain"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        + 45 more companies offering career opportunities
      </p>
    </section>
  );
}
