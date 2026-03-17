import { NextResponse } from "next/server"

export type Currency = {
  [key: string]: {
    code: string
    codein: string
    name: string
    high: string
    low: string
    varBid: string
    pctChange: string
    bid: string
    ask: string
    timestamp: string
    create_date: string
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ currencies: string }> }) {
  try {
    const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${(await params).currencies}`)
    const data = await response.json()
    return NextResponse.json(data as Currency)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar moedas" }, { status: 500 })
  }
}