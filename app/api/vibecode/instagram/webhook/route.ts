import { NextResponse, after } from "next/server"
import crypto from "crypto"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { generateInstagramReply } from "@/lib/instagram-bot"
// In-memory caches for deduplication, active sender concurrency control, and human handover tracking
const PROCESSED_MSG_IDS = new Set<string>()
const ACTIVE_SENDERS = new Set<string>()
const BOT_LAST_SENT_TIMES = new Map<string, number>()
const MAX_CACHE_SIZE = 2000

function isMsgIdProcessed(msgId: string): boolean {
  if (!msgId) return false
  if (PROCESSED_MSG_IDS.has(msgId)) {
    return true
  }
  PROCESSED_MSG_IDS.add(msgId)
  if (PROCESSED_MSG_IDS.size > MAX_CACHE_SIZE) {
    const firstKey = PROCESSED_MSG_IDS.values().next().value
    if (firstKey) PROCESSED_MSG_IDS.delete(firstKey)
  }
  return false
}

// GET endpoint: Verify Webhook from Meta
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "VIBE_VERIFY_TOKEN"

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Instagram Webhook verified successfully in Next.js/Vercel!")
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }

  console.error("❌ Verification failed. Token mismatch.")
  return new Response("Forbidden", { status: 403 })
}

// POST endpoint: Receive messages from Instagram Direct
export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    
    // Validate Signature if FB_APP_SECRET is configured
    const appSecret = process.env.FB_APP_SECRET
    if (appSecret) {
      const signature = req.headers.get("x-hub-signature-256")
      if (!signature) {
        console.warn("⚠️ Missing signature header")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      
      const parts = signature.split("=")
      const expectedSignature = crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex")

      if (parts[1] !== expectedSignature) {
        console.error("⚠️ Webhook signature validation failed")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    // Only process Instagram webhook events; ignore Facebook Page duplicates
    if (payload.object !== "instagram") {
      console.log(`ℹ️ Ignoring webhook object="${payload.object}" (not instagram)`)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const host = req.headers.get("host") || "localhost:3000"
    const protocol = req.headers.get("x-forwarded-proto") || "https"

    // Execute heavy AI response and bubble sending in background via Next.js after()
    // This allows returning HTTP 200 OK to Meta immediately (<50ms), avoiding Meta retry timeouts!
    after(async () => {
      try {
        await processWebhookPayload(payload, host, protocol)
      } catch (bgErr) {
        console.error("💥 Background processing error in Instagram Webhook:", bgErr)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("💥 Critical error in Instagram Webhook handler:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Asynchronous payload processing (DMs and Comments)
async function processWebhookPayload(payload: any, host: string, protocol: string) {
  const supabase = getSupabaseAdminClient() as any
  const entries = payload.entry || []

  for (const entry of entries) {
    // 1. Process Instagram Direct DMs (messaging)
    const messagingList = entry.messaging || []
    for (const messaging of messagingList) {
      if (!messaging.message || !messaging.message.text) continue

      const isEcho = Boolean(messaging.message.is_echo)
      const rawSenderId = messaging.sender?.id
      const rawRecipientId = messaging.recipient?.id
      const messageText = (messaging.message.text || "").trim()
      const messageId = messaging.message.mid || `${rawSenderId}_${messaging.timestamp}_${messageText}`

      // Check Deduplication by Message ID (mid)
      if (isMsgIdProcessed(messageId)) {
        console.log(`⚠️ Ignored duplicate message event (${messageId})`)
        continue
      }

      // Handle Echo Event (Message sent outbound from the Page/Account)
      if (isEcho) {
        const customerId = rawRecipientId || rawSenderId
        if (!customerId) continue

        // Check if message was sent by our Bot in the last 45 seconds (in-memory or in database)
        const lastBotSent = BOT_LAST_SENT_TIMES.get(customerId) || 0
        const isBotSentTime = (Date.now() - lastBotSent) < 45000

        // Database-level check across all concurrent serverless lambdas
        const fortyFiveSecAgo = new Date(Date.now() - 45000).toISOString()
        const { data: recentDbBotMsg } = await supabase
          .from("instagram_messages")
          .select("id")
          .eq("ig_sid", customerId)
          .eq("sender", "bot")
          .gte("created_at", fortyFiveSecAgo)
          .limit(1)

        const isDbBotSent = recentDbBotMsg && recentDbBotMsg.length > 0
        const isBotSentText = /(?:embajador|embajadora|partner|partners|creador|creadora|creadores|descuento|masterclass|deeplink|vibecode|tabla|comisiones|c[oó]digo|¿Me puedes decir tu nombre\?|Audio de saludo)/i.test(messageText)

        if (isBotSentTime || isDbBotSent || isBotSentText) {
          console.log(`ℹ️ Echo message for ${customerId} was sent by Bot ("${messageText.slice(0, 30)}..."). Ignoring.`)
          continue
        }

        // It is a HUMAN OPERATOR message (typed from Instagram app or Meta Business Suite)!
        console.log(`👤 Human operator message detected for ${customerId}: "${messageText}"`)

        // Save human message to database
        try {
          await supabase.from("instagram_messages").insert({
            ig_sid: customerId,
            sender: "human",
            message: messageText
          })
        } catch (dbErr) {
          await supabase.from("instagram_messages").insert({
            ig_sid: customerId,
            sender: "bot",
            message: `[Humano] ${messageText}`
          })
        }

        // Check for manual override commands
        const lowerText = messageText.toLowerCase().trim()
        if (lowerText === "#bot" || lowerText === "#reanudar") {
          console.log(`▶️ Manual override: Re-activating bot for customer ${customerId}`)
          await supabase.from("chat_followup_states").upsert({
            session_id: customerId,
            channel: "instagram",
            status: "active",
            paused_until: null,
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })
        } else if (lowerText === "#pausa" || lowerText === "#humano") {
          const pausedUntil24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          console.log(`⏸️ Manual override: Pausing bot for 24h for customer ${customerId} (until ${pausedUntil24h})`)
          await supabase.from("chat_followup_states").upsert({
            session_id: customerId,
            channel: "instagram",
            status: "paused_human",
            paused_until: pausedUntil24h,
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })
        } else {
          // Standard 10-minute pause window for human operator activity
          const pausedUntil10m = new Date(Date.now() + 10 * 60 * 1000).toISOString()
          console.log(`⏸️ Bot paused for customer ${customerId} for 10 minutes (until ${pausedUntil10m}) due to human operator activity`)
          await supabase.from("chat_followup_states").upsert({
            session_id: customerId,
            channel: "instagram",
            status: "paused_human",
            paused_until: pausedUntil10m,
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })
        }

        continue
      }

      // Process Incoming Customer Message (isEcho is false)
      const senderId = rawSenderId
      if (!senderId) continue

      // Check Active Sender Lock (prevent concurrent reply generation for same user)
      if (ACTIVE_SENDERS.has(senderId)) {
        console.log(`⚠️ Active sender lock for ${senderId}, skipping concurrent reply generation`)
        continue
      }

      ACTIVE_SENDERS.add(senderId)

      try {
        console.log(`📩 Received Instagram message from customer ${senderId}: ${messageText}`)

        // Check if bot is currently paused for human intervention
        const { data: followupState } = await supabase
          .from("chat_followup_states")
          .select("paused_until, status")
          .eq("session_id", senderId)
          .maybeSingle()

        const now = new Date()

        // Database-level deduplication: check if the EXACT same user message was already processed within the last 12 seconds
        // This catches race conditions between concurrent Vercel lambda instances
        const twelveSecondsAgo = new Date(Date.now() - 12000).toISOString()
        const { data: recentSameMsg } = await supabase
          .from("instagram_messages")
          .select("id")
          .eq("ig_sid", senderId)
          .eq("sender", "user")
          .eq("message", messageText)
          .gte("created_at", twelveSecondsAgo)
          .limit(1)

        if (recentSameMsg && recentSameMsg.length > 0) {
          console.log(`⚠️ Dedup: Identical user message already in DB for ${senderId} within 12s. Skipping.`)
          continue
        }

        const isPausedForHuman = followupState?.status === "paused_human" && followupState?.paused_until && new Date(followupState.paused_until) > now

        if (isPausedForHuman) {
          console.log(`🤫 Customer ${senderId} sent a message, but bot is currently paused for human intervention (until ${followupState.paused_until}). Saving message without auto-replying.`)
          
          // Save customer message to history DB
          await supabase.from("instagram_messages").insert({
            ig_sid: senderId,
            sender: "user",
            message: messageText
          })

          // Update last user message timestamp
          await supabase.from("chat_followup_states").update({
            last_user_message_at: now.toISOString(),
            updated_at: now.toISOString()
          }).eq("session_id", senderId)

          continue
        }

        // 1. Get Flags / Configuration from Supabase Settings
        const { data: settingsData } = await supabase
          .from("vibecode_settings")
          .select("key, value")
          .in("key", ["disable_bot_detection"])

        const settings = (settingsData || []).reduce((acc: any, item: any) => {
          acc[item.key] = item.value
          return acc
        }, {})

        const disableBot = settings.disable_bot_detection === "true"

        if (disableBot) {
          console.log("ℹ️ Bot is disabled via 'disable_bot_detection' setting.")
          continue
        }

        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        let firstName = "amigo"
        let username = "user"
        let lastName = ""

        if (accessToken) {
          try {
            const fields = "first_name,last_name,username"
            const apiHost = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
            const profileRes = await fetch(
              `https://${apiHost}/v18.0/${senderId}?fields=${fields}&access_token=${accessToken}`
            )
            if (profileRes.ok) {
              const profile = await profileRes.json()
              firstName = profile.first_name || firstName
              lastName = profile.last_name || lastName
              username = profile.username || username
            }
          } catch (err) {
            console.error("⚠️ Error fetching profile:", err)
          }
        }

        // 4. Save/Update Contact in Database
        await supabase.from("instagram_contacts").upsert({
          ig_sid: senderId,
          username,
          first_name: firstName,
          last_name: lastName,
          last_interaction: new Date().toISOString()
        }, { onConflict: "ig_sid" })

        // 5. Save incoming Message in Database
        await supabase.from("instagram_messages").insert({
          ig_sid: senderId,
          sender: "user",
          message: messageText
        })

        // 6. Get Recent Chat History Context (Latest 25 messages)
        const { data: dbMessages } = await supabase
          .from("instagram_messages")
          .select("sender, message, created_at")
          .eq("ig_sid", senderId)
          .order("created_at", { ascending: false })
          .limit(25)

        // Reverse to chronological order (oldest -> newest) and exclude the message just inserted
        const rawHistory = (dbMessages || []).reverse()
        const priorHistory = rawHistory.slice(0, -1) // Exclude current message

        const history = priorHistory.map((msg: any) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.message
        }))

        // Check if sender is partner KÖH (Sintegia: Coherence Engine) or Momística (escuelamistica.cl)
        const isKoh = /k[oö]h/i.test(firstName) ||
                      /k[oö]h/i.test(lastName) ||
                      /k[oö]h/i.test(username) ||
                      /(?:sintegia|coherence\s*engine|coherence\s*enegine)/i.test(messageText) ||
                      /(?:^|\b)(?:soy\s+)?k[oö]h(?:\b|$)/i.test(messageText) ||
                      priorHistory.some((m: any) => /k[oö]h|sintegia|coherence/i.test(m.message || ""))

        const isMomistica = /momi|momistica|escuelamistica/i.test(firstName) ||
                            /momi|momistica|escuelamistica/i.test(lastName) ||
                            /momi|momistica|escuelamistica/i.test(username) ||
                            /(?:escuelamistica(?:\.cl)?|momi|momistica)/i.test(messageText) ||
                            priorHistory.some((m: any) => /momi|momistica|escuelamistica/i.test(m.message || ""))

        // Check ambassador/partner state in database or explicit intent
        const isExplicitAmbassador = !isKoh && !isMomistica && /(?:quiero ser embajador|ser embajador|ser partner|programa de embajadores|programa de afiliados|afiliados|quiero ser partner|programa de creadores)/i.test(messageText)
        const isAwaitingAmbassadorName = followupState?.status === "ambassador_awaiting_name"
        const isAmbassadorFlow = !isKoh && !isMomistica && (isExplicitAmbassador || isAwaitingAmbassadorName)

        // Update followup state: if KÖH or Momística, mark as partner status to prevent sales followups
        const newStatus = isKoh
          ? "partner_koh"
          : (isMomistica
              ? "partner_momistica"
              : (isAmbassadorFlow
                  ? (isAwaitingAmbassadorName ? "ambassador_completed" : "ambassador_awaiting_name")
                  : (followupState?.status === "ambassador_awaiting_name" ? "active" : (followupState?.status || "active"))))

        await supabase.from("chat_followup_states").upsert({
          session_id: senderId,
          channel: "instagram",
          link_type: null,
          link_sent_at: null,
          follow_up_count: 0,
          consecutive_bot_messages: 0,
          status: newStatus,
          paused_until: null,
          last_user_message_at: now.toISOString(),
          updated_at: now.toISOString()
        }, { onConflict: "session_id" })

        // 7. Get AI response — call generateInstagramReply directly (no internal HTTP fetch which fails on Vercel)
        let reply = ""
        try {
          reply = await generateInstagramReply({
            name: firstName,
            username: username,
            message: messageText,
            history: history,
            isAmbassadorFlow: isAmbassadorFlow
          })
        } catch (chatErr) {
          console.error("❌ Exception generating Instagram reply:", chatErr)
        }

        // Clean out any AI hallucinations like Audio: "..." or transcripts from reply text
        reply = reply.replace(/Audio:\s*[""'«]?[^""'»\n]+[""'»]?/gi, "").trim()

        if (!reply || reply.length < 3) {
          if (isKoh) {
            reply = `¡Hola KÖH! 👋 Te habla el asistente de IA de Javier. ¿Tienes alguna duda de programación con Sintegia o alguna idea que quieras que guardemos para el backlog (nuestra lista de pendientes de desarrollo)?`
          } else if (isMomistica) {
            reply = `¡Hola Momi! 👋 Te habla el asistente de IA de Javier. ¿Cómo va todo con escuelamistica.cl? Dime si tienes algún requerimiento o si avanzamos con la API Key de Meta para dejárselo coordinado a tu CTO Javi.`
          } else {
            const alreadyAskedDedication = priorHistory.some((m: any) => /a qué te dedicas|negocio\/proyecto/i.test(m.message || ""))
            if (alreadyAskedDedication) {
              reply = `¡Buenísimo! Cuéntame un poco más de eso para ver de qué forma te puedo orientar 🚀`
            } else {
              reply = priorHistory.length > 0
                ? `¡Jajaja dale! Oye, cuéntame entonces: ¿a qué te dedicas actualmente o qué tipo de negocio/proyecto tienes hoy?`
                : `Te dejé esa nota de voz arriba ☝️ Cuéntame para poder darte una mano.`
            }
          }
        }

        // Register bot active response timestamp to prevent self-echo false positives
        BOT_LAST_SENT_TIMES.set(senderId, Date.now())

        // 8. Save bot response in Database
        await supabase.from("instagram_messages").insert({
          ig_sid: senderId,
          sender: "bot",
          message: reply
        })

        // Check if bot message contains links to Vibecode Studio or Vibecode Lab (excluding Ambassador proposals)
        const isAmbassadorProposal = /📊 Tabla de Comisiones|Tu código de descuento|deeplink\/ppt/i.test(reply)
        const hasStudioLink = !isAmbassadorProposal && /\/agendar|javiermujica\.com\/agendar|deeplink\/agendar/i.test(reply)
        const hasLabLink = !isAmbassadorProposal && /\/vibecode|javiermujica\.com\/vibecode|deeplink\/vibecode/i.test(reply)

        if (isAmbassadorProposal) {
          await supabase.from("chat_followup_states").upsert({
            session_id: senderId,
            channel: "instagram",
            link_type: null,
            status: "ambassador_completed",
            last_bot_message_at: now.toISOString(),
            updated_at: now.toISOString()
          }, { onConflict: "session_id" })
        } else if (!isKoh && !isMomistica && (hasStudioLink || hasLabLink)) {
          const linkType = hasStudioLink ? "studio" : "lab"
          await supabase.from("chat_followup_states").upsert({
            session_id: senderId,
            channel: "instagram",
            link_type: linkType,
            link_sent_at: new Date().toISOString(),
            follow_up_count: 0,
            consecutive_bot_messages: 1,
            status: "pending_link",
            last_bot_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })
        }

        // 9. Send response back to Instagram DM in short, bite-sized bubbles (max ~20 words each)
        if (accessToken) {
          try {
            const primaryHost = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
            const fallbackHost = primaryHost === "graph.instagram.com" ? "graph.facebook.com" : "graph.instagram.com"

            // Send greeting audio note (saludo.mp3 / saludo.m4a) if start of conversation or explicitly requested (skipped for Ambassador flow, partner KÖH, and client Momística)
            const isFirstMessage = priorHistory.length === 0
            const userRequestedAudio = /(?:audio|nota de voz|escuchar.*audio|m[aá]ndame.*audio|simula.*audio|primer.*audio)/i.test(messageText)
            const shouldSendAudio = (isFirstMessage || userRequestedAudio) && !isAmbassadorFlow && !isKoh && !isMomistica

            if (shouldSendAudio) {
              try {
                const baseUrl = (host && !host.includes("localhost")) ? `${protocol}://${host}` : "https://www.javiermujica.com"
                const audioUrls = [
                  `${baseUrl}/audio/saludo.mp3`,
                  `${baseUrl}/audio/saludo.m4a`,
                  "https://www.javiermujica.com/audio/saludo.mp3"
                ]

                let sentAudioSuccessfully = false

                for (const audioUrl of audioUrls) {
                  if (sentAudioSuccessfully) break

                  console.log(`🔊 Attempting to send greeting voice note (${audioUrl}) to ${senderId}...`)

                  let audioRes = await fetch(
                    `https://${primaryHost}/v18.0/me/messages?access_token=${accessToken}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        recipient: { id: senderId },
                        message: {
                          attachment: {
                            type: "audio",
                            payload: {
                              url: audioUrl,
                              is_reusable: true
                            }
                          }
                        }
                      })
                    }
                  )

                  if (!audioRes.ok) {
                    const errBody = await audioRes.text()
                    console.warn(`⚠️ Audio send via ${primaryHost} with ${audioUrl} failed (${audioRes.status}): ${errBody}. Trying fallback host ${fallbackHost}...`)
                    audioRes = await fetch(
                      `https://${fallbackHost}/v18.0/me/messages?access_token=${accessToken}`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          recipient: { id: senderId },
                          message: {
                            attachment: {
                              type: "audio",
                              payload: {
                                url: audioUrl,
                                is_reusable: true
                              }
                            }
                          }
                        })
                      }
                    )
                  }

                  if (audioRes.ok) {
                    console.log(`✅ Successfully sent greeting voice note (${audioUrl}) to ${username}`)
                    sentAudioSuccessfully = true
                    await supabase.from("instagram_messages").insert({
                      ig_sid: senderId,
                      sender: "bot",
                      message: "[Audio de saludo enviado: /audio/saludo.mp3]"
                    })
                    // Delay 3.5 seconds so user receives/listens to voice note before text bubbles arrive
                    await new Promise(r => setTimeout(r, 3500))
                  } else {
                    console.error(`❌ Error sending greeting voice note (${audioUrl}):`, await audioRes.text())
                  }
                }
              } catch (audioErr) {
                console.error("❌ Exception sending greeting voice note:", audioErr)
              }
            }

            // Helper to split text into chunks (proposals are sent intact in 1-2 blocks to avoid Vercel timeouts)
            const isStructuredProposal = /📊 Tabla de Comisiones|Tu código de descuento/i.test(reply)
            let messageChunks: string[] = []

            if (isStructuredProposal) {
              // Split by double/triple newlines and cap each chunk to 900 chars to respect Meta Instagram API limit (1000 max)
              const rawBlocks = reply.split(/\n\n+/).filter(Boolean)
              let currentChunk = ""
              for (const block of rawBlocks) {
                if ((currentChunk + "\n\n" + block).length <= 900) {
                  currentChunk = currentChunk ? `${currentChunk}\n\n${block}` : block
                } else {
                  if (currentChunk) messageChunks.push(currentChunk)
                  currentChunk = block
                }
              }
              if (currentChunk) messageChunks.push(currentChunk)
              if (messageChunks.length === 0) messageChunks = [reply.slice(0, 900)]
            } else {
              const paragraphs = reply.split(/\n+/).map(p => p.trim()).filter(Boolean)
              const chunks: string[] = []
              for (const para of paragraphs) {
                const words = para.split(/\s+/)
                if (words.length <= 22) {
                  chunks.push(para)
                } else {
                  let current: string[] = []
                  for (const word of words) {
                    current.push(word)
                    if (current.length >= 18 && /[.!?]$/.test(word)) {
                      chunks.push(current.join(" "))
                      current = []
                    }
                  }
                  if (current.length > 0) {
                    chunks.push(current.join(" "))
                  }
                }
              }
              messageChunks = chunks.length > 0 ? chunks : [reply]
            }

            const interChunkDelay = isStructuredProposal ? 500 : 3000

            for (let i = 0; i < messageChunks.length; i++) {
              const chunkText = messageChunks[i]
              if (i > 0) {
                await new Promise(r => setTimeout(r, interChunkDelay))
              }

              let sendRes = await fetch(
                `https://${primaryHost}/v18.0/me/messages?access_token=${accessToken}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient: { id: senderId },
                    message: { text: chunkText }
                  })
                }
              )

              if (!sendRes.ok) {
                const errBody = await sendRes.text()
                console.warn(`⚠️ Primary send via ${primaryHost} failed (${sendRes.status}): ${errBody}. Trying fallback ${fallbackHost}...`)
                sendRes = await fetch(
                  `https://${fallbackHost}/v18.0/me/messages?access_token=${accessToken}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      recipient: { id: senderId },
                      message: { text: chunkText }
                    })
                  }
                )
              }

              if (sendRes.ok) {
                console.log(`📤 Successfully sent Instagram reply chunk (${i+1}/${messageChunks.length}) to ${username}`)
              } else {
                console.error("❌ Error sending message chunk to Instagram API:", await sendRes.text())
              }
            }
          } catch (sendErr) {
            console.error("❌ Exception sending message to Instagram API:", sendErr)
          }
        } else {
          console.warn("⚠️ INSTAGRAM_ACCESS_TOKEN is not configured in Vercel")
        }
      } finally {
        ACTIVE_SENDERS.delete(senderId)
      }
    }

    // 2. Process Instagram Public Post Comments (changes)
    const changesList = entry.changes || []
    for (const change of changesList) {
      if (change.field !== "comments" && change.field !== "comment" && change.field !== "feed") continue

      const comment = change.value
      if (!comment) continue

      const commentText = (comment.text || comment.message || "").trim()
      const commentId = comment.id || comment.comment_id
      if (!commentId || !commentText) continue

      // Deduplicate comment processing
      if (isMsgIdProcessed(`comment_${commentId}`)) {
        console.log(`⚠️ Ignored duplicate comment event (${commentId})`)
        continue
      }

      const fromUser = comment.from || {}
      const igUserId = fromUser.id || comment.user_id || comment.from_id
      const username = fromUser.username || fromUser.name || "user"

      // Prevent self-replying loops
      if (igUserId && igUserId === entry.id) continue

      console.log(`💬 Received Instagram comment from ${username} (${igUserId}): "${commentText}" (commentId: ${commentId})`)

      // Check if Bot is disabled globally via settings
      const { data: settingsData } = await supabase
        .from("vibecode_settings")
        .select("key, value")
        .in("key", ["disable_bot_detection"])

      const settings = (settingsData || []).reduce((acc: any, item: any) => {
        acc[item.key] = item.value
        return acc
      }, {})

      if (settings.disable_bot_detection === "true") {
        console.log("ℹ️ Bot is disabled via settings.")
        continue
      }

      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN
      if (!accessToken) {
        console.warn("⚠️ Neither INSTAGRAM_ACCESS_TOKEN nor FACEBOOK_PAGE_ACCESS_TOKEN is configured in Vercel")
        continue
      }

      // DB-level dedup: prevents duplicate sends when Meta retries or two serverless
      // lambdas fire simultaneously (they don't share in-memory state).
      // We check if a bot reply was already saved for this exact commentId in the last 30s.
      const commentLockKey = `comment_lock_${commentId}`
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString()
      try {
        const { data: existingLock } = await supabase
          .from("instagram_messages")
          .select("id")
          .eq("ig_sid", igUserId || "unknown")
          .eq("sender", "comment_lock")
          .eq("message", commentLockKey)
          .gte("created_at", thirtySecondsAgo)
          .limit(1)

        if (existingLock && existingLock.length > 0) {
          console.log(`⚠️ DB-level dedup: comment ${commentId} already processed. Skipping.`)
          continue
        }

        // Claim the lock immediately so concurrent lambdas see it
        await supabase.from("instagram_messages").insert({
          ig_sid: igUserId || "unknown",
          sender: "comment_lock",
          message: commentLockKey
        })
      } catch (dedupErr) {
        console.warn("⚠️ Could not acquire comment dedup lock, proceeding anyway:", dedupErr)
      }

      // Save/Update Contact in Database
      await supabase.from("instagram_contacts").upsert({
        ig_sid: igUserId,
        username,
        first_name: username,
        last_interaction: new Date().toISOString()
      }, { onConflict: "ig_sid" })

      // --- Classify comment into 3 categories based SOLELY on comment text ---
      // IMPORTANT: We do NOT read any saved DB state (ambassador_awaiting_name, etc.)
      // because each public post comment is an independent trigger event.
      // DB state (ambassador flow, pauses, etc.) only applies to ongoing DM conversations.

      // Cat 1: Ambassador / Partner intent keywords
      const isAmbassadorComment = /(?:embajador|embajadora|ser partner|programa de embajadores|programa de afiliados|afiliado|afiliada|quiero ser partner|programa de creadores)/i.test(commentText)

      // Cat 2: Masterclass / recording request keywords
      const isMasterclassComment = !isAmbassadorComment && /\b(masterclass|token|seguro|vend[ae]|vender|builder)\b/i.test(commentText)

      // Cat 3: Everything else → warm welcome DM, conversational flow (no links yet)
      const isGenericComment = !isAmbassadorComment && !isMasterclassComment

      // Varied public replies so the comment section doesn't look repetitive
      const publicRepliesGeneric = [
        "Te escribí un mensaje 👀 ¿te llegó?",
        "Enviado ⚡ mira tus DMs",
        "Te mandé info por privado, revisa 📩",
        "¡Listo! Checa tus mensajes 🚀",
        "Te escribí por privado 👇"
      ]
      const publicRepliesMasterclass = [
        "Te mandé el link por privado 🎓",
        "Enviado 📩 mira tus mensajes",
        "Te lo mandé por DM ⚡",
        "¡Listo! Revisa tus mensajes 👀"
      ]
      const randomPick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

      let commentReplyText = ""
      let selectedPublicReply = ""

      if (isAmbassadorComment) {
        commentReplyText = `¡Qué bueno que te motivaste para ser embajador/a! 🚀 ¿Me puedes decir tu nombre para crear tu código de descuento?`
        selectedPublicReply = "Enviado, ¿te llegó?"

        try {
          await supabase.from("chat_followup_states").upsert({
            session_id: igUserId,
            channel: "instagram",
            status: "ambassador_awaiting_name",
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })

          if (username && username !== "user") {
            await supabase.from("chat_followup_states").upsert({
              session_id: username,
              channel: "instagram",
              status: "ambassador_awaiting_name",
              updated_at: new Date().toISOString()
            }, { onConflict: "session_id" })
          }
        } catch (e) {
          console.error("Failed saving ambassador state on comment:", e)
        }

      } else if (isMasterclassComment) {
        commentReplyText = `¡Acá están las grabaciones de las masterclass, te van a volar la cabeza! 🎓\n\nwww.javiermujica.com/deeplink/masterclass`
        selectedPublicReply = randomPick(publicRepliesMasterclass)

        // Reset any stale ambassador/paused state since this is a fresh intent
        try {
          await supabase.from("chat_followup_states").upsert({
            session_id: igUserId,
            channel: "instagram",
            status: "active",
            paused_until: null,
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })
        } catch (_) {}

      } else {
        // Generic comment: warm welcome DM, no links yet, starts conversational flow
        const genericWelcomes = [
          `¡Hola ${username}! 👋\n\nCuéntame en qué andas y vemos cómo la IA puede ayudarte 🚀`,
          `¡Qué bueno verte por acá, ${username}! 🙌\n\nCuéntame de tu negocio o proyecto y vemos si te puedo dar una mano 👇`,
          `¡Hola ${username}! ⚡\n\nCuéntame en qué estás y charlamos 🚀`
        ]
        commentReplyText = randomPick(genericWelcomes)
        selectedPublicReply = randomPick(publicRepliesGeneric)

        // Reset any stale ambassador/paused state so DM conversation starts fresh
        try {
          await supabase.from("chat_followup_states").upsert({
            session_id: igUserId,
            channel: "instagram",
            status: "active",
            paused_until: null,
            updated_at: new Date().toISOString()
          }, { onConflict: "session_id" })
        } catch (_) {}
      }

      // Save bot message to history DB
      await supabase.from("instagram_messages").insert({
        ig_sid: igUserId,
        sender: "bot",
        message: commentReplyText
      })

      const primaryHost = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
      const fallbackHost = primaryHost === "graph.instagram.com" ? "graph.facebook.com" : "graph.instagram.com"

      // Send Private DM Reply associated to the Instagram Comment
      try {
        BOT_LAST_SENT_TIMES.set(igUserId, Date.now())
        console.log(`📤 Sending private reply to comment ${commentId} for user ${username}`)
        let sendRes = await fetch(
          `https://${primaryHost}/v18.0/me/messages?access_token=${accessToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { comment_id: commentId },
              message: { text: commentReplyText }
            })
          }
        )

        if (!sendRes.ok) {
          const errBody = await sendRes.text()
          console.warn(`⚠️ Private comment reply via ${primaryHost} failed (${sendRes.status}): ${errBody}. Trying fallback ${fallbackHost}...`)
          sendRes = await fetch(
            `https://${fallbackHost}/v18.0/me/messages?access_token=${accessToken}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipient: { comment_id: commentId },
                message: { text: commentReplyText }
              })
            }
          )
        }

        if (sendRes.ok) {
          console.log(`✅ Successfully sent private reply to comment ${commentId}`)

          const publicReplyText = isAmbassadorComment ? "Enviado, ¿te llegó?" : selectedPublicReply
          const encodedMessage = encodeURIComponent(publicReplyText)

          try {
            let publicReplyRes = await fetch(
              `https://${primaryHost}/v18.0/${commentId}/replies?message=${encodedMessage}&access_token=${accessToken}`,
              { method: "POST" }
            )

            if (!publicReplyRes.ok) {
              publicReplyRes = await fetch(
                `https://${fallbackHost}/v18.0/${commentId}/replies?message=${encodedMessage}&access_token=${accessToken}`,
                { method: "POST" }
              )
            }

            if (publicReplyRes.ok) {
              console.log(`✅ Successfully posted public reply to comment ${commentId}: "${publicReplyText}"`)
            } else {
              console.error("❌ Error posting public reply comment:", await publicReplyRes.text())
            }
          } catch (pubErr) {
            console.error("❌ Exception posting public reply comment:", pubErr)
          }
        } else {
          console.error("❌ Error sending private reply to comment:", await sendRes.text())
        }
      } catch (err) {
        console.error("❌ Exception sending private comment reply:", err)
      }
    }
  }
}
