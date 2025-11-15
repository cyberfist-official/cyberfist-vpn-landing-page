import Image from "next/image";
import {
  SecureVpnIcon,
  PrivacyFirstIcon,
  ReliableInfrastructureIcon,
  CrossPlatformIcon,
  DownloadStepIcon,
  ServerStepIcon,
  TapStepIcon,
  ProtectedStepIcon,
} from "./components/Icons";

// ⬅️ NEW: import the modal component
import WaitlistModal from "./components/WaitlistModal";

export default function Home() {
  const featuresData = [
    {
      icon: <SecureVpnIcon />,
      title: "Secure VPN",
      description: "Unite fast, encrypted connections across global servers.",
    },
    {
      icon: <PrivacyFirstIcon />,
      title: "Privacy First",
      description: "No logs. No trackers. No compromises.",
    },
    {
      icon: <ReliableInfrastructureIcon />,
      title: "Reliable Infrastructure",
      description:
        "DNSSEC, advanced encryption, and uptime monitoring keep you protected.",
    },
    {
      icon: <CrossPlatformIcon />,
      title: "Cross-Platform",
      description: "One-click connect from desktop, mobile, or tablet.",
    },
  ];

  const stepsData = [
    { icon: <DownloadStepIcon />, text: "Download the CyberFist app" },
    { icon: <ServerStepIcon />, text: "Pick your preferred server" },
    { icon: <TapStepIcon />, text: "Tap once to connect" },
    { icon: <ProtectedStepIcon />, text: "Your connection is locked down" },
  ];

  return (
    <div className="bg-dark-bg rounded-3xl max-w-4xl mx-auto my-8 p-6 sm:p-12 md:p-16 text-light-text font-sans shadow-2xl shadow-black/50 relative overflow-hidden">
      {/* === Header === */}
      <header className="mb-3 sm:mb-4 md:mb-6 flex items-start">
        <Image
          src="/logo-transparent.png"
          alt="CyberFist Logo"
          width={420}
          height={420}
          priority
          className="opacity-95 mix-blend-screen drop-shadow-[0_0_55px_rgba(0,255,213,0.45)] 
               -translate-y-3 sm:-translate-y-2 md:-translate-y-3 
               -ml-1 sm:ml-0"
        />
      </header>

      {/* === Hero Section === */}
      <section className="mb-12 md:mb-16">
        <h1 className="text-3xl sm:text-[2.25rem] md:text-[2.75rem] font-extrabold text-[#D0E7E8]/90 leading-tight mb-4 tracking-tight">
          Your shield in the digital fight
        </h1>
        <p className="text-lg md:text-xl text-dark-text mb-8 max-w-xl">
          A fast, secure VPN and privacy platform that puts control back in your
          hands.
        </p>

        {/* ⬇️ REPLACED <button> WITH MODAL TRIGGER */}
        <WaitlistModal>Join the Waitlist</WaitlistModal>

        <div className="space-y-4 text-dark-text max-w-2xl text-base md:text-lg mt-12">
          <p>
            Every click, every search, every login is tracked. Big tech profits
            from your data. Hackers look for your weakest link.
          </p>
          <p>
            CyberFist exists to fight back. We make privacy simple, fast, and
            built for the battles of today’s internet.
          </p>
        </div>
      </section>

      {/* === Features === */}
      <section className="my-16 md:my-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuresData.map((feature) => (
            <div
              key={feature.title}
              className="bg-gradient-to-b from-[#1E4247] to-[#143034] rounded-2xl p-6"
            >
              <div className="mb-4 text-accent-teal h-8 w-8">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-light-text">
                {feature.title}
              </h3>
              <p className="text-dark-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === Technology Section === */}
      <section className="my-16 md:my-20 text-center text-dark-text text-base md:text-lg max-w-3xl mx-auto space-y-4">
        <p>
          Built on trusted security technologies: WireGuard®, Cloudflare, and
          enterprise-grade encryption.
        </p>
        <p>
          CyberFist is designed by security professionals who live and breathe
          digital defense.
        </p>
      </section>

      {/* === How It Works === */}
      <section className="my-16 md:my-24">
        <div className="bg-gradient-to-b from-[#1E4247] to-[#143034] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Connector line */}
          <div
            className="absolute top-[2.8rem] sm:top-[3.2rem] left-[8%] right-[8%] h-[1px] bg-gradient-to-r from-transparent via-accent-teal/30 to-transparent animate-tealPulse"
            aria-hidden="true"
          ></div>

          <div className="relative grid grid-cols-4 gap-x-4 text-center z-10">
            {stepsData.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3"
              >
                {/* Icon circle */}
                <div className="w-10 h-10 flex items-center justify-center text-accent-teal bg-dark-bg rounded-full border border-accent-teal/80 shrink-0 z-10">
                  {step.icon}
                </div>
                {/* Label */}
                <p className="text-xs sm:text-sm text-dark-text leading-snug max-w-[150px]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-[#1E4247]/40 pt-10 mt-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-light-text">
              Privacy isn’t optional — it’s your right.
            </h2>
            <p className="text-dark-text">
              CyberFist makes it simple, powerful, and accessible.
            </p>
          </div>

          {/* ⬇️ SECOND MODAL TRIGGER IN FOOTER */}
          <WaitlistModal>Join the Waitlist</WaitlistModal>

          {/* Copyright */}
          <p className="text-sm text-dark-text mt-4">
            © 2025 CyberFist. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
