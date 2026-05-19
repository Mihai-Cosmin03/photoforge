import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../config.js'

export function useSocket(token) {
  const socketRef = useRef(null)
  const [socketInstance, setSocketInstance] = useState(null)

  useEffect(() => {
    if (!token) return

    const socket = io(`${API_URL}/conversations`, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket
    setSocketInstance(socket)

    return () => {
      socket.disconnect()
      socketRef.current = null
      setSocketInstance(null)
    }
  }, [token])

  return { socketRef, socket: socketInstance }
}
