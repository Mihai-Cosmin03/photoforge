import { API_URL } from '../config.js'

const API = `${API_URL}/conversations`

const h = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const getConversations = async (token) => {
  const res = await fetch(API, { headers: h(token) })
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export const startConversation = async (token, photographerId) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify({ photographerId }),
  })
  if (!res.ok) throw new Error('Failed to start conversation')
  return res.json()
}

export const getMessages = async (token, conversationId) => {
  const res = await fetch(`${API}/${conversationId}/messages`, {
    headers: h(token),
  })
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

export const sendMessage = async (token, conversationId, content) => {
  const res = await fetch(`${API}/${conversationId}/messages`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}
