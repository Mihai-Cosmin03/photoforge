import { useState, useEffect, useRef, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSocket } from '../hooks/useSocket'
import {
  getConversations,
  getMessages,
  startConversation,
} from '../services/conversationsService'
import { ChatIcon } from '../components/Icons'
import './Conversations.css'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000

  if (diff < 60)           return 'just now'
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7)   return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

export default function Conversations() {
  const { user, token } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const { socketRef, socket } = useSocket(token)
  const activeIdRef = useRef(null) // track active room for socket

  const [conversations, setConversations]   = useState([])
  const [activeId, setActiveId]             = useState(null)
  const [messages, setMessages]             = useState([])
  const [draft, setDraft]                   = useState('')
  const [loadingConvs, setLoadingConvs]     = useState(true)
  const [loadingMsgs, setLoadingMsgs]       = useState(false)
  const [sending, setSending]               = useState(false)
  const [mobileView, setMobileView]         = useState('list') // 'list' | 'thread'
  const [connected, setConnected]           = useState(false)

  if (!user) return <Navigate to="/login" replace />

  // ── Socket events ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onNewMessage = (msg) => {
      // Only append if it belongs to the active conversation
      if (msg.conversationId === activeIdRef.current) {
        setMessages((prev) => {
          // Avoid duplicates (replace optimistic if same content + senderId within 5s)
          const isDup = prev.some(
            (m) =>
              m.id === msg.id ||
              (String(m.id).startsWith('temp-') &&
                m.content === msg.content &&
                m.senderId === msg.senderId)
          )
          if (isDup) {
            return prev.map((m) =>
              String(m.id).startsWith('temp-') &&
              m.content === msg.content &&
              m.senderId === msg.senderId
                ? msg
                : m
            )
          }
          return [...prev, msg]
        })
      }
      // Refresh conversation list to update last message time
      loadConversations()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('newMessage', onNewMessage)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('newMessage', onNewMessage)
    }
  }, [socket])

  // ── Load conversations ─────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!token) return []
    try {
      const data = await getConversations(token)
      setConversations(data)
      return data
    } catch {
      toast.error('Failed to load conversations.')
      return []
    } finally {
      setLoadingConvs(false)
    }
  }, [token])

  useEffect(() => {
    loadConversations().then((data) => {
      const params = new URLSearchParams(location.search)
      const photoId = params.get('start')
      if (photoId && data) {
        const existing = data.find((c) => String(c.photographerId) === photoId)
        if (existing) {
          selectConversation(existing.id)
        } else {
          startConversation(token, +photoId)
            .then((conv) => {
              loadConversations().then(() => selectConversation(conv.id))
            })
            .catch(() => toast.error('Could not start conversation.'))
        }
      }
    })
  }, [token])

  // ── Select conversation ────────────────────────────────────────────────
  const selectConversation = useCallback(async (id) => {
    const socket = socketRef.current

    // Leave previous room
    if (activeIdRef.current && socket) {
      socket.emit('leaveRoom', activeIdRef.current)
    }

    setActiveId(id)
    activeIdRef.current = id
    setMobileView('thread')
    setLoadingMsgs(true)
    setMessages([])

    try {
      const msgs = await getMessages(token, id)
      setMessages(msgs)
    } catch {
      toast.error('Failed to load messages.')
    } finally {
      setLoadingMsgs(false)
    }

    // Join socket room
    if (socket) {
      socket.emit('joinRoom', id)
    }

    inputRef.current?.focus()
  }, [token])

  // ── Scroll to bottom ───────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ───────────────────────────────────────────────────────
  const handleSend = (e) => {
    e.preventDefault()
    if (!draft.trim() || !activeId || sending) return

    const content = draft.trim()
    setDraft('')

    const socket = socketRef.current

    if (socket && connected) {
      // Optimistic update
      const optimistic = {
        id: 'temp-' + Date.now(),
        content,
        senderId: user.id,
        conversationId: activeId,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])
      socket.emit('sendMessage', { conversationId: activeId, content })
    } else {
      // Fallback: HTTP
      setSending(true)
      const optimistic = {
        id: 'temp-' + Date.now(),
        content,
        senderId: user.id,
        conversationId: activeId,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])

      import('../services/conversationsService').then(({ sendMessage }) => {
        sendMessage(token, activeId, content)
          .then((saved) => {
            setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)))
            loadConversations()
          })
          .catch(() => {
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
            setDraft(content)
            toast.error('Failed to send message.')
          })
          .finally(() => setSending(false))
      })
    }

    inputRef.current?.focus()
  }

  const activeConv = conversations.find((c) => c.id === activeId)

  const getPartnerName = (conv) => {
    if (!conv) return 'Unknown'
    if (conv.userId === user?.id) return conv.photographer?.name ?? 'Photographer'
    return conv.user?.name ?? 'Client'
  }

  return (
    <div className="conversations-page">
      <div className="page-container">
        <div className="conversations-header">
          <span className="section-eyebrow">Inbox</span>
          <h1 className="section-heading">
            Messages
            {connected && (
              <span className="conv-live-dot" title="Live — connected" />
            )}
          </h1>
        </div>

        <div className="conversations-layout">
          {/* ── Left: conversation list ────────────────── */}
          <div className={`conversation-list ${mobileView === 'thread' ? 'conv-list--hidden-mobile' : ''}`}>
            <div className="conversation-list-header">
              Conversations
              {conversations.length > 0 && (
                <span className="conv-count">{conversations.length}</span>
              )}
            </div>

            {loadingConvs ? (
              <div className="conv-loading">
                {[1,2,3].map((i) => (
                  <div key={i} className="conv-skeleton-item">
                    <div className="skeleton conv-skeleton-avatar" />
                    <div className="conv-skeleton-lines">
                      <div className="skeleton conv-skeleton-line" />
                      <div className="skeleton conv-skeleton-line conv-skeleton-line--short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="conv-empty-list">
                <span><ChatIcon /></span>
                <p>No conversations yet.</p>
                <p className="conv-empty-hint">
                  Visit a photographer's profile and click "Message" to start a conversation.
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`conversation-item ${activeId === conv.id ? 'conversation-item--active' : ''}`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <div className="conversation-avatar">
                    {getPartnerName(conv)[0] ?? '?'}
                  </div>
                  <div className="conversation-info">
                    <span className="conversation-name">
                      {getPartnerName(conv)}
                    </span>
                    <span className="conversation-preview">
                      {conv.userId === user?.id ? (conv.photographer?.city ?? '') : ''}
                    </span>
                  </div>
                  <span className="conversation-time">
                    {formatTime(conv.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* ── Right: thread ──────────────────────────── */}
          <div className={`conversation-thread ${mobileView === 'list' ? 'conv-thread--hidden-mobile' : ''}`}>

            {mobileView === 'thread' && (
              <button
                className="conv-back-btn"
                onClick={() => setMobileView('list')}
              >
                ← Back
              </button>
            )}

            {!activeId ? (
              <div className="thread-empty">
                <span className="thread-empty-icon"><ChatIcon /></span>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to view your messages.</p>
              </div>
            ) : (
              <div className="thread-layout">
                <div className="thread-header">
                  <div className="conversation-avatar">
                    {getPartnerName(activeConv)[0] ?? '?'}
                  </div>
                  <div>
                    <span className="thread-header-name">
                      {getPartnerName(activeConv)}
                    </span>
                    <span className="thread-header-city">
                      {activeConv?.userId === user?.id ? (activeConv?.photographer?.city ?? '') : ''}
                    </span>
                  </div>
                  {connected && (
                    <span className="conv-live-badge">● Live</span>
                  )}
                </div>

                <div className="thread-messages">
                  {loadingMsgs ? (
                    <div className="thread-loading">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="thread-no-messages">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => {
                        const isMine = msg.senderId === user.id
                        const isOptimistic = String(msg.id).startsWith('temp-')
                        return (
                          <motion.div
                            key={msg.id}
                            className={`message-bubble ${isMine ? 'message-bubble--mine' : 'message-bubble--theirs'}`}
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <p className="message-content">{msg.content}</p>
                            <span className="message-time">
                              {isOptimistic ? 'sending…' : formatTime(msg.createdAt)}
                            </span>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={bottomRef} />
                </div>

                <form className="thread-input-row" onSubmit={handleSend}>
                  <input
                    ref={inputRef}
                    className="thread-input"
                    placeholder="Type a message…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
                    }}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="thread-send-btn"
                    disabled={!draft.trim() || sending}
                    aria-label="Send message"
                  >
                    {sending ? '…' : '↑'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
