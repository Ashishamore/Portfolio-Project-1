import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import type { StoryOverlay } from '../lib/types'
import { Avatar } from './ui'

const COLORS = ['#ffffff', '#000000', '#f43f5e', '#f59e0b', '#22c55e', '#0ea5e9', '#a855f7', '#ec4899']
const STICKERS = ['📸', '✨', '❤️', '🔥', '😂', '🎉', '📍', '🌊', '⛰️', '🌙', '☕', '🎬']
const BRUSH_SIZES = [3, 6, 12]

/** A freehand stroke in 0–1 frame coordinates, so it scales with the viewport. */
type Stroke = { color: string; width: number; points: { x: number; y: number }[] }

type Tool = 'none' | 'draw' | 'stickers'

export type StoryDraft = {
  overlays: StoryOverlay[]
  drawing?: string
  audience: 'public' | 'closeFriends'
}

export default function StoryEditor({
  image,
  authorName,
  authorGradient,
  onBack,
  onPublish,
}: {
  image: string
  authorName: string
  authorGradient: string
  onBack: () => void
  onPublish: (draft: StoryDraft) => void
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokeRef = useRef<Stroke | null>(null)

  const [overlays, setOverlays] = useState<StoryOverlay[]>([])
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [tool, setTool] = useState<Tool>('none')
  const [brush, setBrush] = useState({ color: COLORS[0], width: BRUSH_SIZES[1] })
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Text composer state — open when editing a text overlay, new or existing.
  const [textEdit, setTextEdit] = useState<StoryOverlay | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (const stroke of strokes) {
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.beginPath()
      stroke.points.forEach((p, i) => {
        const x = p.x * canvas.width
        const y = p.y * canvas.height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  }, [strokes])

  // Canvas pixels must track its CSS box, and every resize wipes it, so redraw after.
  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return

    const sync = () => {
      canvas.width = frame.clientWidth
      canvas.height = frame.clientHeight
      redraw()
    }
    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [redraw])

  useEffect(redraw, [redraw])

  function framePoint(e: ReactPointerEvent) {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0.5, y: 0.5 }
    return {
      x: Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1),
      y: Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1),
    }
  }

  function startStroke(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (tool !== 'draw') return
    e.currentTarget.setPointerCapture(e.pointerId)
    strokeRef.current = { color: brush.color, width: brush.width, points: [framePoint(e)] }
  }

  function extendStroke(e: ReactPointerEvent<HTMLCanvasElement>) {
    const stroke = strokeRef.current
    if (!stroke) return
    // Painted straight to the canvas while moving; committed to state only on pointer up.
    stroke.points.push(framePoint(e))
    paintLive(stroke)
  }

  function paintLive(stroke: Stroke) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || stroke.points.length < 2) return

    const [prev, last] = stroke.points.slice(-2)
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height)
    ctx.lineTo(last.x * canvas.width, last.y * canvas.height)
    ctx.stroke()
  }

  function endStroke() {
    const stroke = strokeRef.current
    strokeRef.current = null
    if (stroke && stroke.points.length > 1) setStrokes((prev) => [...prev, stroke])
  }

  function startDrag(e: ReactPointerEvent<HTMLDivElement>, id: string) {
    if (tool === 'draw') return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDraggingId(id)
  }

  function onDrag(e: ReactPointerEvent<HTMLDivElement>, id: string) {
    if (draggingId !== id) return
    const { x, y } = framePoint(e)
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, x: x * 100, y: y * 100 } : o)))
  }

  function addSticker(value: string) {
    setOverlays((prev) => [
      ...prev,
      { id: `ov${Date.now()}`, kind: 'sticker', value, x: 50, y: 50, color: '#ffffff', size: 44 },
    ])
    setTool('none')
  }

  function commitText() {
    if (!textEdit) return
    const value = textEdit.value.trim()

    setOverlays((prev) => {
      const without = prev.filter((o) => o.id !== textEdit.id)
      return value ? [...without, { ...textEdit, value }] : without
    })
    setTextEdit(null)
  }

  function publish(audience: 'public' | 'closeFriends') {
    const drawing = strokes.length > 0 ? canvasRef.current?.toDataURL('image/png') : undefined
    onPublish({ overlays, drawing, audience })
  }

  const drawing = tool === 'draw'

  return (
    <div className="relative h-full select-none bg-black">
      <div ref={frameRef} className="absolute inset-0 overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />

        <canvas
          ref={canvasRef}
          onPointerDown={startStroke}
          onPointerMove={extendStroke}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          className={`absolute inset-0 h-full w-full ${drawing ? 'touch-none' : 'pointer-events-none'}`}
        />

        {overlays.map((o) => (
          <div
            key={o.id}
            onPointerDown={(e) => startDrag(e, o.id)}
            onPointerMove={(e) => onDrag(e, o.id)}
            onPointerUp={() => setDraggingId(null)}
            onDoubleClick={() => o.kind === 'text' && setTextEdit(o)}
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              color: o.color,
              fontSize: `${o.size}px`,
              textShadow: o.kind === 'text' ? '0 1px 6px rgba(0,0,0,0.45)' : undefined,
            }}
            className={`absolute max-w-[80%] -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap break-words text-center font-bold leading-tight ${
              drawing ? 'pointer-events-none' : 'cursor-move touch-none'
            }`}
          >
            {o.value}
          </div>
        ))}
      </div>

      {/* Top bar — close on the left, tools on the right, exactly where the muscle memory is. */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-1 px-3 py-3">
        <IconButton
          label={drawing ? 'Finish drawing' : 'Close editor'}
          onClick={() => (drawing ? setTool('none') : onBack())}
        >
          {drawing ? (
            <span className="px-1 text-xs font-semibold">Done</span>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          )}
        </IconButton>

        <div className="ml-auto flex items-center gap-1">
          {drawing ? (
            <IconButton
              label="Undo stroke"
              onClick={() => setStrokes((prev) => prev.slice(0, -1))}
              disabled={strokes.length === 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14 4.5 9.5 9 5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-3" />
              </svg>
            </IconButton>
          ) : (
            <>
              <IconButton
                label="Add text"
                onClick={() =>
                  setTextEdit({
                    id: `ov${Date.now()}`,
                    kind: 'text',
                    value: '',
                    x: 50,
                    y: 45,
                    color: COLORS[0],
                    size: 28,
                  })
                }
              >
                <span className="text-sm font-bold">Aa</span>
              </IconButton>

              <IconButton label="Stickers" onClick={() => setTool(tool === 'stickers' ? 'none' : 'stickers')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5a8.5 8.5 0 1 1-8.5 8.5c0-.2 0-.4.02-.6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 12a8.5 8.5 0 0 1-8.5 8.5" />
                  <circle cx="9.5" cy="10" r="1" fill="currentColor" />
                  <circle cx="14.5" cy="10" r="1" fill="currentColor" />
                  <path strokeLinecap="round" d="M9 14.5a4 4 0 0 0 6 0" />
                </svg>
              </IconButton>

              <IconButton label="Draw" onClick={() => setTool('draw')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 20s1-3.5 2.5-5L16 5.5a2.1 2.1 0 0 1 3 3L9.5 18C8 19.5 4 20 4 20Z" />
                </svg>
              </IconButton>
            </>
          )}
        </div>
      </div>

      {drawing && (
        <>
          <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col gap-2">
            {BRUSH_SIZES.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setBrush((b) => ({ ...b, width: w }))}
                aria-label={`Brush size ${w}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition ${
                  brush.width === w ? 'bg-white/30' : 'bg-black/30 hover:bg-black/50'
                }`}
              >
                <span className="rounded-full bg-white" style={{ width: w + 2, height: w + 2 }} />
              </button>
            ))}
          </div>

          <ColorRow value={brush.color} onChange={(color) => setBrush((b) => ({ ...b, color }))} />
        </>
      )}

      {tool === 'stickers' && (
        <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-slate-900/95 px-4 pb-5 pt-3 backdrop-blur">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="grid grid-cols-6 gap-2">
            {STICKERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSticker(s)}
                className="rounded-xl bg-white/5 py-2.5 text-2xl transition hover:bg-white/15"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audience bar — "Your story", "Close friends", then send. */}
      {tool === 'none' && !textEdit && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-4 pt-8">
          <button
            type="button"
            onClick={() => publish('public')}
            className="flex items-center gap-2 rounded-full bg-white/15 py-1.5 pl-1.5 pr-3.5 backdrop-blur transition hover:bg-white/25"
          >
            <span className="h-7 w-7">
              <Avatar name={authorName} gradient={authorGradient} size="sm" />
            </span>
            <span className="text-xs font-semibold text-white">Your story</span>
          </button>

          <button
            type="button"
            onClick={() => publish('closeFriends')}
            className="flex items-center gap-1.5 rounded-full bg-white/15 py-2 pl-2 pr-3.5 backdrop-blur transition hover:bg-white/25"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
              ★
            </span>
            <span className="text-xs font-semibold text-white">Close friends</span>
          </button>

          <button
            type="button"
            onClick={() => publish('public')}
            aria-label="Share story"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 transition hover:bg-slate-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6-6m6 6-6 6" />
            </svg>
          </button>
        </div>
      )}

      {textEdit && (
        <div className="absolute inset-0 z-30 flex flex-col bg-black/70 backdrop-blur-sm">
          <div className="flex justify-end px-4 py-3">
            <button type="button" onClick={commitText} className="text-sm font-semibold text-white">
              Done
            </button>
          </div>

          <div className="flex flex-1 items-center px-6">
            <textarea
              autoFocus
              value={textEdit.value}
              onChange={(e) => setTextEdit({ ...textEdit, value: e.target.value })}
              rows={3}
              placeholder="Type something"
              style={{ color: textEdit.color, fontSize: `${textEdit.size}px` }}
              className="w-full resize-none bg-transparent text-center font-bold leading-tight placeholder:text-white/40 focus:outline-none"
            />
          </div>

          <div className="px-6 pb-3">
            <input
              type="range"
              min={16}
              max={52}
              value={textEdit.size}
              onChange={(e) => setTextEdit({ ...textEdit, size: Number(e.target.value) })}
              aria-label="Text size"
              className="w-full accent-white"
            />
          </div>

          <ColorRow
            value={textEdit.color}
            onChange={(color) => setTextEdit({ ...textEdit, color })}
            className="relative pb-6"
          />
        </div>
      )}
    </div>
  )
}

function ColorRow({
  value,
  onChange,
  className = 'absolute inset-x-0 bottom-0 pb-24',
}: {
  value: string
  onChange: (color: string) => void
  className?: string
}) {
  return (
    <div className={`flex justify-center gap-2 px-4 ${className}`}>
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Colour ${c}`}
          style={{ backgroundColor: c }}
          className={`h-7 w-7 rounded-full border-2 transition ${
            value === c ? 'border-white ring-2 ring-white/40' : 'border-white/60'
          }`}
        />
      ))}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 min-w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
