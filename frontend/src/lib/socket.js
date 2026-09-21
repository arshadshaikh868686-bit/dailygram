import { io } from 'socket.io-client'

let socket
export const getSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || undefined
    socket = io(url, { transports: ['websocket', 'polling'] })
  }
  return socket
}
export const closeSocket = () => { if (socket) { socket.disconnect(); socket = undefined } }
