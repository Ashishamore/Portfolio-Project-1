import type { ReactNode } from 'react'

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative h-dvh w-full bg-slate-950
        lg:h-auto lg:w-auto lg:rounded-[3.4rem] lg:p-[3px]
        lg:bg-[linear-gradient(150deg,#94a3b8_0%,#334155_16%,#cbd5e1_30%,#475569_46%,#1e293b_60%,#a8b3c2_76%,#334155_100%)]
        lg:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.75),0_12px_30px_-12px_rgba(0,0,0,0.65)]"
    >
      {/* side buttons — sit on the metal rail, outside the bezel */}
      <div className="absolute -left-[2px] top-[118px] hidden h-9 w-[3px] rounded-l-sm bg-gradient-to-r from-slate-700 to-slate-500 lg:block" />
      <div className="absolute -left-[2px] top-[178px] hidden h-16 w-[3px] rounded-l-sm bg-gradient-to-r from-slate-700 to-slate-500 lg:block" />
      <div className="absolute -left-[2px] top-[262px] hidden h-16 w-[3px] rounded-l-sm bg-gradient-to-r from-slate-700 to-slate-500 lg:block" />
      <div className="absolute -right-[2px] top-[218px] hidden h-24 w-[3px] rounded-r-sm bg-gradient-to-l from-slate-700 to-slate-500 lg:block" />

      {/* black bezel */}
      <div
        className="relative h-full w-full bg-slate-950
          lg:h-auto lg:w-auto lg:rounded-[3.25rem] lg:bg-black lg:p-[10px]"
      >
        {/* screen */}
        <div
          className="relative h-full w-full overflow-hidden bg-slate-950
            lg:aspect-[390/820] lg:h-[min(820px,calc(90dvh-26px))] lg:w-auto lg:rounded-[2.6rem]"
        >
          {children}

          {/* glass sheen */}
          <div className="pointer-events-none absolute inset-0 z-30 hidden rounded-[2.6rem] bg-[linear-gradient(125deg,rgba(255,255,255,0.10)_0%,transparent_28%,transparent_72%,rgba(255,255,255,0.05)_100%)] lg:block" />
        </div>
      </div>
    </div>
  )
}
