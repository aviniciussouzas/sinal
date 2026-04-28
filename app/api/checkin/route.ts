import { NextResponse } from 'next/server'
import { getSheetsClient, SPREADSHEET_ID, SHEET_NAME } from '@/lib/sheets'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, semana, nivel, clientes, extras } = body

    if (!nome || nivel === undefined || nivel === null) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const sheets = await getSheetsClient()

    // Buscar registros existentes da semana para este nome
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J`,
    })

    const rows = existing.data.values || []
    const registrosDaSemana = rows
      .map((row, index) => ({ row, index: index + 2 }))
      .filter(({ row }) =>
        row[1]?.toLowerCase().trim() === nome.toLowerCase().trim() &&
        row[2] === semana
      )

    const totalRegistros = registrosDaSemana.length

    // Bloquear se já tiver 2 registros (sinal original + 1 edição)
    if (totalRegistros >= 2) {
      return NextResponse.json({
        error: 'limite',
        message: 'Você já usou sua edição desta semana. Novo sinal disponível na próxima segunda.',
      }, { status: 409 })
    }

    const agora = new Date()
    const data = agora.toLocaleDateString('pt-BR')
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const id = Date.now().toString()
    const parceiro = nivel <= 2 ? 'sim' : 'não'
    const versao = totalRegistros === 0 ? 'original' : 'atualizado'

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, nome, semana, nivel, clientes, extras, data, hora, parceiro, versao]],
      },
    })

    return NextResponse.json({
      success: true,
      parceiro: nivel <= 2,
      versao,
      edicaoDisponivel: totalRegistros === 0, // ainda tem 1 edição disponível
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}
