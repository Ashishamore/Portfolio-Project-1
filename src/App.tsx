import DesktopBackdrop from './components/DesktopBackdrop'
import PhoneFrame from './components/PhoneFrame'
import AppShell from './components/AppShell'

function App() {
  return (
    <div className="relative min-h-dvh w-full bg-slate-950">
      <DesktopBackdrop />
      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center lg:justify-end lg:pr-28">
        <PhoneFrame>
          <AppShell />
        </PhoneFrame>
      </div>
    </div>
  )
}

export default App
