"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Kanban,
  Plus,
  RefreshCw,
  ExternalLink,
  Key,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Flame,
  Layers,
  AlertTriangle,
  Info,
  Sliders,
  Check,
  LayoutGrid,
  List as ListIcon,
  Globe,
  Lock,
  Sparkles,
  ChevronRight,
  X,
  User as UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { format, parseISO, isPast, isToday } from "date-fns"
import { es } from "date-fns/locale"

// ---- Types ----
export interface TrelloCheckItem {
  id: string
  name: string
  state: "complete" | "incomplete"
  pos?: number
}

export interface TrelloChecklist {
  id: string
  idCard: string
  name: string
  checkItems: TrelloCheckItem[]
}

export interface TrelloLabel {
  id: string
  idBoard?: string
  name: string
  color: string
}

export interface TrelloMember {
  id: string
  fullName: string
  username: string
  avatarUrl?: string | null
}

export interface TrelloCard {
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

export interface TrelloList {
  id: string
  name: string
  pos: number
  closed: boolean
}

export interface TrelloBoardData {
  id: string
  name: string
  desc: string
  url: string
  shortUrl: string
  lists: TrelloList[]
  cards: TrelloCard[]
  labels: TrelloLabel[]
  members: TrelloMember[]
  checklists: TrelloChecklist[]
}

interface AdminTrelloTabProps {
  defaultBoardId?: string
}

const TRELLO_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  green: { bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-700/50", dot: "bg-emerald-400" },
  yellow: { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-700/50", dot: "bg-amber-400" },
  orange: { bg: "bg-orange-950/60", text: "text-orange-300", border: "border-orange-700/50", dot: "bg-orange-400" },
  red: { bg: "bg-rose-950/60", text: "text-rose-300", border: "border-rose-700/50", dot: "bg-rose-400" },
  purple: { bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-700/50", dot: "bg-purple-400" },
  blue: { bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-700/50", dot: "bg-blue-400" },
  sky: { bg: "bg-sky-950/60", text: "text-sky-300", border: "border-sky-700/50", dot: "bg-sky-400" },
  lime: { bg: "bg-lime-950/60", text: "text-lime-300", border: "border-lime-700/50", dot: "bg-lime-400" },
  pink: { bg: "bg-pink-950/60", text: "text-pink-300", border: "border-pink-700/50", dot: "bg-pink-400" },
  black: { bg: "bg-zinc-900", text: "text-zinc-300", border: "border-zinc-700", dot: "bg-zinc-400" },
}

const DEFAULT_BOARD_URL = "https://trello.com/b/ZePjZue7/%F0%9F%94%A5-vibecode"

export default function AdminTrelloTab({ defaultBoardId = "ZePjZue7" }: AdminTrelloTabProps) {
  const [boardData, setBoardData] = useState<TrelloBoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [connectionSource, setConnectionSource] = useState<"trello_api" | "preview" | "error">("preview")
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null)

  // Auth / Connection settings state
  const [apiKey, setApiKey] = useState("")
  const [token, setToken] = useState("")
  const [boardId, setBoardId] = useState(defaultBoardId)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [modalTestError, setModalTestError] = useState<string | null>(null)

  // UI Filter / View states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "embed">("kanban")

  // Card modal states
  const [selectedCard, setSelectedCard] = useState<TrelloCard | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createListId, setCreateListId] = useState<string>("")
  const [newCardName, setNewCardName] = useState("")
  const [newCardDesc, setNewCardDesc] = useState("")
  const [newCardDue, setNewCardDue] = useState("")
  const [newCardLabels, setNewCardLabels] = useState<string[]>([])
  const [newChecklistText, setNewChecklistText] = useState("")
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Drag and drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [dragOverListId, setDragOverListId] = useState<string | null>(null)

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const savedCreds = localStorage.getItem("vibecode_trello_creds")
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds)
        if (parsed.apiKey) setApiKey(parsed.apiKey)
        if (parsed.token) setToken(parsed.token)
        if (parsed.boardId) setBoardId(parsed.boardId)
      }
    } catch (e) {
      console.warn("Could not read credentials from localStorage", e)
    }
  }, [])

  // Fetch Board Data
  const fetchBoard = useCallback(async (customKey?: string, customTok?: string, customBId?: string) => {
    const k = customKey !== undefined ? customKey : apiKey
    const t = customTok !== undefined ? customTok : token
    const b = customBId !== undefined ? customBId : boardId

    setSyncing(true)
    try {
      const params = new URLSearchParams()
      params.append("boardId", b || defaultBoardId)
      if (k) params.append("apiKey", k)
      if (t) params.append("token", t)

      const res = await fetch(`/api/admin/trello?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      const result = await res.json()

      if (result.success) {
        setBoardData(result.data)
        setConnectionSource(result.source || (result.authenticated ? "trello_api" : "preview"))
        setAuthErrorMessage(result.source === "trello_error" ? result.message : null)
        setLastSynced(new Date())

        if (result.authenticated) {
          // If we have selected card open, update it
          if (selectedCard) {
            const updated = result.data.cards?.find((c: TrelloCard) => c.id === selectedCard.id)
            if (updated) setSelectedCard(updated)
          }
        }
      } else {
        setConnectionSource("error")
        setAuthErrorMessage(result.message || "Error al cargar tablero")
        if (result.data) setBoardData(result.data)
      }
    } catch (err: any) {
      console.error("Error fetching trello board:", err)
      setConnectionSource("error")
      setAuthErrorMessage(err.message || "Error de red al conectar")
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [apiKey, token, boardId, defaultBoardId, selectedCard])

  // Initial fetch
  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  // Save credentials directly
  const saveAndApply = (dataToSave: any, newBoardData?: any) => {
    localStorage.setItem("vibecode_trello_creds", JSON.stringify(dataToSave))
    if (newBoardData) setBoardData(newBoardData)
    setConnectionSource("trello_api")
    setAuthErrorMessage(null)
    setModalTestError(null)
    setLastSynced(new Date())
    setIsConfigModalOpen(false)
    toast({
      title: "🎉 ¡Conectado a Trello con éxito!",
      description: `Sincronizado con el tablero '${newBoardData?.name || "🔥 Vibecode"}'.`,
    })
  }

  // Handle saving credentials
  const handleSaveCredentials = async () => {
    setIsTestingConnection(true)
    setModalTestError(null)
    try {
      // Test fetching with new credentials
      const params = new URLSearchParams()
      params.append("boardId", boardId.trim() || defaultBoardId)
      params.append("apiKey", apiKey.trim())
      params.append("token", token.trim())

      const res = await fetch(`/api/admin/trello?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      const result = await res.json()

      if (result.authenticated && result.success) {
        saveAndApply(
          {
            apiKey: apiKey.trim(),
            token: token.trim(),
            boardId: boardId.trim() || defaultBoardId,
          },
          result.data
        )
      } else {
        const errMsg = result.message || "No se pudo autenticar con Trello API. Verifica tu API Key y Token."
        setModalTestError(errMsg)
        toast({
          title: "⚠️ No se pudo conectar a Trello",
          description: errMsg,
          variant: "destructive",
        })
      }
    } catch (e: any) {
      const errMsg = e.message || "Ocurrió un error al contactar la API."
      setModalTestError(errMsg)
      toast({
        title: "Error al probar conexión",
        description: errMsg,
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Handle disconnecting
  const handleDisconnect = () => {
    localStorage.removeItem("vibecode_trello_creds")
    setApiKey("")
    setToken("")
    setConnectionSource("preview")
    setAuthErrorMessage(null)
    setIsConfigModalOpen(false)
    fetchBoard("", "", defaultBoardId)
    toast({
      title: "Desconectado",
      description: "Se ha restaurado el modo local preview.",
    })
  }

  // Move Card between lists (optimistic + API)
  const handleMoveCard = async (cardId: string, targetListId: string) => {
    if (!boardData) return

    const card = boardData.cards.find((c) => c.id === cardId)
    if (!card || card.idList === targetListId) return

    // Optimistic UI update
    const previousCards = [...boardData.cards]
    const updatedCards = boardData.cards.map((c) => (c.id === cardId ? { ...c, idList: targetListId } : c))
    setBoardData({ ...boardData, cards: updatedCards })

    if (connectionSource === "preview") {
      toast({
        title: "Tarjeta movida (Modo Preview)",
        description: `La tarjeta se movió a la lista seleccionada.`,
      })
      return
    }

    try {
      const res = await fetch("/api/admin/trello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move-card",
          apiKey,
          token,
          payload: {
            cardId,
            idList: targetListId,
            pos: "bottom",
          },
        }),
      })
      const result = await res.json()
      if (!result.success) {
        // Rollback
        setBoardData({ ...boardData, cards: previousCards })
        toast({
          title: "Error al mover tarjeta en Trello",
          description: result.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "✅ Tarjeta actualizada",
          description: "Cambio sincronizado en tiempo real con Trello.",
        })
      }
    } catch (err: any) {
      setBoardData({ ...boardData, cards: previousCards })
      toast({
        title: "Error de conexión",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  // Create Card
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardName.trim() || !createListId || !boardData) return

    setIsSubmittingAction(true)
    const newTempId = `card-temp-${Date.now()}`
    const tempCard: TrelloCard = {
      id: newTempId,
      name: newCardName.trim(),
      desc: newCardDesc.trim(),
      pos: boardData.cards.length * 1000 + 1000,
      due: newCardDue ? new Date(newCardDue).toISOString() : null,
      dueComplete: false,
      idList: createListId,
      idMembers: [],
      labels: (boardData.labels || []).filter((l) => newCardLabels.includes(l.id)),
      shortUrl: "",
      url: "",
      checklists: [],
    }

    if (connectionSource === "preview") {
      setBoardData({
        ...boardData,
        cards: [...boardData.cards, tempCard],
      })
      setIsCreateModalOpen(false)
      setNewCardName("")
      setNewCardDesc("")
      setNewCardDue("")
      setNewCardLabels([])
      setIsSubmittingAction(false)
      toast({
        title: "Tarjeta creada (Modo Preview)",
        description: "Se añadió la tarjeta localmente.",
      })
      return
    }

    try {
      const res = await fetch("/api/admin/trello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-card",
          apiKey,
          token,
          payload: {
            idList: createListId,
            name: newCardName.trim(),
            desc: newCardDesc.trim(),
            due: newCardDue ? new Date(newCardDue).toISOString() : undefined,
            idLabels: newCardLabels,
          },
        }),
      })
      const result = await res.json()
      if (result.success && result.card) {
        setIsCreateModalOpen(false)
        setNewCardName("")
        setNewCardDesc("")
        setNewCardDue("")
        setNewCardLabels([])
        toast({
          title: "✨ Tarjeta creada en Trello",
          description: "La tarjeta ya está disponible en el tablero.",
        })
        fetchBoard()
      } else {
        toast({
          title: "Error al crear tarjeta",
          description: result.message || "No se pudo crear en Trello.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error de red",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Toggle Checklist item
  const handleToggleCheckItem = async (cardId: string, checkItemId: string, currentState: "complete" | "incomplete") => {
    if (!boardData) return
    const newState: "complete" | "incomplete" = currentState === "complete" ? "incomplete" : "complete"

    // Optimistic update
    const updatedCards: TrelloCard[] = boardData.cards.map((c) => {
      if (c.id !== cardId) return c
      const updatedChecklists: TrelloChecklist[] = (c.checklists || []).map((chk) => ({
        ...chk,
        checkItems: chk.checkItems.map((ci) => (ci.id === checkItemId ? { ...ci, state: newState } : ci)),
      }))
      return { ...c, checklists: updatedChecklists }
    })

    setBoardData({ ...boardData, cards: updatedCards })
    if (selectedCard && selectedCard.id === cardId) {
      const updatedSel = updatedCards.find((c) => c.id === cardId)
      if (updatedSel) setSelectedCard(updatedSel)
    }

    if (connectionSource === "preview") return

    try {
      await fetch("/api/admin/trello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-checkitem",
          apiKey,
          token,
          payload: {
            cardId,
            checkItemId,
            state: newState,
          },
        }),
      })
    } catch (e) {
      console.error("Error toggling checkitem", e)
    }
  }

  // Add checklist item to selected card
  const handleAddCheckItem = async (checklistId: string) => {
    if (!newChecklistText.trim() || !selectedCard || !boardData) return

    const tempItem: TrelloCheckItem = {
      id: `ci-temp-${Date.now()}`,
      name: newChecklistText.trim(),
      state: "incomplete",
    }

    const updatedCards = boardData.cards.map((c) => {
      if (c.id !== selectedCard.id) return c
      const updatedChecklists = (c.checklists || []).map((chk) => {
        if (chk.id !== checklistId) return chk
        return {
          ...chk,
          checkItems: [...chk.checkItems, tempItem],
        }
      })
      return { ...c, checklists: updatedChecklists }
    })

    setBoardData({ ...boardData, cards: updatedCards })
    const updatedSel = updatedCards.find((c) => c.id === selectedCard.id)
    if (updatedSel) setSelectedCard(updatedSel)
    setNewChecklistText("")

    if (connectionSource === "preview") return

    try {
      await fetch("/api/admin/trello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-checklist-item",
          apiKey,
          token,
          payload: {
            checklistId,
            name: tempItem.name,
          },
        }),
      })
    } catch (e) {
      console.error("Error adding checklist item", e)
    }
  }

  // Delete Card
  const handleDeleteCard = async (cardId: string) => {
    if (!boardData) return
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) return

    const updatedCards = boardData.cards.filter((c) => c.id !== cardId)
    setBoardData({ ...boardData, cards: updatedCards })
    setIsDetailModalOpen(false)
    setSelectedCard(null)

    if (connectionSource === "preview") {
      toast({ title: "Tarjeta eliminada (Modo Preview)" })
      return
    }

    try {
      const res = await fetch("/api/admin/trello", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-card",
          apiKey,
          token,
          payload: { cardId },
        }),
      })
      const result = await res.json()
      if (result.success) {
        toast({ title: "Tarjeta eliminada de Trello" })
      } else {
        toast({ title: "Error al eliminar en Trello", description: result.message, variant: "destructive" })
        fetchBoard()
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
      fetchBoard()
    }
  }

  // Filter cards
  const filteredCards = useMemo(() => {
    if (!boardData?.cards) return []
    return boardData.cards.filter((card) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.desc.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLabel =
        !selectedLabel || card.labels?.some((l) => l.name === selectedLabel || l.id === selectedLabel)

      return matchesSearch && matchesLabel
    })
  }, [boardData, searchQuery, selectedLabel])

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId)
    setDraggedCardId(cardId)
  }

  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault()
    if (dragOverListId !== listId) setDragOverListId(listId)
  }

  const handleDragLeave = () => {
    setDragOverListId(null)
  }

  const handleDrop = (e: React.DragEvent, targetListId: string) => {
    e.preventDefault()
    setDragOverListId(null)
    const cardId = e.dataTransfer.getData("text/plain") || draggedCardId
    if (cardId) {
      handleMoveCard(cardId, targetListId)
    }
    setDraggedCardId(null)
  }

  // Helper date status
  const getDateStatus = (due: string | null, dueComplete: boolean) => {
    if (!due) return null
    if (dueComplete) return { text: "Completada", color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40" }
    try {
      const parsed = parseISO(due)
      if (isPast(parsed) && !isToday(parsed)) {
        return { text: `Vencida (${format(parsed, "d MMM", { locale: es })})`, color: "text-rose-400 border-rose-500/40 bg-rose-950/50 animate-pulse" }
      }
      if (isToday(parsed)) {
        return { text: "Vence Hoy", color: "text-amber-400 border-amber-500/40 bg-amber-950/50" }
      }
      return { text: format(parsed, "d MMM", { locale: es }), color: "text-muted-foreground border-border/40 bg-card/40" }
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="bg-gradient-to-r from-violet-950/40 via-card to-background border-violet-500/30 backdrop-blur-md">
        <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-inner">
                <Kanban className="h-5 w-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Tablero Trello: <span className="text-violet-400">{boardData?.name || "🔥 Vibecode"}</span>
              </h2>

              {connectionSource === "trello_api" ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1.5 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>🟢 En Vivo (Trello API)</span>
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5 py-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>🟡 Modo Local / Preview</span>
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {boardData?.desc || "Gestión y sincronización de tareas del roadmap y desarrollo de Vibecode en tiempo real."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct link to Trello */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-violet-500/30 hover:bg-violet-950/30 text-xs text-violet-300 hover:text-white"
            >
              <a href={boardData?.url || DEFAULT_BOARD_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Abrir en Trello
              </a>
            </Button>

            {/* Sync button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBoard()}
              disabled={syncing}
              className="border-border/40 hover:bg-card text-xs text-muted-foreground hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin text-violet-400" : ""}`} />
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </Button>

            {/* Connect / Config Trello API button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsConfigModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/20"
            >
              <Key className="h-3.5 w-3.5 mr-1.5" />
              {connectionSource === "trello_api" ? "Configuración API" : "Conectar Trello"}
            </Button>

            {/* New Card button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setCreateListId(boardData?.lists[0]?.id || "list-todo")
                setIsCreateModalOpen(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Nueva Tarjeta
            </Button>
          </div>
        </CardContent>

        {/* Warning / Error banner if auth failed */}
        {authErrorMessage && connectionSource !== "trello_api" && (
          <div className="bg-amber-950/40 border-t border-amber-600/30 px-5 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Aviso de Conexión:</strong> {authErrorMessage}. Puedes conectar tu cuenta en 1 minuto haciendo clic en Conectar Trello.
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigModalOpen(true)}
              className="text-xs text-amber-300 hover:text-white hover:bg-amber-900/40 h-7"
            >
              Configurar Ahora
            </Button>
          </div>
        )}
      </Card>

      {/* Control Bar: Filters, Search, Views */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/30 border border-border/30 p-3 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar tarjeta o tarea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border/40 text-xs h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white text-xs"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Label selector */}
          {boardData?.labels && boardData.labels.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-md scrollbar-none">
              <Button
                variant={selectedLabel === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedLabel(null)}
                className="text-[11px] h-8 px-2.5 rounded-lg shrink-0"
              >
                Todas
              </Button>
              {boardData.labels.slice(0, 5).map((lbl) => {
                const colorConfig = TRELLO_COLOR_MAP[lbl.color] || TRELLO_COLOR_MAP.blue
                const isSel = selectedLabel === lbl.name || selectedLabel === lbl.id
                return (
                  <Button
                    key={lbl.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLabel(isSel ? null : lbl.name || lbl.id)}
                    className={`text-[11px] h-8 px-2.5 rounded-lg shrink-0 border transition-all ${
                      isSel ? `${colorConfig.bg} ${colorConfig.text} border-white/40 ring-1 ring-white/40 font-bold` : `${colorConfig.border} text-muted-foreground hover:${colorConfig.text}`
                    }`}
                  >
                    <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${colorConfig.dot}`} />
                    {lbl.name || lbl.color}
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {lastSynced && (
            <span className="text-[11px] text-muted-foreground hidden lg:inline-block">
              Sincronizado: {format(lastSynced, "HH:mm:ss")}
            </span>
          )}

          {/* View toggle */}
          <div className="flex items-center bg-background/80 border border-border/40 rounded-lg p-0.5">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="h-7 px-2 text-xs"
              title="Vista Tablero Kanban"
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-7 px-2 text-xs"
              title="Vista Lista"
            >
              <ListIcon className="h-3.5 w-3.5 mr-1" />
              Lista
            </Button>
            <Button
              variant={viewMode === "embed" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("embed")}
              className="h-7 px-2 text-xs"
              title="Vista Trello Web"
            >
              <Globe className="h-3.5 w-3.5 mr-1" />
              Embed
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on viewMode */}
      {viewMode === "embed" ? (
        <Card className="bg-card/30 border-border/30 overflow-hidden">
          <div className="p-3 border-b border-border/30 flex items-center justify-between bg-card/60">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold text-white">Navegador Integrado Trello</span>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-violet-300">
              <a href={boardData?.url || DEFAULT_BOARD_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir en nueva pestaña
              </a>
            </Button>
          </div>
          <div className="w-full h-[750px] bg-zinc-950 flex flex-col">
            <iframe
              src={boardData?.url || DEFAULT_BOARD_URL}
              title="Trello Board Embed"
              className="w-full h-full border-0"
              allow="clipboard-write"
            />
          </div>
        </Card>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="space-y-4">
          {boardData?.lists?.map((list) => {
            const listCards = filteredCards.filter((c) => c.idList === list.id)
            return (
              <Card key={list.id} className="bg-card/20 border-border/30 overflow-hidden">
                <div className="p-3 bg-card/50 border-b border-border/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{list.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-background/60">
                      {listCards.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreateListId(list.id)
                      setIsCreateModalOpen(true)
                    }}
                    className="h-7 text-xs text-violet-300 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Añadir tarjeta
                  </Button>
                </div>
                <div className="p-2 space-y-2">
                  {listCards.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground italic">
                      No hay tarjetas en esta lista.
                    </div>
                  ) : (
                    listCards.map((card) => {
                      const dateStatus = getDateStatus(card.due, card.dueComplete)
                      const totalChecks = card.checklists?.reduce((acc, chk) => acc + chk.checkItems.length, 0) || 0
                      const completedChecks = card.checklists?.reduce((acc, chk) => acc + chk.checkItems.filter((i) => i.state === "complete").length, 0) || 0

                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedCard(card)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-3 rounded-lg bg-card/40 border border-border/30 hover:border-violet-500/40 hover:bg-card/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {card.labels?.map((lbl) => {
                                const colorConfig = TRELLO_COLOR_MAP[lbl.color] || TRELLO_COLOR_MAP.blue
                                return (
                                  <span
                                    key={lbl.id}
                                    className={`text-[10px] px-2 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border} font-medium`}
                                  >
                                    {lbl.name || lbl.color}
                                  </span>
                                )
                              })}
                            </div>
                            <h4 className="font-semibold text-sm text-white">{card.name}</h4>
                            {card.desc && <p className="text-xs text-muted-foreground line-clamp-1">{card.desc}</p>}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-xs">
                            {totalChecks > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <CheckSquare className="h-3.5 w-3.5 text-violet-400" />
                                <span>{completedChecks}/{totalChecks}</span>
                              </div>
                            )}

                            {dateStatus && (
                              <span className={`px-2 py-0.5 rounded text-[11px] border ${dateStatus.color}`}>
                                {dateStatus.text}
                              </span>
                            )}

                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {boardData?.lists?.map((list, listIdx) => {
            const listCards = filteredCards.filter((c) => c.idList === list.id)
            const isDropTarget = dragOverListId === list.id

            return (
              <div
                key={list.id}
                onDragOver={(e) => handleDragOver(e, list.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, list.id)}
                className={`flex flex-col rounded-xl bg-card/25 border transition-all duration-200 min-h-[450px] max-h-[calc(100vh-280px)] ${
                  isDropTarget ? "border-violet-500 bg-violet-950/20 ring-2 ring-violet-500/30" : "border-border/30 hover:border-border/50"
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-border/20 flex items-center justify-between bg-card/40 rounded-t-xl shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-white tracking-wide">{list.name}</h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background/50 border-border/30">
                      {listCards.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCreateListId(list.id)
                      setIsCreateModalOpen(true)
                    }}
                    className="h-6 w-6 text-muted-foreground hover:text-white hover:bg-violet-600/20"
                    title="Añadir tarjeta a esta lista"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1 scrollbar-thin">
                  {listCards.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border/20 rounded-lg text-center p-3">
                      <p className="text-xs text-muted-foreground">Arrastra o añade tarjetas aquí</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCreateListId(list.id)
                          setIsCreateModalOpen(true)
                        }}
                        className="mt-2 text-[11px] text-violet-400 hover:text-violet-300 h-6"
                      >
                        + Crear tarjeta
                      </Button>
                    </div>
                  ) : (
                    listCards.map((card) => {
                      const dateStatus = getDateStatus(card.due, card.dueComplete)
                      const totalChecks = card.checklists?.reduce((acc, chk) => acc + chk.checkItems.length, 0) || 0
                      const completedChecks = card.checklists?.reduce((acc, chk) => acc + chk.checkItems.filter((i) => i.state === "complete").length, 0) || 0

                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, card.id)}
                          onClick={() => {
                            setSelectedCard(card)
                            setIsDetailModalOpen(true)
                          }}
                          className="group relative p-3.5 rounded-xl bg-card/60 hover:bg-card/90 border border-border/40 hover:border-violet-500/50 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer space-y-2.5"
                        >
                          {/* Card Labels */}
                          {card.labels && card.labels.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {card.labels.map((lbl) => {
                                const colorConfig = TRELLO_COLOR_MAP[lbl.color] || TRELLO_COLOR_MAP.blue
                                return (
                                  <span
                                    key={lbl.id}
                                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border} font-bold`}
                                  >
                                    {lbl.name || lbl.color}
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          {/* Card Title */}
                          <h4 className="font-semibold text-xs sm:text-sm text-white leading-snug group-hover:text-violet-200 transition-colors">
                            {card.name}
                          </h4>

                          {/* Card Description preview */}
                          {card.desc && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {card.desc}
                            </p>
                          )}

                          {/* Card Meta / Footer */}
                          <div className="pt-1 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {/* Checklist badge */}
                              {totalChecks > 0 && (
                                <span
                                  className={`flex items-center gap-1 font-medium ${
                                    completedChecks === totalChecks ? "text-emerald-400" : "text-violet-300"
                                  }`}
                                >
                                  <CheckSquare className="h-3 w-3" />
                                  {completedChecks}/{totalChecks}
                                </span>
                              )}

                              {/* Due Date Badge */}
                              {dateStatus && (
                                <span className={`px-1.5 py-0.2 rounded border ${dateStatus.color}`}>
                                  {dateStatus.text}
                                </span>
                              )}
                            </div>

                            {/* Move Quick buttons (visible on hover) */}
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {listIdx > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveCard(card.id, boardData.lists[listIdx - 1].id)}
                                  className="h-5 w-5 text-muted-foreground hover:text-white hover:bg-violet-600/30"
                                  title={`Mover a ${boardData.lists[listIdx - 1].name}`}
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </Button>
                              )}
                              {listIdx < (boardData.lists.length - 1) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMoveCard(card.id, boardData.lists[listIdx + 1].id)}
                                  className="h-5 w-5 text-muted-foreground hover:text-white hover:bg-violet-600/30"
                                  title={`Mover a ${boardData.lists[listIdx + 1].name}`}
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Column Footer */}
                <div className="p-2 border-t border-border/20 bg-card/30 rounded-b-xl shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreateListId(list.id)
                      setIsCreateModalOpen(true)
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-white hover:bg-violet-600/20 justify-start h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                    Añadir tarjeta
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DETALLE DE TARJETA (VER / EDITAR / CHECKLISTS / ELIMINAR) */}
      {/* ========================================================================= */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-border/40 text-white p-6 max-h-[90vh] overflow-y-auto">
          {selectedCard && (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedCard.labels?.map((lbl) => {
                      const colorConfig = TRELLO_COLOR_MAP[lbl.color] || TRELLO_COLOR_MAP.blue
                      return (
                        <span
                          key={lbl.id}
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}
                        >
                          {lbl.name || lbl.color}
                        </span>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedCard.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-7 text-xs border-violet-500/40 text-violet-300 hover:text-white hover:bg-violet-950/40"
                      >
                        <a href={selectedCard.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver en Trello
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {selectedCard.name}
                </DialogTitle>

                <DialogDescription asChild>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>En lista:</span>
                    <Badge variant="secondary" className="text-xs font-semibold text-violet-300">
                      {boardData?.lists.find((l) => l.id === selectedCard.idList)?.name || "Lista"}
                    </Badge>
                  </div>
                </DialogDescription>
              </div>

              {/* Move to list selector */}
              <div className="bg-card/40 border border-border/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-violet-400" />
                  Mover a otra columna:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {boardData?.lists?.map((list) => {
                    const isCurrent = list.id === selectedCard.idList
                    return (
                      <Button
                        key={list.id}
                        variant={isCurrent ? "secondary" : "outline"}
                        size="sm"
                        disabled={isCurrent}
                        onClick={() => handleMoveCard(selectedCard.id, list.id)}
                        className={`text-xs h-7 px-2.5 ${isCurrent ? "bg-violet-600 text-white font-bold" : "hover:bg-card"}`}
                      >
                        {list.name}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5 text-violet-400" />
                  Descripción
                </Label>
                <div className="p-3.5 rounded-lg bg-card/30 border border-border/30 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                  {selectedCard.desc || <span className="text-muted-foreground italic">Sin descripción proporcionada.</span>}
                </div>
              </div>

              {/* Due Date if present */}
              {selectedCard.due && (
                <div className="space-y-1 bg-card/20 border border-border/30 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-4 w-4 text-violet-400" />
                    <span className="text-muted-foreground">Fecha de entrega:</span>
                    <span className="font-semibold text-white">
                      {format(parseISO(selectedCard.due), "PPPP 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                  {selectedCard.dueComplete ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                      Completada
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                      Pendiente
                    </Badge>
                  )}
                </div>
              )}

              {/* Checklists */}
              {selectedCard.checklists && selectedCard.checklists.length > 0 && (
                <div className="space-y-4">
                  {selectedCard.checklists.map((chk) => {
                    const total = chk.checkItems.length
                    const done = chk.checkItems.filter((i) => i.state === "complete").length
                    const percent = total > 0 ? Math.round((done / total) * 100) : 0

                    return (
                      <div key={chk.id} className="space-y-3 bg-card/20 border border-border/30 p-3.5 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold text-xs text-white">
                            <CheckSquare className="h-4 w-4 text-violet-400" />
                            <span>{chk.name}</span>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{percent}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-background/80 h-1.5 rounded-full overflow-hidden border border-border/30">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5 pt-1">
                          {chk.checkItems.map((item) => {
                            const isCompleted = item.state === "complete"
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleToggleCheckItem(selectedCard.id, item.id, item.state)}
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-card/50 transition-colors cursor-pointer text-xs"
                              >
                                {isCompleted ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <span
                                  className={`flex-1 select-none ${
                                    isCompleted ? "line-through text-muted-foreground" : "text-white"
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Add Item to Checklist input */}
                        <div className="pt-2 flex items-center gap-2">
                          <Input
                            placeholder="Añadir tarea a esta checklist..."
                            value={newChecklistText}
                            onChange={(e) => setNewChecklistText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddCheckItem(chk.id)
                            }}
                            className="text-xs h-8 bg-background/50 border-border/40"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddCheckItem(chk.id)}
                            className="h-8 px-3 text-xs bg-violet-600 hover:bg-violet-500"
                          >
                            Añadir
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCard(selectedCard.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Eliminar Tarjeta
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-xs px-4"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: CREAR NUEVA TARJETA */}
      {/* ========================================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-border/40 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Nueva Tarjeta de Trello
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Añade una tarea o iniciativa al roadmap de Vibecode.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCard} className="space-y-4 pt-2">
            {/* Target List */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white">Lista / Columna de Destino</Label>
              <select
                value={createListId}
                onChange={(e) => setCreateListId(e.target.value)}
                className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-violet-500"
              >
                {boardData?.lists?.map((list) => (
                  <option key={list.id} value={list.id} className="bg-zinc-900 text-white">
                    {list.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white">Título de la Tarjeta *</Label>
              <Input
                placeholder="Ej. Integración con webhook de Stripe"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                required
                className="text-xs bg-background/50 border-border/40"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white">Descripción / Detalles</Label>
              <Textarea
                placeholder="Detalla los requisitos, endpoints o notas clave..."
                value={newCardDesc}
                onChange={(e) => setNewCardDesc(e.target.value)}
                rows={3}
                className="text-xs bg-background/50 border-border/40"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white">Fecha de Vencimiento (Opcional)</Label>
              <Input
                type="datetime-local"
                value={newCardDue}
                onChange={(e) => setNewCardDue(e.target.value)}
                className="text-xs bg-background/50 border-border/40 text-white"
              />
            </div>

            {/* Labels selection */}
            {boardData?.labels && boardData.labels.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white">Etiquetas</Label>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-2 bg-card/20 border border-border/30 rounded-lg">
                  {boardData.labels.map((lbl) => {
                    const isSelected = newCardLabels.includes(lbl.id)
                    const colorConfig = TRELLO_COLOR_MAP[lbl.color] || TRELLO_COLOR_MAP.blue
                    return (
                      <button
                        key={lbl.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewCardLabels(newCardLabels.filter((id) => id !== lbl.id))
                          } else {
                            setNewCardLabels([...newCardLabels, lbl.id])
                          }
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                          isSelected ? `${colorConfig.bg} ${colorConfig.text} ring-2 ring-white/50 font-bold` : `${colorConfig.border} text-muted-foreground opacity-60 hover:opacity-100`
                        }`}
                      >
                        {lbl.name || lbl.color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingAction || !newCardName.trim()}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold px-4"
              >
                {isSubmittingAction ? "Creando..." : "Crear Tarjeta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIGURACIÓN Y CONEXIÓN CON TRELLO API */}
      {/* ========================================================================= */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-xl bg-zinc-950 border-border/40 text-white p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-violet-400" />
              Conectar Cuenta de Trello
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Conecta tu API Key y Token para sincronización bidireccional en tiempo real con el tablero 🔥 Vibecode.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Step-by-step instructions card */}
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-3 text-xs">
              <div className="font-bold text-violet-200 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                ¿Cómo obtener tus credenciales de Trello en 30 segundos?
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                <li>
                  Inicia sesión en tu cuenta de Trello y visita el portal de desarrolladores:{" "}
                  <a
                    href="https://trello.com/power-ups/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 underline font-semibold hover:text-violet-300 inline-flex items-center gap-0.5"
                  >
                    trello.com/power-ups/admin <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </li>
                <li>Copia tu <strong>API Key</strong> y pégala en el primer campo abajo.</li>
                <li>
                  En la misma pantalla, haz clic en el enlace <strong>"Generar un Token"</strong> (o Token manual), autoriza a tu usuario y copia el Token generado.
                </li>
                <li>Pega ambos valores y haz clic en <strong>"Probar y Guardar Conexión"</strong>.</li>
              </ol>
            </div>

            {/* Inputs Form */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white">ID o ShortLink del Tablero</Label>
                <Input
                  placeholder="ZePjZue7"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  className="text-xs bg-background/50 border-border/40 font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Tablero por defecto: <code className="text-violet-400 font-mono">ZePjZue7</code> (🔥 Vibecode).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white">Trello API Key *</Label>
                <Input
                  type="password"
                  placeholder="Ej. a1b2c3d4e5f6..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="text-xs bg-background/50 border-border/40 font-mono"
                />
                {apiKey.trim() && (
                  <div className="pt-0.5">
                    <a
                      href={`https://trello.com/1/authorize?expiration=never&name=Vibecode%20Admin&scope=read,write&response_type=token&key=${encodeURIComponent(apiKey.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 font-semibold underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      👉 Haz clic aquí para generar tu Token automáticamente en Trello
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white">Trello User Token *</Label>
                <Input
                  type="password"
                  placeholder="Ej. ATTA1234567890abcdef..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="text-xs bg-background/50 border-border/40 font-mono"
                />
              </div>
            </div>

            {/* Error feedback if test failed */}
            {modalTestError && (
              <div className="p-3 bg-rose-950/60 border border-rose-600/40 rounded-xl text-xs text-rose-200 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white">Respuesta de Trello:</span>
                    <p className="text-rose-300 font-mono text-[11px] break-all">{modalTestError}</p>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      saveAndApply({
                        apiKey: apiKey.trim(),
                        token: token.trim(),
                        boardId: boardId.trim() || defaultBoardId,
                      })
                    }}
                    className="h-7 text-[11px] border-rose-500/40 text-rose-300 hover:bg-rose-900/40"
                  >
                    Guardar de todas formas
                  </Button>
                </div>
              </div>
            )}

            {/* Connection Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/30">
              {apiKey || token ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 w-full sm:w-auto"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Desconectar / Resetear
                </Button>
              ) : <div />}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-xs"
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveCredentials}
                  disabled={isTestingConnection || !apiKey.trim() || !token.trim()}
                  className="text-xs bg-violet-600 hover:bg-violet-500 font-semibold px-4"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Probando Conexión...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Probar y Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
