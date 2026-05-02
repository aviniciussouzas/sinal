'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

const LEVELS = [
  { name: 'Livre', label: 'livre', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', pill: 'Parceiro da semana' },
  { name: 'Leve', label: 'leve', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', pill: 'Parceiro da semana' },
  { name: 'Equilíbrio', label: 'equilíbrio', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', pill: 'Parceiro da semana' },
  { name: 'Cheio', label: 'cheio', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', pill: 'Agenda comprometida' },
  { name: 'Pesado', label: 'pesado', color: '#F97316', bg: 'rgba(249,115,22,0.1)', pill: 'Sem espaço agora' },
  { name: 'No limite', label: 'no limite', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', pill: 'Sem espaço agora' },
]

type Registro = {
  id: string; nome: string; semana: string
  nivel: number; clientes: string; extras: string
  data: string; hora: string; parceiro: boolean; versao: string
}

function getWeekStr() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now); mon.setDate(now.getDate() + diff)
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4)
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${fmt(mon)} – ${fmt(fri)}/${fri.getFullYear()}`
}

function getMonthLabel(semana: string) {
  const parts = semana.split('/')
  if (parts.length < 3) return semana
  const mes = parseInt(parts[parts.length - 2])
  const ano = parts[parts.length - 1].replace(/\s.+/, '')
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${meses[mes - 1] || mes} ${ano}`
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function drawMesh(canvas: HTMLCanvasElement, nivel: number, color: string) {
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const W = canvas.width = rect.width * 2
  const H = canvas.height = rect.height * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const { r, g, b } = hexToRgb(color)

  const grd = ctx.createRadialGradient(W * 0.15, H * 0.12, 0, W * 0.5, H * 0.5, W * 0.85)
  grd.addColorStop(0, `rgba(${r},${g},${b},0.09)`)
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  const gap = Math.round((40 - (nivel / 5) * 28) * 2)
  const lineOpacity = 0.035 + (nivel / 5) * 0.065
  ctx.strokeStyle = `rgba(${r},${g},${b},${lineOpacity})`
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += gap) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += gap) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  if (nivel >= 2) {
    const dotOpacity = ((nivel - 1) / 4) * 0.18
    ctx.fillStyle = `rgba(${r},${g},${b},${dotOpacity})`
    for (let x = 0; x <= W; x += gap) {
      for (let y = 0; y <= H; y += gap) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill()
      }
    }
  }
}

// Card com malha — malha só na zona superior
function SignalCard({ r, isDark }: { r: Registro; isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const L = LEVELS[r.nivel]

  const draw = useCallback(() => {
    if (!canvasRef.current || !topRef.current) return
    const rect = topRef.current.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const W = canvasRef.current.width = rect.width * 2
    const H = canvasRef.current.height = rect.height * 2
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    const { r: rv, g, b } = hexToRgb(L.color)
    const grd = ctx.createRadialGradient(W * 0.15, H * 0.15, 0, W * 0.5, H * 0.5, W * 0.85)
    grd.addColorStop(0, `rgba(${rv},${g},${b},0.1)`)
    grd.addColorStop(1, `rgba(${rv},${g},${b},0)`)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)
    const gap = Math.round((40 - (r.nivel / 5) * 28) * 2)
    const lineOpacity = 0.04 + (r.nivel / 5) * 0.07
    ctx.strokeStyle = `rgba(${rv},${g},${b},${lineOpacity})`
    ctx.lineWidth = 1
    for (let x = 0; x <= W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y <= H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    if (r.nivel >= 2) {
      const dotOpacity = ((r.nivel - 1) / 4) * 0.2
      ctx.fillStyle = `rgba(${rv},${g},${b},${dotOpacity})`
      for (let x = 0; x <= W; x += gap) {
        for (let y = 0; y <= H; y += gap) {
          ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill()
        }
      }
    }
  }, [r.nivel, L.color])

  useEffect(() => { const t = setTimeout(draw, 50); return () => clearTimeout(t) }, [draw])
  useEffect(() => {
    if (!topRef.current) return
    const ro = new ResizeObserver(draw)
    ro.observe(topRef.current)
    return () => ro.disconnect()
  }, [draw])

  const ink = isDark ? '#F2F2F2' : '#111111'
  const ink2 = isDark ? '#666666' : '#999999'
  const surface = isDark ? '#111111' : '#FFFFFF'
  const border = isDark ? '#1E1E1E' : '#E8E8E4'
  const divider = isDark ? '#1E1E1E' : '#EBEBEB'

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}`, minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
      {/* ZONA SUPERIOR — só a malha fica aqui */}
      <div ref={topRef} style={{ position: 'relative', padding: '14px 16px 12px', flexShrink: 0 }}>
        <canvas ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: L.color, marginBottom: '3px' }}>
            {r.nivel}
          </div>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: L.color, opacity: 0.65 }}>
            {L.name}
          </div>
        </div>
      </div>
      {/* DIVISOR */}
      <div style={{ height: '1px', background: divider, flexShrink: 0 }} />
      {/* ZONA INFERIOR — fundo limpo, sem textura */}
      <div style={{ padding: '10px 16px 14px', flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: ink, marginBottom: '4px' }}>{r.nome}</div>
        {r.clientes && (
          <div style={{ fontSize: '10px', color: ink2, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: r.extras ? '3px' : 0 }}>
            {r.clientes}
          </div>
        )}
        {r.extras && (
          <div style={{ fontSize: '10px', color: ink2, lineHeight: 1.5, opacity: 0.65 }}>↗ {r.extras}</div>
        )}
        {r.versao === 'atualizado' && (
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#444' : '#BBBBBB', background: isDark ? '#1A1A1A' : '#F0F0F0', border: `1px solid ${isDark ? '#2A2A2A' : '#E0E0E0'}`, padding: '2px 7px', borderRadius: '100px', display: 'inline-block' }}>
              atualizado
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Card mínimo — histórico
function MiniCard({ r, isDark }: { r: Registro; isDark: boolean }) {
  const L = LEVELS[r.nivel]
  const surface = isDark ? '#111111' : '#FFFFFF'
  const border = isDark ? '#1E1E1E' : '#E8E8E4'
  const ink = isDark ? '#F2F2F2' : '#111111'

  return (
    <div className="rounded-xl" style={{ background: surface, border: `1px solid ${border}`, padding: '10px 12px' }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color: L.color, marginBottom: '5px' }}>
        {r.nivel}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: ink, marginBottom: '2px' }}>{r.nome}</div>
      <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: L.color, opacity: 0.5 }}>
        {L.label}
      </div>
    </div>
  )
}

// Painel de parceiros — variação X
function ParceirosPanel({ parceiros, reserva, isDark }: {
  parceiros: Registro[]
  reserva: Registro[]
  isDark: boolean
}) {
  const surface2 = isDark ? '#161616' : '#F5F5F3'
  const border = isDark ? '#1A1A1A' : '#EBEBEB'
  const borderCard = isDark ? '#1E1E1E' : '#E4E4E0'
  const ink = isDark ? '#F2F2F2' : '#111111'
  const ink3 = isDark ? '#333333' : '#BBBBBB'
  const ink4 = isDark ? '#2A2A2A' : '#CCCCCC'

  if (parceiros.length === 0) return null

  return (
    <div className="rounded-2xl" style={{ background: surface2, border: `1px solid ${border}`, padding: '1.25rem' }}>
      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink3, marginBottom: '1rem' }}>
        Parceiro{parceiros.length > 1 ? 's' : ''} da semana
      </p>

      {/* Grid adaptativo — 1 ou 2 colunas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: parceiros.length > 1 ? '1fr 1fr' : '1fr',
        gap: '8px',
      }}>
        {parceiros.map(r => {
          const L = LEVELS[r.nivel]
          return (
            <div key={r.id} style={{ background: isDark ? '#111' : '#fff', border: `1px solid ${borderCard}`, borderRadius: '14px', padding: '1rem 1.125rem' }}>

              {/* Nome protagonista */}
              <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: ink, marginBottom: '6px' }}>
                {r.nome}
              </div>

              {/* Nível — ponto + número + label em linha com cor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: L.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: L.color, lineHeight: 1 }}>{r.nivel}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: L.color, opacity: 0.6 }}>{L.label}</span>
              </div>

              {/* Extras — o que pode ajudar */}
              {r.extras ? (
                <div style={{ fontSize: '10px', color: isDark ? '#444' : '#AAAAAA', lineHeight: 1.55 }}>
                  {r.extras}
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: isDark ? '#2A2A2A' : '#DDDDDD', lineHeight: 1.55, fontStyle: 'italic' }}>
                  disponível para demandas
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Reserva */}
      {reserva.length > 0 && (
        <div style={{ fontSize: '10px', color: ink4, marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: `1px solid ${border}`, fontWeight: 500 }}>
          Reserva · {reserva.map(r => `${r.nome} · nível ${r.nivel}`).join(' · ')}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [dados, setDados] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState<'semana' | 'historico'>('semana')
  const [mesExpandido, setMesExpandido] = useState<string | null>(null)
  const [semanaExpandida, setSemanaExpandida] = useState<string | null>(null)
  const [temAcesso, setTemAcesso] = useState(false)
  const semanaAtual = getWeekStr()

  useEffect(() => {
    const savedTheme = localStorage.getItem('sinal_theme') as 'dark' | 'light' | null
    if (savedTheme) setTheme(savedTheme)
    const nomeLocal = localStorage.getItem('sinal_nome')
    const semanaLocal = localStorage.getItem('sinal_semana')
    if (nomeLocal && semanaLocal === semanaAtual) setTemAcesso(true)
  }, [semanaAtual])

  const isDark = theme === 'dark'
  const ink = isDark ? '#F2F2F2' : '#111111'
  const ink2 = isDark ? '#AAAAAA' : '#666666'
  const ink3 = isDark ? '#888888' : '#888888'
  const inkHint = isDark ? '#777777' : '#AAAAAA'
  const surface = isDark ? '#111111' : '#FFFFFF'
  const surface2 = isDark ? '#161616' : '#F8F8F6'
  const border = isDark ? '#242424' : '#E8E8E4'
  const border2 = isDark ? '#303030' : '#D8D8D4'
  const bgPage = isDark ? '#0A0A0A' : '#F5F5F3'

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('sinal_theme', next)
  }

  useEffect(() => {
    if (!temAcesso) return
    fetch('/api/dados')
      .then(r => r.json())
      .then(d => { setDados(d); setLoading(false) })
  }, [temAcesso])

  const semana = dados.filter(r => r.semana === semanaAtual)
  const parceiros = semana.filter(r => r.parceiro).sort((a, b) => a.nivel - b.nivel).slice(0, 2)
  const reserva = semana.filter(r => r.parceiro).sort((a, b) => a.nivel - b.nivel).slice(2)
  const media = semana.length
    ? (semana.reduce((a, r) => a + r.nivel, 0) / semana.length).toFixed(1)
    : '—'
  const equipeNoLimite = semana.length > 0 && semana.every(r => r.nivel >= 3)

  const semanasUnicas = [...new Set(dados.map(r => r.semana))].sort().reverse()
  const semanaAnterior = semanasUnicas.find(s => s !== semanaAtual)
  const dadosSemanaAnterior = semanaAnterior ? dados.filter(r => r.semana === semanaAnterior) : []

  const porMes: Record<string, Record<string, Registro[]>> = {}
  dados.forEach(r => {
    if (r.semana === semanaAtual) return
    const mes = getMonthLabel(r.semana)
    if (!porMes[mes]) porMes[mes] = {}
    if (!porMes[mes][r.semana]) porMes[mes][r.semana] = []
    porMes[mes][r.semana].push(r)
  })

  return (
    <main style={{ background: bgPage, color: ink, minHeight: '100vh' }}
      className="px-6 py-10 transition-colors duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Space Grotesk', sans-serif; }
        @keyframes rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .anim { opacity:0; animation:rise 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1{animation-delay:.05s} .d2{animation-delay:.12s}
        .d3{animation-delay:.2s}  .d4{animation-delay:.28s}
      `}</style>

      <div className="max-w-3xl mx-auto">

        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-10 anim d1">
          <div>
            <span className="text-[13px] font-bold tracking-[0.16em] uppercase" style={{ color: ink }}>
              SINAL<span style={{ color: '#A78BFA' }}>.</span>
            </span>
            <p className="text-[9px] font-bold tracking-wide uppercase mt-1" style={{ color: inkHint }}>
              Radar da equipe · {semanaAtual}
            </p>
          </div>
          <Link href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all duration-200"
            style={{ color: ink, background: surface, border: `1px solid ${border2}` }}>
            ↗ Dar o sinal
          </Link>
        </div>

        {/* BLOQUEIO */}
        {!temAcesso && (
          <div className="rounded-2xl p-10 text-center anim d2"
            style={{ background: surface, border: `1px solid ${border}` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>◎</div>
            <p className="text-[18px] font-bold mb-2" style={{ color: ink }}>Ei, e o seu sinal?</p>
            <p className="text-[13px] leading-relaxed mb-1" style={{ color: ink2 }}>
              O radar aparece pra quem já deu o sinal.
            </p>
            <p className="text-[12px] leading-relaxed mb-6" style={{ color: inkHint }}>
              Não é pra dificultar — é pra todo mundo responder<br />
              com a cabeça no próprio momento, sem comparar primeiro.<br />
              Faz sentido, né?
            </p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold transition-all duration-200"
              style={{ background: '#8B5CF6', color: 'white' }}>
              Dar o sinal ↗
            </Link>
          </div>
        )}

        {/* CONTEÚDO */}
        {temAcesso && (
          <>
            <div className="flex gap-2 mb-8 anim d2">
              {(['semana', 'historico'] as const).map(t => (
                <button key={t} onClick={() => setAba(t)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer"
                  style={{ background: aba === t ? ink : surface, color: aba === t ? bgPage : ink2, border: `1px solid ${aba === t ? ink : border}` }}>
                  {t === 'semana' ? 'Esta semana' : 'Histórico'}
                </button>
              ))}
            </div>

            {loading && (
              <div className="text-center py-20 text-[13px]" style={{ color: inkHint }}>
                Carregando radar...
              </div>
            )}

            {/* ESTA SEMANA */}
            {!loading && aba === 'semana' && (
              <div className="space-y-3 anim d3">

                {equipeNoLimite && (
                  <div className="rounded-2xl p-5 border"
                    style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <div className="flex items-start gap-3">
                      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>⚠</span>
                      <div>
                        <p className="text-[12px] font-bold mb-1" style={{ color: '#EF4444' }}>
                          Equipe com agenda comprometida esta semana
                        </p>
                        <p className="text-[11px] leading-relaxed" style={{ color: ink2 }}>
                          Nenhum parceiro disponível. Considere negociar prazos ou aguardar a atualização de quarta-feira.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PARCEIROS — variação X */}
                {parceiros.length > 0 && (
                  <ParceirosPanel parceiros={parceiros} reserva={reserva} isDark={isDark} />
                )}

                {semana.length === 0 && (
                  <div className="text-center py-16 text-[13px]" style={{ color: inkHint }}>
                    Nenhum sinal esta semana ainda.
                  </div>
                )}

                {/* STATS discreta */}
                {semana.length > 0 && (
                  <div className="flex items-center gap-3 px-1">
                    <span className="text-[11px] font-medium" style={{ color: inkHint }}>
                      {semana.length} sinal{semana.length > 1 ? 'is' : ''} esta semana
                    </span>
                    <span style={{ color: border2 }}>·</span>
                    <span className="text-[11px] font-medium" style={{ color: inkHint }}>
                      nível médio {media}
                    </span>
                  </div>
                )}

                {/* GRID COM MALHA */}
                {semana.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {semana.map(r => <SignalCard key={r.id} r={r} isDark={isDark} />)}
                  </div>
                )}

                {/* SEMANA ANTERIOR */}
                {dadosSemanaAnterior.length > 0 && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: surface2, border: `1px solid ${border}` }}>
                    <button
                      onClick={() => setSemanaExpandida(s => s === semanaAnterior ? null : semanaAnterior!)}
                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer">
                      <div>
                        <span className="text-[11px] font-bold" style={{ color: ink3 }}>Semana anterior</span>
                        <span className="text-[10px] ml-2" style={{ color: inkHint }}>{semanaAnterior}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: ink3, display: 'inline-block', transition: 'transform 0.3s', transform: semanaExpandida === semanaAnterior ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                    </button>
                    {semanaExpandida === semanaAnterior && (
                      <div className="px-5 pb-5 grid gap-2"
                        style={{ borderTop: `1px solid ${border}`, paddingTop: '1rem', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                        {dadosSemanaAnterior.map(r => <MiniCard key={r.id} r={r} isDark={isDark} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* HISTÓRICO */}
            {!loading && aba === 'historico' && (
              <div className="space-y-3 anim d3">
                {Object.keys(porMes).length === 0 && (
                  <div className="text-center py-16 text-[13px]" style={{ color: inkHint }}>
                    Nenhum histórico além da semana atual.
                  </div>
                )}
                {Object.entries(porMes).map(([mes, semanas]) => (
                  <div key={mes} className="rounded-2xl overflow-hidden"
                    style={{ background: surface, border: `1px solid ${border}` }}>
                    <button
                      onClick={() => setMesExpandido(m => m === mes ? null : mes)}
                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold" style={{ color: ink }}>{mes}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: border, color: ink3 }}>
                          {Object.values(semanas).flat().length} registros
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: ink3, display: 'inline-block', transition: 'transform 0.3s', transform: mesExpandido === mes ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                    </button>

                    {mesExpandido === mes && (
                      <div style={{ borderTop: `1px solid ${border}` }}>
                        {Object.entries(semanas).map(([sem, registros]) => (
                          <div key={sem}>
                            <div className="flex items-center justify-between px-5 py-3"
                              style={{ background: surface2, borderTop: `1px solid ${border}` }}>
                              <span className="text-[10px] font-bold tracking-wide uppercase" style={{ color: ink3 }}>
                                Semana {sem}
                              </span>
                              <span className="text-[10px]" style={{ color: inkHint }}>
                                {registros.length} sinal{registros.length > 1 ? 'is' : ''}
                              </span>
                            </div>
                            {/* Mini cards — 5 colunas, só nome + nível + cor */}
                            <div className="px-5 py-4 grid gap-2"
                              style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                              {registros.map(r => <MiniCard key={r.id} r={r} isDark={isDark} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* RODAPÉ */}
        <div className="flex items-center justify-between mt-12 pt-5"
          style={{ borderTop: `1px solid ${border}` }}>
          <p className="text-[9px] font-medium" style={{ color: inkHint }}>
            Ferramenta voluntária entre prestadores autônomos
          </p>
          <button onClick={toggleTheme}
            className="relative w-[36px] h-[20px] rounded-full cursor-pointer transition-all duration-400"
            style={{ background: surface, border: `1px solid ${border2}` }}
            title="Alternar tema">
            <div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] transition-all duration-[350ms]"
              style={{ background: ink, color: bgPage, transform: !isDark ? 'translateX(16px)' : 'translateX(0)' }}>
              {isDark ? '☽' : '☀'}
            </div>
          </button>
        </div>

      </div>
    </main>
  )
}
