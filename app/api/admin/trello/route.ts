import { NextRequest, NextResponse } from "next/server"

interface TrelloCheckItem {
  id: string
  name: string
  state: "complete" | "incomplete"
  pos?: number
}

interface TrelloChecklist {
  id: string
  idCard: string
  name: string
  checkItems: TrelloCheckItem[]
}

interface TrelloLabel {
  id: string
  idBoard: string
  name: string
  color: string
}

interface TrelloMember {
  id: string
  fullName: string
  username: string
  avatarUrl?: string | null
}

interface TrelloCard {
  id: string
  name: string
  desc: string
  pos: number
  due: string | null
  dueComplete: boolean
  idList: string
  idMembers: string[]
  labels: TrelloLabel[]
  shortUrl: string
  url: string
  idChecklists?: string[]
  checklists?: TrelloChecklist[]
  dateLastActivity?: string
}

interface TrelloList {
  id: string
  name: string
  pos: number
  closed: boolean
}

interface TrelloBoardData {
  id: string
  name: string
  desc: string
  url: string
  shortUrl: string
  prefs?: {
    background?: string
    backgroundColor?: string
    backgroundImage?: string
  }
  lists: TrelloList[]
  cards: TrelloCard[]
  labels: TrelloLabel[]
  members: TrelloMember[]
  checklists: TrelloChecklist[]
}

// Fallback initial dataset for 🔥 Vibecode board in preview/offline mode
const INITIAL_VIBECODE_BOARD: TrelloBoardData = {
  id: "ZePjZue7",
  name: "🔥 Vibecode",
  desc: "Tablero oficial de desarrollo y roadmap para Vibecode",
  url: "https://trello.com/b/ZePjZue7/%F0%9F%94%A5-vibecode",
  shortUrl: "https://trello.com/b/ZePjZue7",
  lists: [
    { id: "list-backlog", name: "💡 Backlog / Ideas", pos: 1000, closed: false },
    { id: "list-todo", name: "📋 Por Hacer", pos: 2000, closed: false },
    { id: "list-progress", name: "⚡ En Progreso", pos: 3000, closed: false },
    { id: "list-review", name: "🔍 En Revisión / QA", pos: 4000, closed: false },
    { id: "list-done", name: "✅ Completado / Lanzado", pos: 5000, closed: false },
  ],
  labels: [
    { id: "lbl-core", idBoard: "ZePjZue7", name: "Core Engine", color: "purple" },
    { id: "lbl-ai", idBoard: "ZePjZue7", name: "AI & LLM", color: "green" },
    { id: "lbl-payment", idBoard: "ZePjZue7", name: "Pasarelas & Pagos", color: "blue" },
    { id: "lbl-marketing", idBoard: "ZePjZue7", name: "Marketing & Growth", color: "orange" },
    { id: "lbl-high", idBoard: "ZePjZue7", name: "Alta Prioridad", color: "red" },
    { id: "lbl-security", idBoard: "ZePjZue7", name: "Seguridad & Auth", color: "yellow" },
  ],
  members: [
    { id: "mem-1", fullName: "Astro", username: "astro_vibecode", avatarUrl: null },
    { id: "mem-2", fullName: "Admin Vibecode", username: "admin_vibe", avatarUrl: null },
  ],
  checklists: [
    {
      id: "chk-1",
      idCard: "card-1",
      name: "Checklist de Integración",
      checkItems: [
        { id: "item-1", name: "API Key de Trello", state: "complete" },
        { id: "item-2", name: "Token de Usuario generado", state: "complete" },
        { id: "item-3", name: "Tablero interactivo sincronizado", state: "complete" },
      ],
    },
    {
      id: "chk-2",
      idCard: "card-2",
      name: "Pasarelas de Pago",
      checkItems: [
        { id: "item-2-1", name: "MercadoPago Webhook Test", state: "complete" },
        { id: "item-2-2", name: "Flow Webhook Test", state: "complete" },
        { id: "item-2-3", name: "Transbank Webpay Plus", state: "incomplete" },
      ],
    },
  ],
  cards: [
    {
      id: "card-1",
      name: "Conexión en Tiempo Real Trello API",
      desc: "Integrar el tablero 🔥 Vibecode directamente en el panel de administración con soporte de lectura y escritura bidireccional.",
      pos: 1000,
      due: "2026-09-20T18:00:00.000Z",
      dueComplete: true,
      idList: "list-done",
      idMembers: ["mem-1"],
      labels: [
        { id: "lbl-core", idBoard: "ZePjZue7", name: "Core Engine", color: "purple" },
        { id: "lbl-high", idBoard: "ZePjZue7", name: "Alta Prioridad", color: "red" },
      ],
      shortUrl: "https://trello.com/c/sample1",
      url: "https://trello.com/c/sample1",
      idChecklists: ["chk-1"],
    },
    {
      id: "card-2",
      name: "Auditoría de Pasarelas de Pago Multimoneda",
      desc: "Comprobar el flujo completo de checkout para MercadoPago, Flow y Transferencias bancarias con envío automático de comprobante.",
      pos: 1000,
      due: "2026-09-25T12:00:00.000Z",
      dueComplete: false,
      idList: "list-progress",
      idMembers: ["mem-1"],
      labels: [
        { id: "lbl-payment", idBoard: "ZePjZue7", name: "Pasarelas & Pagos", color: "blue" },
        { id: "lbl-high", idBoard: "ZePjZue7", name: "Alta Prioridad", color: "red" },
      ],
      shortUrl: "https://trello.com/c/sample2",
      url: "https://trello.com/c/sample2",
      idChecklists: ["chk-2"],
    },
    {
      id: "card-3",
      name: "Automatización de Cupos Dinámicos Vibecode",
      desc: "Monitoreo en tiempo real del límite de cupos para la fase de prelanzamiento y activación del contador regresivo.",
      pos: 1000,
      due: "2026-09-28T23:59:00.000Z",
      dueComplete: false,
      idList: "list-todo",
      idMembers: ["mem-2"],
      labels: [
        { id: "lbl-marketing", idBoard: "ZePjZue7", name: "Marketing & Growth", color: "orange" },
      ],
      shortUrl: "https://trello.com/c/sample3",
      url: "https://trello.com/c/sample3",
    },
    {
      id: "card-4",
      name: "Módulo de DeepLinks con Atribución de Ventas",
      desc: "Generar enlaces únicos para afiliados y campañas en Instagram con tracking de referidos.",
      pos: 2000,
      due: null,
      dueComplete: false,
      idList: "list-todo",
      idMembers: [],
      labels: [
        { id: "lbl-marketing", idBoard: "ZePjZue7", name: "Marketing & Growth", color: "orange" },
      ],
      shortUrl: "https://trello.com/c/sample4",
      url: "https://trello.com/c/sample4",
    },
    {
      id: "card-5",
      name: "Agente IA Evaluador de Arquitecturas",
      desc: "Permitir a los alumnos someter sus esquemas de base de datos a un agente DeepSeek/Gemini para auditoría de seguridad.",
      pos: 1000,
      due: null,
      dueComplete: false,
      idList: "list-backlog",
      idMembers: ["mem-1"],
      labels: [
        { id: "lbl-ai", idBoard: "ZePjZue7", name: "AI & LLM", color: "green" },
      ],
      shortUrl: "https://trello.com/c/sample5",
      url: "https://trello.com/c/sample5",
    },
  ],
}

function resolveCredentials(req: NextRequest) {
  const queryKey = req.nextUrl.searchParams.get("apiKey")
  const queryToken = req.nextUrl.searchParams.get("token")
  const headerKey = req.headers.get("x-trello-key")
  const headerToken = req.headers.get("x-trello-token")

  const apiKey = queryKey || headerKey || process.env.TRELLO_API_KEY || process.env.NEXT_PUBLIC_TRELLO_API_KEY || ""
  const token = queryToken || headerToken || process.env.TRELLO_TOKEN || process.env.NEXT_PUBLIC_TRELLO_TOKEN || ""

  return { apiKey: apiKey.trim(), token: token.trim() }
}

function extractBoardId(raw: string): string {
  if (!raw) return "ZePjZue7"
  const match = raw.match(/trello\.com\/b\/([a-zA-Z0-9]+)/)
  if (match && match[1]) return match[1]
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").trim() || "ZePjZue7"
}

export async function GET(req: NextRequest) {
  try {
    const rawBoardId = req.nextUrl.searchParams.get("boardId") || "ZePjZue7"
    const boardId = extractBoardId(rawBoardId)
    const { apiKey, token } = resolveCredentials(req)

    // If no credentials provided, return initial fallback board data with flag
    if (!apiKey || !token) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        source: "preview",
        message: "No se encontraron credenciales de Trello (API Key / Token). Mostrando tablero en modo local preview.",
        data: INITIAL_VIBECODE_BOARD,
      })
    }

    // Call Trello REST API
    const trelloUrl = `https://api.trello.com/1/boards/${encodeURIComponent(boardId)}?cards=open&card_fields=all&lists=open&list_fields=all&checklists=all&labels=all&members=all&fields=name,desc,url,shortUrl,prefs&key=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}`

    const res = await fetch(trelloUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const errorText = await res.text()
      let parsedError = errorText
      try {
        const jsonErr = JSON.parse(errorText)
        parsedError = jsonErr.message || errorText
      } catch {}

      return NextResponse.json({
        success: false,
        authenticated: false,
        source: "trello_error",
        status: res.status,
        message: `Error de Trello (${res.status} ${res.statusText}): ${parsedError}`,
        data: INITIAL_VIBECODE_BOARD,
      }, { status: 200 }) // Return 200 with error info so client can display clear feedback
    }

    const trelloData = await res.json()

    // Normalize lists, cards, checklists, labels, members
    const checklistsMap: Record<string, TrelloChecklist> = {}
    if (Array.isArray(trelloData.checklists)) {
      trelloData.checklists.forEach((chk: any) => {
        checklistsMap[chk.id] = {
          id: chk.id,
          idCard: chk.idCard,
          name: chk.name,
          checkItems: (chk.checkItems || []).map((ci: any) => ({
            id: ci.id,
            name: ci.name,
            state: ci.state,
            pos: ci.pos,
          })),
        }
      })
    }

    const cards: TrelloCard[] = (trelloData.cards || []).map((c: any) => {
      const cardChecklists = (c.idChecklists || []).map((id: string) => checklistsMap[id]).filter(Boolean)
      return {
        id: c.id,
        name: c.name,
        desc: c.desc || "",
        pos: c.pos,
        due: c.due || null,
        dueComplete: Boolean(c.dueComplete),
        idList: c.idList,
        idMembers: c.idMembers || [],
        labels: (c.labels || []).map((l: any) => ({
          id: l.id,
          idBoard: l.idBoard,
          name: l.name || "",
          color: l.color || "sky",
        })),
        shortUrl: c.shortUrl || `https://trello.com/c/${c.id}`,
        url: c.url || `https://trello.com/c/${c.id}`,
        idChecklists: c.idChecklists || [],
        checklists: cardChecklists,
        dateLastActivity: c.dateLastActivity,
      }
    })

    const lists: TrelloList[] = (trelloData.lists || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      pos: l.pos,
      closed: Boolean(l.closed),
    }))

    const labels: TrelloLabel[] = (trelloData.labels || []).map((l: any) => ({
      id: l.id,
      idBoard: l.idBoard,
      name: l.name || "",
      color: l.color || "sky",
    }))

    const members: TrelloMember[] = (trelloData.members || []).map((m: any) => ({
      id: m.id,
      fullName: m.fullName || m.username,
      username: m.username,
      avatarUrl: m.avatarUrl || null,
    }))

    const boardData: TrelloBoardData = {
      id: trelloData.id,
      name: trelloData.name || "🔥 Vibecode",
      desc: trelloData.desc || "",
      url: trelloData.url || `https://trello.com/b/${boardId}`,
      shortUrl: trelloData.shortUrl || `https://trello.com/b/${boardId}`,
      prefs: trelloData.prefs,
      lists,
      cards,
      labels,
      members,
      checklists: Object.values(checklistsMap),
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      source: "trello_api",
      data: boardData,
    })
  } catch (error: any) {
    console.error("[Trello API Route Error]:", error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      source: "error",
      message: error?.message || "Error interno al conectar con Trello",
      data: INITIAL_VIBECODE_BOARD,
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, payload, apiKey: customKey, token: customToken } = body

    const { apiKey: envKey, token: envToken } = resolveCredentials(req)
    const apiKey = (customKey || envKey || "").trim()
    const token = (customToken || envToken || "").trim()

    if (!apiKey || !token) {
      return NextResponse.json({
        success: false,
        message: "Se requiere API Key y Token de Trello para realizar modificaciones en el tablero.",
      }, { status: 400 })
    }

    const authQuery = `key=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}`

    switch (action) {
      case "create-card": {
        const { idList, name, desc, due, idLabels } = payload
        if (!idList || !name) {
          return NextResponse.json({ success: false, message: "Falta idList o nombre de tarjeta" }, { status: 400 })
        }

        const params = new URLSearchParams({
          idList,
          name,
          desc: desc || "",
          pos: "bottom",
          key: apiKey,
          token: token,
        })
        if (due) params.append("due", due)
        if (idLabels && Array.isArray(idLabels) && idLabels.length > 0) {
          params.append("idLabels", idLabels.join(","))
        }

        const res = await fetch(`https://api.trello.com/1/cards?${params.toString()}`, {
          method: "POST",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json({ success: false, message: `Error Trello: ${err}` }, { status: res.status })
        }

        const newCard = await res.json()
        return NextResponse.json({ success: true, card: newCard })
      }

      case "move-card": {
        const { cardId, idList, pos } = payload
        if (!cardId || !idList) {
          return NextResponse.json({ success: false, message: "Falta cardId o idList" }, { status: 400 })
        }

        const params = new URLSearchParams({
          idList,
          key: apiKey,
          token: token,
        })
        if (pos !== undefined) params.append("pos", String(pos))

        const res = await fetch(`https://api.trello.com/1/cards/${encodeURIComponent(cardId)}?${params.toString()}`, {
          method: "PUT",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json({ success: false, message: `Error Trello: ${err}` }, { status: res.status })
        }

        const updatedCard = await res.json()
        return NextResponse.json({ success: true, card: updatedCard })
      }

      case "update-card": {
        const { cardId, name, desc, due, dueComplete, idList } = payload
        if (!cardId) {
          return NextResponse.json({ success: false, message: "Falta cardId" }, { status: 400 })
        }

        const params = new URLSearchParams({
          key: apiKey,
          token: token,
        })
        if (name !== undefined) params.append("name", name)
        if (desc !== undefined) params.append("desc", desc)
        if (due !== undefined) params.append("due", due || "")
        if (dueComplete !== undefined) params.append("dueComplete", String(dueComplete))
        if (idList !== undefined) params.append("idList", idList)

        const res = await fetch(`https://api.trello.com/1/cards/${encodeURIComponent(cardId)}?${params.toString()}`, {
          method: "PUT",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json({ success: false, message: `Error Trello: ${err}` }, { status: res.status })
        }

        const updatedCard = await res.json()
        return NextResponse.json({ success: true, card: updatedCard })
      }

      case "toggle-checkitem": {
        const { cardId, checkItemId, state } = payload
        if (!cardId || !checkItemId || !state) {
          return NextResponse.json({ success: false, message: "Faltan parámetros de checkItem" }, { status: 400 })
        }

        const res = await fetch(
          `https://api.trello.com/1/cards/${encodeURIComponent(cardId)}/checkItem/${encodeURIComponent(checkItemId)}?state=${encodeURIComponent(state)}&${authQuery}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json({ success: false, message: `Error Trello: ${err}` }, { status: res.status })
        }

        const updatedItem = await res.json()
        return NextResponse.json({ success: true, item: updatedItem })
      }

      case "create-checklist-item": {
        const { checklistId, name } = payload
        if (!checklistId || !name) {
          return NextResponse.json({ success: false, message: "Falta checklistId o name" }, { status: 400 })
        }

        const params = new URLSearchParams({
          name,
          key: apiKey,
          token: token,
        })

        const res = await fetch(`https://api.trello.com/1/checklists/${encodeURIComponent(checklistId)}/checkItems?${params.toString()}`, {
          method: "POST",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json({ success: false, message: `Error Trello: ${err}` }, { status: res.status })
        }

        const newItem = await res.json()
        return NextResponse.json({ success: true, item: newItem })
      }

      case "delete-card": {
        const { cardId } = payload
        if (!cardId) {
          return NextResponse.json({ success: false, message: "Falta cardId" }, { status: 400 })
        }

        const res = await fetch(`https://api.trello.com/1/cards/${encodeURIComponent(cardId)}?${authQuery}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json({ success: false, message: `Error Trello: ${err}` }, { status: res.status })
        }

        return NextResponse.json({ success: true, message: "Tarjeta eliminada" })
      }

      default:
        return NextResponse.json({ success: false, message: `Acción '${action}' no reconocida` }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[Trello API Action Error]:", error)
    return NextResponse.json({
      success: false,
      message: error?.message || "Error al procesar acción de Trello",
    }, { status: 500 })
  }
}
