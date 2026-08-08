export default function DesktopBackdrop() {
  return (
    <div className="fixed inset-0 hidden overflow-hidden bg-slate-950 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.35),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.25),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(217,70,239,0.2),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative flex h-full w-full items-center px-24">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-300">
            Prototype preview
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-white">
            Pulse
            <span className="block text-slate-400">a calmer way to move.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
            Interact with the live prototype on the right — every screen, tab, and
            transition runs end-to-end in the browser. This is the same experience
            you'll get on a phone.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Frontend-only demo
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Fully interactive
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
