import { NextResponse } from "next/server"
import type { State } from "../../route";

export type City ={
  id: number
  nome: string;
  microrregiao: {
    id: number
    nome: string
    mesorregiao: {
      id: number
      nome: string
      UF: State
    }
  };
  "regiao-imediata": {
    id: number
    nome: string
    "regiao-intermediaria": {
      id: number
      nome: string
      UF: State
    }
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ uf: string }> }) {
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${(await params).uf}/municipios`)
    const data = await response.json()
    return NextResponse.json(data as City[])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar municípios" }, { status: 500 })
  }
}