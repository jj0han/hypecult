import { NextResponse } from "next/server"

export type State = {
  id: number
  nome: string
  sigla: string
  regiao: {
    id: number
    nome: string
    sigla: string
  }
}

export async function GET() {
  try {
    const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
    const data = await response.json()
    return NextResponse.json(data as State[])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar estados" }, { status: 500 })
  }
}