import { NextResponse } from 'next/server'
import { getSheetsClient, SPREADSHEET_ID, SHEET_NAME } from '@/lib/sheets'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nome = searchParams.get('nome')
    const semana = searchParams.get('semana')

    const sheets = await getSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J`,
    })

    const rows = response.data.values || []

    const dados = rows.map((row) => ({
      id: row[0],
      nome: row[1],
      semana: row[2],
      nivel: Number(row[3]),
      clientes: row[4] || '',
      extras: row[5] || '',
      data: row[6],
      hora: row[7],
      parceiro: row[8] === 'sim',
      versao: row[9] || 'original',
    }))

    // Se buscando sinal específico por nome+semana
    if (nome && semana) {
      const registros = dados.filter(
        (r) =>
          r.nome?.toLowerCase().trim() === nome.toLowerCase().trim() &&
          r.semana === semana
      )

      // Pegar o mais recente
      const ultimo = registros[registros.length - 1] || null
      const totalRegistros = registros.length
      const podeEditar = totalRegistros === 1 // só pode editar se tem exatamente 1

      return NextResponse.json({
        sinalExistente: ultimo,
        totalRegistros,
        podeEditar,
      })
    }

    // Retornar todos os dados (para dashboard)
    // Pegar apenas o registro mais recente por nome+semana
    const mapaUltimos: Record<string, typeof dados[0]> = {}
    dados.forEach((r) => {
      const chave = `${r.nome?.toLowerCase().trim()}-${r.semana}`
      mapaUltimos[chave] = r // sobrescreve, ficando com o mais recente
    })

    return NextResponse.json(Object.values(mapaUltimos).reverse())
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
