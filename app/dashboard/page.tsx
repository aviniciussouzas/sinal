'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const LEVELS = [
  { name: 'Livre', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  { name: 'Leve', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { name: 'Equilíbrio', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  { name: 'Cheio', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { name: 'Pesado', color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  { name: 'No limite', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
]

const PILLS = [
  'Parceiro da semana', 'Parceiro da semana', 'Parceiro da semana',
  'Agenda comprometida', 'Sem espaço agora', 'Sem espaço agora',
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

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatLastCheckin(registros: Registro[]) {
  if (!registros.length) return null
  const ultimo = registros[0]
  return `Último check-in: ${ultimo.data} às ${ultimo.hora}`
}

export default function Dashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [dados, setDados] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState<'semana' | 'historico'>('semana')
  const semanaAtual = getWeekStr()

  const isDark = theme === 'dark'
  const ink = isDark ? '#F2F2F2' : '#111111'
  const ink2 = isDark ? '#999999' : '#777777'
  const ink3 = isDark ? '#888888' : '#999999'
  const inkHint = isDark ? '#666666' : '#AAAAAA'
  const surface = isDark ? '#111111' : '#FFFFFF'
  const border = isDark ? '#222222' : '#E8E8E4'
  const border2 = isDark ? '#2E2E2E' : '#D8D8D4'
  const bgPage = isDark ? '#0A0A0A' : '#F5F5F3'

  useEffect(() => {
    fetch('/api/dados')
      .then(r => r.json())
      .then(d => { setDados(d); setLoading(false) })
  }, [])

  const semana = dados.filter(r => r.semana === semanaAtual)
  const parceiros = semana.filter(r => r.parceiro).sort((a, b) => a.nivel - b.nivel).slice(0, 2)
  const reserva = semana.filter(r => r.parceiro).sort((a, b) => a.nivel - b.nivel).slice(2)
  const media = semana.length ? (semana.reduce((a, r) => a + r.nivel, 0) / semana.length).toFixed(1) : '—'

  // Equipe no limite = todos com nível >= 3
  const equipeNoLimite = semana.length > 0 && semana.every(r => r.nivel >= 3)

  // Histórico agrupado
  const porSemana: Record<string, Registro[]> = {}
  dados.forEach(r => {
    if (!porSemana[r.semana]) porSemana[r.semana] = []
    porSemana[r.semana].push(r)
  })

  const ultimoCheckin = formatLastCheckin(dados)

  return (
    <main style={{ background: bgPage, color: ink, minHeight: '100vh' }}
      className="px-6 py-10 transition-colors duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Space Grotesk', sans-serif; }
        @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .anim { opacity: 0; animation: rise 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; } .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.2s; }  .d4 { animation-delay: 0.28s; }
      `}</style>

      <div className="max-w-3xl mx-auto">

        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-12 anim d1">
          <div>
            <span className="text-[13px] font-bold tracking-[0.16em] uppercase" style={{ color: ink }}>
              SINAL<span style={{ color: '#A78BFA' }}>.</span>
            </span>
            <p className="text-[10px] font-semibold tracking-wide uppercase mt-1" style={{ color: inkHint }}>
              Radar da equipe
            </p>
          </div>
          <div className="flex items-center gap-3">
            {ultimoCheckin && (
              <span className="text-[10px] font-medium hidden sm:block" style={{ color: inkHint }}>
                {ultimoCheckin}
              </span>
            )}
            <Link href="/" className="text-[10px] font-bold tracking-[0.1em] uppercase transition-colors duration-200"
              style={{ color: ink3 }}>← Check-in</Link>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="relative w-[44px] h-[25px] rounded-full cursor-pointer transition-all duration-400"
              style={{ background: surface, border: `1px solid ${border2}` }}>
              <div className="absolute top-[3px] left-[3px] w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9px] transition-all duration-[350ms]"
                style={{ background: ink, color: bgPage, transform: !isDark ? 'translateX(19px)' : 'translateX(0)' }}>
                {isDark ? '☽' : '☀'}
              </div>
            </button>
          </div>
        </div>

        {/* ABAS */}
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
          <div className="text-center py-20 text-[13px]" style={{ color: inkHint }}>Carregando radar...</div>
        )}

        {/* ====== ESTA SEMANA ====== */}
        {!loading && aba === 'semana' && (
          <div className="space-y-3 anim d3">

            {/* BANNER EQUIPE NO LIMITE */}
            {equipeNoLimite && (
              <div className="rounded-2xl p-5 border mb-2"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.35)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-[1.2rem] flex-shrink-0 mt-0.5">⚠</span>
                  <div>
                    <p className="text-[12px] font-bold mb-1" style={{ color: '#EF4444' }}>
                      Equipe com agenda comprometida esta semana
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: ink2 }}>
                      Nenhum parceiro disponível no momento. Considere negociar prazos, adiar demandas não urgentes ou aguardar a atualização de quarta-feira.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: semana.length, label: 'Check-ins' },
                { val: parceiros.length, label: 'Parceiros da semana' },
                { val: media, label: 'Nível médio' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 transition-colors duration-500"
                  style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="text-[2.2rem] font-bold tracking-tight leading-none" style={{ color: ink }}>{s.val}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide mt-2" style={{ color: inkHint }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* PARCEIROS */}
            {parceiros.length > 0 && (
              <div className="rounded-2xl p-5 transition-colors duration-500"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: '#22C55E' }}>
                  Parceiro{parceiros.length > 1 ? 's' : ''} da semana
                </p>
                <div className="flex gap-6 flex-wrap">
                  {parceiros.map(r => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: LEVELS[r.nivel].bg, color: LEVELS[r.nivel].color }}>
                        {initials(r.nome)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold" style={{ color: '#22C55E' }}>{r.nome}</p>
                        <p className="text-[10px]" style={{ color: ink2 }}>Nível {r.nivel} · {LEVELS[r.nivel].name}</p>
                        {r.extras && <p className="text-[10px]" style={{ color: ink3 }}>{r.extras}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {reserva.length > 0 && (
                  <p className="text-[10px] mt-4 pt-3 font-medium" style={{ color: 'rgba(34,197,94,0.7)', borderTop: '1px solid rgba(34,197,94,0.15)' }}>
                    Reserva: {reserva.map(r => r.nome).join(', ')}
                  </p>
                )}
              </div>
            )}

            {semana.length === 0 && (
              <div className="text-center py-16 text-[13px]" style={{ color: inkHint }}>
                Nenhum check-in esta semana ainda.
              </div>
            )}

            {/* LISTA */}
            {semana.length > 0 && (
              <div className="rounded-2xl overflow-hidden transition-colors duration-500"
                style={{ background: surface, border: `1px solid ${border}` }}>
                {semana.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-4 transition-colors duration-200"
                    style={{ borderTop: i > 0 ? `1px solid ${border}` : 'none' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: LEVELS[r.nivel].bg, color: LEVELS[r.nivel].color }}>
                      {initials(r.nome)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold" style={{ color: ink }}>{r.nome}</span>
                        {r.versao === 'atualizado' && (
                          <span className="text-[8px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
                            style={{ background: border, color: ink2 }}>atualizado</span>
                        )}
                      </div>
                      {r.clientes && <p className="text-[11px] mt-0.5 truncate" style={{ color: ink2 }}>{r.clientes}</p>}
                      {r.extras && <p className="text-[11px] truncate" style={{ color: ink3 }}>Extras: {r.extras}</p>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border"
                        style={{ color: LEVELS[r.nivel].color, borderColor: LEVELS[r.nivel].color, background: LEVELS[r.nivel].bg }}>
                        <span className="text-[1rem] leading-none">{r.nivel}</span>
                        <span className="text-[8px] uppercase tracking-wide">{LEVELS[r.nivel].name}</span>
                      </div>
                      <p className="text-[9px] mt-1" style={{ color: inkHint }}>{PILLS[r.nivel]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ====== HISTÓRICO ====== */}
        {!loading && aba === 'historico' && (
          <div className="space-y-3 anim d3">
            {Object.keys(porSemana).length === 0 && (
              <div className="text-center py-16 text-[13px]" style={{ color: inkHint }}>Nenhum registro encontrado.</div>
            )}
            {Object.entries(porSemana).map(([sem, registros]) => (
              <div key={sem} className="rounded-2xl overflow-hidden transition-colors duration-500"
                style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${border}` }}>
                  <span className="text-[12px] font-bold" style={{ color: ink }}>Semana {sem}</span>
                  <span className="text-[10px] font-semibold" style={{ color: inkHint }}>
                    {registros.length} registro{registros.length > 1 ? 's' : ''}
                  </span>
                </div>
                {registros.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-4"
                    style={{ borderTop: i > 0 ? `1px solid ${border}` : 'none' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: LEVELS[r.nivel].bg, color: LEVELS[r.nivel].color }}>
                      {initials(r.nome)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold" style={{ color: ink }}>{r.nome}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ color: LEVELS[r.nivel].color, borderColor: LEVELS[r.nivel].color, background: LEVELS[r.nivel].bg }}>
                          {r.nivel}
                        </span>
                        {r.parceiro && (
                          <span className="text-[8px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>parceiro</span>
                        )}
                        {r.versao === 'atualizado' && (
                          <span className="text-[8px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
                            style={{ background: border, color: ink2 }}>editado</span>
                        )}
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: ink2 }}>
                        {r.data} {r.hora}{r.clientes ? ` · ${r.clientes}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
