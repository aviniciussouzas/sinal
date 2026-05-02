// seed.mjs — popula a planilha com dados de teste
// Rodar com: node seed.mjs

import { google } from 'googleapis'
import { readFileSync } from 'fs'

// Lê .env.local manualmente — sem depender do dotenv
try {
  const envFile = readFileSync('.env.local', 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx === -1) return
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1')
    process.env[key] = val
  })
} catch {
  console.error('❌ Não encontrei o arquivo .env.local na pasta raiz do projeto.')
  process.exit(1)
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID
const SHEET_NAME = 'Página1'

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
  return google.sheets({ version: 'v4', auth })
}

function getWeekStr(offsetWeeks = 0) {
  const now = new Date()
  now.setDate(now.getDate() - offsetWeeks * 7)
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now); mon.setDate(now.getDate() + diff)
  const fri = new Date(mon); fri.setDate(mon.getDate() + 4)
  const fmt = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${fmt(mon)} – ${fmt(fri)}/${fri.getFullYear()}`
}

function getMonday(offsetWeeks = 0) {
  const now = new Date()
  now.setDate(now.getDate() - offsetWeeks * 7)
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now); mon.setDate(now.getDate() + diff)
  return `${String(mon.getDate()).padStart(2, '0')}/${String(mon.getMonth() + 1).padStart(2, '0')}/${mon.getFullYear()}`
}

const DESIGNERS = [
  'Ju', 'Pê', 'Dri', 'João', 'Carol', 'Rê', 'Gabi', 'Thi', 'Fê', 'Gu',
]

const CLIENTES_POOL = [
  '[Lubrizol] ajuste de banner',
  '[Infra] moodboard home',
  '[Mega] lançamento campanha',
  '[XYZ] apresentação institucional',
  '[Cliente A] revisão de peças',
  '[Bradesco] material de treinamento',
  '[Natura] campanha verão',
  '[iFood] redesign de cards',
  '[Nubank] onboarding flow',
  '[Magazine] campanha especial',
]

const EXTRAS_POOL = [
  'Ajuste simples', 'Ajuste carrossel', 'Troca de imagem',
  'Ajuste de vídeo', 'Criação de moodboard', 'Apresentação', 'BV institucional',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function randomClientes(nivel) {
  const count = nivel === 0 ? 0 : nivel <= 2 ? 1 : nivel <= 4 ? 2 : 3
  return [...CLIENTES_POOL].sort(() => Math.random() - 0.5).slice(0, count).join('\n')
}

function randomExtras(nivel) {
  if (nivel >= 4) return ''
  if (nivel === 3) return Math.random() > 0.5 ? '' : pick(EXTRAS_POOL)
  const count = nivel <= 1 ? 2 : 1
  return [...EXTRAS_POOL].sort(() => Math.random() - 0.5).slice(0, count).join(' · ')
}

function randomHora() {
  const h = 8 + Math.floor(Math.random() * 3)
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0')
  return `0${h}:${m}`
}

function makeId() {
  return Date.now().toString() + Math.floor(Math.random() * 9999).toString().padStart(4, '0')
}

// Dados de teste — 4 semanas
const SEMANAS_CONFIG = [
  {
    offset: 0,
    label: 'semana atual',
    entradas: [
      { designer: 'Ju',   nivel: 0 },
      { designer: 'Pê',   nivel: 1 },
      { designer: 'Dri',  nivel: 2 },
      { designer: 'João', nivel: 3 },
      { designer: 'Carol',nivel: 4 },
      { designer: 'Rê',   nivel: 2, originalNivel: 4 }, // atualizou
      { designer: 'Gabi', nivel: 5 },
      { designer: 'Thi',  nivel: 1 },
    ]
  },
  {
    offset: 1,
    label: 'semana passada — todo mundo lotado',
    entradas: [
      { designer: 'Ju',   nivel: 3 },
      { designer: 'Pê',   nivel: 4 },
      { designer: 'Dri',  nivel: 5 },
      { designer: 'João', nivel: 4 },
      { designer: 'Carol',nivel: 3 },
      { designer: 'Rê',   nivel: 5 },
      { designer: 'Gabi', nivel: 4 },
      { designer: 'Thi',  nivel: 3 },
      { designer: 'Fê',   nivel: 4 },
    ]
  },
  {
    offset: 2,
    label: '2 semanas atrás — semana tranquila',
    entradas: [
      { designer: 'Ju',   nivel: 0 },
      { designer: 'Pê',   nivel: 0 },
      { designer: 'Dri',  nivel: 1 },
      { designer: 'João', nivel: 2 },
      { designer: 'Carol',nivel: 1 },
      { designer: 'Rê',   nivel: 0 },
      { designer: 'Gabi', nivel: 2 },
      { designer: 'Thi',  nivel: 1 },
      { designer: 'Fê',   nivel: 2 },
      { designer: 'Gu',   nivel: 0 },
    ]
  },
  {
    offset: 3,
    label: '3 semanas atrás — mix',
    entradas: [
      { designer: 'Ju',   nivel: 2 },
      { designer: 'Pê',   nivel: 3 },
      { designer: 'Dri',  nivel: 1 },
      { designer: 'João', nivel: 4 },
      { designer: 'Carol',nivel: 2 },
      { designer: 'Rê',   nivel: 3 },
      { designer: 'Gabi', nivel: 1 },
    ]
  },
]

async function seed() {
  console.log('🌱 Iniciando seed da planilha SINAL.\n')

  const sheets = await getSheetsClient()

  // Limpa dados existentes mantendo cabeçalho
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:J`,
  })
  console.log('✓ Dados anteriores removidos\n')

  const rows = []

  for (const config of SEMANAS_CONFIG) {
    const semana = getWeekStr(config.offset)
    const data = getMonday(config.offset)
    console.log(`📅 ${semana} — ${config.label}`)

    for (const entrada of config.entradas) {
      const { designer, nivel, originalNivel } = entrada
      const parceiro = nivel <= 2 ? 'sim' : 'não'

      // Se foi atualizado, insere primeiro o registro original
      if (originalNivel !== undefined) {
        const parcOriginal = originalNivel <= 2 ? 'sim' : 'não'
        rows.push([
          makeId(),
          designer,
          semana,
          originalNivel,
          randomClientes(originalNivel),
          '',
          data,
          '08:47',
          parcOriginal,
          'original',
        ])
        console.log(`  → ${designer} · nível ${originalNivel} (original) → depois atualizou para ${nivel}`)
      }

      rows.push([
        makeId(),
        designer,
        semana,
        nivel,
        randomClientes(nivel),
        randomExtras(nivel),
        data,
        originalNivel !== undefined ? '11:23' : randomHora(),
        parceiro,
        originalNivel !== undefined ? 'atualizado' : 'original',
      ])

      if (originalNivel === undefined) {
        console.log(`  → ${designer} · nível ${nivel} · ${parceiro === 'sim' ? 'parceiro' : 'ocupado'}`)
      }
    }
    console.log('')
  }

  // Insere tudo
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:J`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  })

  console.log(`✅ ${rows.length} registros inseridos!\n`)
  console.log('📊 Resumo:')
  console.log(`  · Semana atual: ${getWeekStr(0)}`)
  console.log(`  · Parceiros da semana: Ju (nível 0) e Pê (nível 1)`)
  console.log(`  · Rê atualizou de 4 para 2 — badge "atualizado" no card`)
  console.log(`  · Semana passada ativa o banner de equipe no limite`)
  console.log(`  · 4 semanas de histórico para testar o accordion`)
  console.log('\n🚀 Abre o dashboard — você vai ver a malha em ação!')
}

seed().catch(err => {
  console.error('❌ Erro ao executar seed:', err.message)
  process.exit(1)
})
