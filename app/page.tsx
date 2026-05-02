'use client'

import { useState, useEffect, useRef } from 'react'

const LEVELS = [
  { num: 0, label: 'livre', name: 'Livre', desc: 'Pode absorver projetos com tranquilidade esta semana.', pill: 'Parceiro da semana', parceiro: true, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', glow: 'rgba(34,197,94,0.07)' },
  { num: 1, label: 'leve', name: 'Leve', desc: 'Tem espaço para uma boa demanda chegar.', pill: 'Parceiro da semana', parceiro: true, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', glow: 'rgba(59,130,246,0.07)' },
  { num: 2, label: 'equilíbrio', name: 'Equilíbrio', desc: 'Tem espaço para algo pequeno. Depende do prazo e do escopo.', pill: 'Parceiro da semana', parceiro: true, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', glow: 'rgba(139,92,246,0.1)' },
  { num: 3, label: 'cheio', name: 'Cheio', desc: 'Avalie bem antes de aceitar algo extra.', pill: 'Agenda comprometida', parceiro: false, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', glow: 'rgba(245,158,11,0.07)' },
  { num: 4, label: 'pesado', name: 'Pesado', desc: 'Só emergências reais, com prazo negociado.', pill: 'Sem espaço agora', parceiro: false, color: '#F97316', bg: 'rgba(249,115,22,0.1)', glow: 'rgba(249,115,22,0.07)' },
  { num: 5, label: 'limite', name: 'No limite', desc: 'Semana tomada. Sem espaço para nada novo.', pill: 'Sem espaço agora', parceiro: false, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', glow: 'rgba(239,68,68,0.07)' },
]

const EXTRAS_OPCOES = [
  'Ajuste simples', 'Ajuste carrossel', 'Troca de imagem',
  'Ajuste de vídeo', 'Criação de moodboard', 'Apresentação', 'BV institucional',
]

function getWeekStr() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now); mon.setDate(now.getDate() + diff)
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4)
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${fmt(mon)} – ${fmt(fri)}/${fri.getFullYear()}`
}

function edicaoBloqueadaPorData() {
  const day = new Date().getDay()
  return day >= 4 || day === 0
}

type Estado = 'idle' | 'buscando' | 'novo' | 'editar' | 'bloqueado' | 'bloqueado-data' | 'sucesso'

type SinalExistente = {
  nivel: number; clientes: string; extras: string
  versao: string; parceiro: boolean
}

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [nome, setNome] = useState('')
  const [apelido, setApelido] = useState('')
  const [nivel, setNivel] = useState<number | null>(null)
  const [clientes, setClientes] = useState('')
  const [extras, setExtras] = useState('')
  const [extrasChips, setExtrasChips] = useState<string[]>([])
  const [estado, setEstado] = useState<Estado>('idle')
  const [sinalAtual, setSinalAtual] = useState<SinalExistente | null>(null)
  const [resultado, setResultado] = useState<{ parceiro: boolean; versao: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [glowColor, setGlowColor] = useState('rgba(139,92,246,0.07)')
  const semana = getWeekStr()
  const nomeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const L = nivel !== null ? LEVELS[nivel] : null

  // Lê tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('sinal_theme') as 'dark' | 'light' | null
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const isDark = theme === 'dark'
  const ink = isDark ? '#F2F2F2' : '#111111'
  const ink2 = isDark ? '#AAAAAA' : '#666666'
  const ink3 = isDark ? '#888888' : '#888888'
  const inkHint = isDark ? '#777777' : '#AAAAAA'
  const inkPlaceholder = isDark ? '#555555' : '#BBBBBB'
  const surface = isDark ? '#111111' : '#FFFFFF'
  const border = isDark ? '#242424' : '#E8E8E4'
  const border2 = isDark ? '#303030' : '#D8D8D4'
  const bgPage = isDark ? '#0A0A0A' : '#F5F5F3'

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('sinal_theme', next)
  }

  useEffect(() => {
    if (nomeTimer.current) clearTimeout(nomeTimer.current)
    if (nome.trim().length < 2) { setEstado('idle'); setSinalAtual(null); return }
    setEstado('buscando')
    nomeTimer.current = setTimeout(async () => {
      try {
        const id = apelido.trim() || nome.trim()
        const res = await fetch(`/api/dados?nome=${encodeURIComponent(id)}&semana=${encodeURIComponent(semana)}`)
        const data = await res.json()
        if (data.sinalExistente) {
          setSinalAtual(data.sinalExistente)
          if (!data.podeEditar) setEstado('bloqueado')
          else if (edicaoBloqueadaPorData()) setEstado('bloqueado-data')
          else setEstado('editar')
        } else {
          setSinalAtual(null)
          setEstado('novo')
        }
      } catch { setEstado('novo') }
    }, 700)
  }, [nome, apelido, semana])

  function selectLevel(n: number) {
    setNivel(n)
    setGlowColor(LEVELS[n].glow)
  }

  function toggleChip(chip: string) {
    setExtrasChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
  }

  function getExtrasValue() {
    const chipStr = extrasChips.join(' · ')
    const livreTrimmed = extras.trim()
    if (chipStr && livreTrimmed) return `${chipStr} · ${livreTrimmed}`
    return chipStr || livreTrimmed
  }

  function carregarSinalAtual() {
    if (!sinalAtual) return
    setNivel(sinalAtual.nivel)
    setClientes(sinalAtual.clientes)
    setExtras(sinalAtual.extras)
    setGlowColor(LEVELS[sinalAtual.nivel].glow)
  }

  async function handleSubmit() {
    if (!nome.trim() || nivel === null) return
    setLoading(true)
    const identificador = apelido.trim() || nome.trim()
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: identificador, semana, nivel, clientes, extras: getExtrasValue() }),
      })
      const data = await res.json()
      if (data.success) {
        // Salva identificador no localStorage para o dashboard verificar
        localStorage.setItem('sinal_nome', identificador)
        localStorage.setItem('sinal_semana', semana)
        setResultado({ parceiro: data.parceiro, versao: data.versao })
        setEstado('sucesso')
      }
    } catch { /* silencioso */ }
    setLoading(false)
  }

  const identificador = apelido.trim() || nome.trim()
  const primeiroNome = identificador.split(' ')[0]
  const podeEnviar = nome.trim().length >= 2 && nivel !== null && (estado === 'novo' || estado === 'editar')
  const mostrarFormulario = estado === 'novo' || estado === 'editar'

  return (
    <main style={{ background: bgPage, minHeight: '100vh' }}
      className="flex items-center justify-center px-6 py-12 relative overflow-hidden transition-colors duration-500">

      {/* Glow */}
      <div className="fixed pointer-events-none rounded-full transition-all duration-1000"
        style={{ width: 800, height: 800, top: -350, right: -300, background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="w-full max-w-[500px] relative z-10">

        {/* TOPBAR — sem switch */}
        <div className="flex items-center justify-between mb-16"
          style={{ animation: 'slideDown 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          <div>
            <span style={{ color: ink }} className="text-[13px] font-bold tracking-[0.16em] uppercase transition-colors duration-500">
              SINAL<span style={{ color: '#A78BFA' }}>.</span>
            </span>
            <p className="text-[9px] font-bold tracking-[0.14em] uppercase mt-1 transition-colors duration-500" style={{ color: ink3 }}>
              Dar o sinal
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide transition-colors duration-500"
            style={{ background: surface, border: `1px solid ${border2}`, color: ink3 }}>
            <span className="w-[5px] h-[5px] rounded-full bg-[#A78BFA] animate-pulse" />
            {semana}
          </div>
        </div>

        {/* SUCESSO */}
        {estado === 'sucesso' && resultado && (
          <div className="flex flex-col items-center text-center gap-5 py-16"
            style={{ animation: 'rise 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-[76px] h-[76px] rounded-full border-[1.5px] flex items-center justify-center text-[1.8rem]"
              style={{ borderColor: L?.color, color: L?.color, animation: 'popIn 0.55s cubic-bezier(0.16,1,0.3,1) both' }}>
              ✦
            </div>
            <div style={{ color: ink }} className="text-[2rem] font-bold tracking-tight">
              Sinal {resultado.versao === 'atualizado' ? 'atualizado.' : 'enviado.'}
            </div>
            <p className="text-[13px] leading-relaxed max-w-[300px]" style={{ color: ink2 }}>
              {resultado.parceiro
                ? `${primeiroNome}, você está no radar esta semana. O time já sabe que pode contar com você.`
                : `${primeiroNome}, sinal registrado. O time sabe que você está com a agenda tomada esta semana.`}
            </p>
            <div className="text-[9px] font-bold tracking-[0.12em] uppercase px-4 py-1.5 rounded-full border"
              style={{ color: L?.color, borderColor: L?.color, background: L?.bg }}>
              {L?.pill} · nível {nivel}
            </div>
            {resultado.versao === 'original' && !edicaoBloqueadaPorData() && (
              <p className="text-[10px] tracking-wide mt-1" style={{ color: inkHint }}>
                Você ainda pode atualizar seu sinal uma vez até quarta-feira.
              </p>
            )}
            <a href="/dashboard"
              className="mt-4 text-[11px] font-bold tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer px-5 py-2.5 rounded-xl border"
              style={{ color: ink3, borderColor: border2, background: surface }}>
              Ver radar da equipe →
            </a>
          </div>
        )}

        {/* FORMULÁRIO */}
        {estado !== 'sucesso' && (
          <>
            {/* NOME */}
            <div className="mb-10" style={{ animation: 'rise 0.55s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
              <p className="text-[9px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: ink3 }}>
                Quem está dando o sinal
              </p>
              <input
                type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="seu nome completo"
                autoComplete="off" spellCheck={false}
                className="w-full bg-transparent border-none outline-none text-[2.8rem] font-bold tracking-[-0.03em] transition-colors duration-500"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: ink, caretColor: '#A78BFA' }}
              />
              <div className="mt-4 h-px" style={{ background: border2 }} />
              {nome.trim().length >= 2 && (
                <div className="mt-3" style={{ animation: 'rise 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                  <input
                    type="text" value={apelido} onChange={e => setApelido(e.target.value)}
                    placeholder="Como quer ser chamado? ex: Ju, Pê, João S."
                    autoComplete="off" spellCheck={false}
                    className="w-full bg-transparent border-none outline-none text-[13px] font-medium transition-colors duration-500"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: ink2, caretColor: '#A78BFA' }}
                  />
                </div>
              )}
            </div>

            {/* BUSCANDO */}
            {estado === 'buscando' && (
              <div className="mb-8 flex items-center gap-3"
                style={{ animation: 'rise 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse flex-shrink-0" />
                <p className="text-[13px] font-semibold" style={{ color: '#A78BFA' }}>
                  Verificando seu sinal desta semana...
                </p>
              </div>
            )}

            {/* BLOQUEADO — já editou */}
            {estado === 'bloqueado' && sinalAtual && (
              <div className="mb-8 rounded-2xl p-5 border"
                style={{ background: LEVELS[sinalAtual.nivel].bg, borderColor: LEVELS[sinalAtual.nivel].color, animation: 'rise 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: LEVELS[sinalAtual.nivel].color }}>
                  Sinal desta semana · edição já utilizada
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[3rem] font-bold leading-none" style={{ color: LEVELS[sinalAtual.nivel].color }}>{sinalAtual.nivel}</span>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: LEVELS[sinalAtual.nivel].color }}>{LEVELS[sinalAtual.nivel].name}</p>
                    <p className="text-[11px] mt-1" style={{ color: ink2 }}>Você já usou sua edição desta semana.</p>
                    <p className="text-[10px] mt-1 font-semibold" style={{ color: LEVELS[sinalAtual.nivel].color }}>Novo ciclo começa na próxima segunda.</p>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUEADO — passou da quarta */}
            {estado === 'bloqueado-data' && sinalAtual && (
              <div className="mb-8 rounded-2xl p-5 border"
                style={{ background: LEVELS[sinalAtual.nivel].bg, borderColor: LEVELS[sinalAtual.nivel].color, animation: 'rise 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: LEVELS[sinalAtual.nivel].color }}>
                  Sinal desta semana · edição encerrada
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[3rem] font-bold leading-none" style={{ color: LEVELS[sinalAtual.nivel].color }}>{sinalAtual.nivel}</span>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: LEVELS[sinalAtual.nivel].color }}>{LEVELS[sinalAtual.nivel].name}</p>
                    <p className="text-[11px] mt-1" style={{ color: ink2 }}>A janela de atualização encerrou na quarta.</p>
                    <p className="text-[10px] mt-1" style={{ color: inkHint }}>Mas você ainda pode ver o radar e pedir ajuda diretamente.</p>
                    <a href="/dashboard" className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase mt-2" style={{ color: LEVELS[sinalAtual.nivel].color }}>Ver radar →</a>
                  </div>
                </div>
              </div>
            )}

            {/* EDIÇÃO DISPONÍVEL */}
            {estado === 'editar' && sinalAtual && (
              <div className="mb-6 rounded-2xl p-5 border"
                style={{ background: LEVELS[sinalAtual.nivel].bg, borderColor: LEVELS[sinalAtual.nivel].color, animation: 'rise 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: LEVELS[sinalAtual.nivel].color }}>
                  Seu sinal desta semana
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[2.8rem] font-bold leading-none" style={{ color: LEVELS[sinalAtual.nivel].color }}>{sinalAtual.nivel}</span>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: LEVELS[sinalAtual.nivel].color }}>{LEVELS[sinalAtual.nivel].name}</p>
                      <p className="text-[11px] mt-1" style={{ color: ink2 }}>O que mudou desde segunda?</p>
                      <p className="text-[10px] mt-0.5" style={{ color: inkHint }}>Entregas, novos jobs, mudanças de cliente — tudo conta.</p>
                    </div>
                  </div>
                  <button onClick={carregarSinalAtual}
                    className="text-[10px] font-bold tracking-[0.08em] uppercase px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer flex-shrink-0"
                    style={{ color: LEVELS[sinalAtual.nivel].color, borderColor: LEVELS[sinalAtual.nivel].color, background: 'transparent' }}>
                    Carregar →
                  </button>
                </div>
              </div>
            )}

            {/* LEVELS */}
            {mostrarFormulario && (
              <>
                <div className="mb-4" style={{ animation: 'rise 0.55s cubic-bezier(0.16,1,0.3,1) 0.25s both' }}>
                  <p className="text-[9px] font-bold tracking-[0.16em] uppercase mb-3" style={{ color: ink3 }}>
                    {estado === 'editar' ? 'O que mudou desde segunda?' : 'Como está sua semana'}
                  </p>
                  <div className="flex gap-[5px] p-[5px] rounded-[18px]"
                    style={{ background: surface, border: `1px solid ${border}` }}>
                    {LEVELS.map((lv) => (
                      <button key={lv.num} onClick={() => selectLevel(lv.num)}
                        className="flex-1 rounded-[13px] py-[18px] px-0.5 text-center cursor-pointer border transition-all duration-[220ms] ease-out"
                        style={{
                          background: nivel === lv.num ? lv.bg : 'transparent',
                          borderColor: nivel === lv.num ? lv.color : 'transparent',
                          color: nivel === lv.num ? lv.color : ink2,
                          transform: nivel === lv.num ? 'translateY(-3px)' : 'translateY(0)',
                          boxShadow: nivel === lv.num ? '0 8px 24px -6px rgba(0,0,0,0.2)' : 'none',
                        }}>
                        <span className="block text-[1.6rem] font-bold leading-none">{lv.num}</span>
                        <span className="block text-[8px] font-bold tracking-[0.07em] uppercase mt-[6px] opacity-70">{lv.label}</span>
                      </button>
                    ))}
                  </div>

                  {nivel !== null && L && (
                    <div className="mt-[10px] rounded-2xl p-5 border flex items-center gap-5"
                      style={{ background: L.bg, borderColor: L.color, animation: 'rise 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
                      <span className="text-[3.5rem] font-bold leading-none flex-shrink-0 w-[60px] text-center" style={{ color: L.color }}>{nivel}</span>
                      <div className="w-px h-10 flex-shrink-0" style={{ background: border2 }} />
                      <div>
                        <p className="text-[13px] font-bold mb-1" style={{ color: L.color }}>{L.name}</p>
                        <p className="text-[11.5px] leading-[1.55]" style={{ color: ink2 }}>{L.desc}</p>
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-bold tracking-[0.1em] uppercase px-[10px] py-[3px] rounded-full border mt-2"
                          style={{ color: L.color, borderColor: L.color, background: L.bg }}>
                          <span className="w-1 h-1 rounded-full bg-current" />{L.pill}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CAMPOS */}
                <div className="grid grid-cols-2 gap-2 mb-5"
                  style={{ animation: 'rise 0.55s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}>
                  <div className="rounded-2xl p-[18px]" style={{ background: surface, border: `1px solid ${border}` }}>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: ink3 }}>
                      Projetos em andamento
                    </p>
                    <p className="text-[9px] mb-2 leading-relaxed" style={{ color: inkHint }}>
                      Formato: [Cliente] job resumido
                    </p>
                    <textarea value={clientes} onChange={e => setClientes(e.target.value)}
                      placeholder={'[Lubrizol] ajuste de banner\n[Infra] moodboard home'}
                      rows={3}
                      className="w-full bg-transparent border-none outline-none text-[12px] font-normal leading-[1.65] resize-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: ink }} />
                  </div>

                  <div className="rounded-2xl p-[18px]" style={{ background: surface, border: `1px solid ${border}` }}>
                    <p className="text-[9px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: ink3 }}>
                      Espaço para extras
                    </p>
                    <p className="text-[9px] mb-2 leading-relaxed" style={{ color: inkHint }}>
                      Selecione ou descreva
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {EXTRAS_OPCOES.map(op => (
                        <button key={op} onClick={() => toggleChip(op)}
                          className="text-[8.5px] font-bold tracking-wide px-2 py-1 rounded-full border transition-all duration-200 cursor-pointer"
                          style={{
                            background: extrasChips.includes(op) ? '#8B5CF6' : 'transparent',
                            borderColor: extrasChips.includes(op) ? '#8B5CF6' : border2,
                            color: extrasChips.includes(op) ? 'white' : inkHint,
                          }}>
                          {op}
                        </button>
                      ))}
                    </div>
                    <textarea value={extras} onChange={e => setExtras(e.target.value)}
                      placeholder="outro..."
                      rows={2}
                      className="w-full bg-transparent border-none outline-none text-[12px] font-normal leading-[1.65] resize-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: ink }} />
                  </div>
                </div>

                {/* SUBMIT */}
                <div style={{ animation: 'rise 0.55s cubic-bezier(0.16,1,0.3,1) 0.43s both' }}>
                  <button onClick={handleSubmit} disabled={!podeEnviar || loading}
                    className="w-full rounded-2xl px-6 py-[18px] flex items-center justify-between relative overflow-hidden group transition-all duration-300"
                    style={{
                      background: '#8B5CF6',
                      opacity: podeEnviar && !loading ? 1 : 0.2,
                      cursor: podeEnviar && !loading ? 'pointer' : 'not-allowed',
                    }}>
                    <span className="text-[14px] font-bold tracking-[0.05em] text-white relative z-10">
                      {loading ? 'Enviando...' : estado === 'editar' ? 'Atualizar o sinal' : 'Dar o sinal'}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[16px] text-white transition-transform duration-300 group-hover:rotate-45 relative z-10">↗</div>
                  </button>
                  <p className="mt-3 text-[9.5px] text-center leading-[1.8]" style={{ color: inkHint }}>
                    Ferramenta de uso voluntário entre prestadores de serviço independentes.<br />
                    Não constitui controle de jornada, registro de ponto ou reconhecimento de vínculo empregatício.
                  </p>
                </div>
              </>
            )}

            {/* IDLE */}
            {estado === 'idle' && (
              <div className="text-center py-8" style={{ animation: 'rise 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <p className="text-[11px] font-medium" style={{ color: inkHint }}>
                  Digite seu nome para começar
                </p>
              </div>
            )}
          </>
        )}

        {/* RODAPÉ — switch de tema aqui */}
        <div className="flex items-center justify-between mt-12 pt-5"
          style={{ borderTop: `1px solid ${border}` }}>
          <a href="/dashboard"
            className="text-[10px] font-bold tracking-[0.1em] uppercase transition-colors duration-200"
            style={{ color: inkHint }}>
            Radar da equipe →
          </a>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Space Grotesk', sans-serif; }
        input::placeholder { color: ${inkPlaceholder}; }
        textarea::placeholder { color: ${inkPlaceholder}; }
        @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.5) rotate(-60deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
      `}</style>
    </main>
  )
}
