import { NextResponse } from "next/server"

export type ViaCEPResponse = {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

export async function GET(_request: Request, { params }: { params: Promise<{ cep: string }> }) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${(await params).cep}/json/`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar CEP" }, { status: 500 })
  }
}