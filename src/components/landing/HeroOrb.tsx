interface HeroOrbProps {
  logoSrc: string
}

export default function HeroOrb({ logoSrc }: HeroOrbProps) {
  return (
    <div className="flex items-center justify-center relative min-h-[min(55vw,55vh)]">
      <div className="relative w-[min(400px,55vw)] h-[min(400px,55vw)]">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,174,239,0.15)_0%,transparent_70%)] blur-[40px] animate-orb-breathe" />

        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="absolute w-full h-full rounded-full border border-cyan/15 animate-pulse-ring"
              style={{ animationDelay: `${i}s` }}
            />
          </div>
        ))}

        {/* Main orb */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(0,174,239,0.25)_0%,rgba(59,130,246,0.1)_40%,rgba(17,24,39,0.6)_70%,rgba(3,7,18,0.8)_100%)] border-2 border-cyan/30 backdrop-blur-sm shadow-[0_0_60px_rgba(0,174,239,0.15),inset_0_0_40px_rgba(0,174,239,0.05)] animate-orb-breathe">
          {/* Wireframe rings */}
          <div className="absolute inset-[15%] rounded-full border border-cyan/20 animate-spin-slow" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-[25%] rounded-full border border-cyan/15 animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          <div className="absolute inset-[35%] rounded-full border border-cyan/10 animate-spin-slow" style={{ animationDuration: '10s' }} />

          {/* Cross hairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan/15 -translate-x-1/2" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan/15 -translate-y-1/2" />

          {/* Logo */}
          <img
            src={logoSrc}
            alt="AzFIT"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] object-contain z-10 drop-shadow-[0_0_12px_rgba(0,174,239,0.5)]"
          />

          {/* Inner core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-[radial-gradient(circle,rgba(0,174,239,0.4)_0%,rgba(59,130,246,0.15)_50%,transparent_100%)] blur-[8px]" />

          {/* Hotspots */}
          <div className="absolute w-3 h-3 rounded-full bg-cyan top-[20%] left-[70%] shadow-[0_0_12px_rgba(0,174,239,0.8),0_0_24px_rgba(0,174,239,0.4)] animate-orb-breathe" style={{ animationDelay: '0.5s' }} />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan top-[65%] left-[25%] shadow-[0_0_10px_rgba(0,174,239,0.7),0_0_20px_rgba(0,174,239,0.3)] animate-orb-breathe" style={{ animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 rounded-full bg-blue-500 top-[75%] left-[60%] shadow-[0_0_8px_rgba(59,130,246,0.7),0_0_16px_rgba(59,130,246,0.3)] animate-orb-breathe" style={{ animationDelay: '2.5s' }} />
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin-slow pointer-events-none" style={{ animationDuration: '30s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,174,239,0.6)]" />
        </div>
        <div className="absolute inset-0 animate-spin-slow pointer-events-none" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
        </div>
      </div>
    </div>
  )
}
