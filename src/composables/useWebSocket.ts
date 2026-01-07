import { ref, onMounted, onUnmounted } from 'vue'
import type { WebSocketChannel, WebSocketMessage } from '@/types'

export function useWebSocket(channel: WebSocketChannel) {
  const isConnected = ref(false)
  const data = ref<any>(null)
  const error = ref<string | null>(null)
  let ws: WebSocket | null = null

  const connect = () => {
    try {
      const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000'
      ws = new WebSocket(`${baseUrl}/${channel}`)

      ws.onopen = () => {
        isConnected.value = true
        error.value = null
        console.log(`Connected to ${channel}`)
      }

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          data.value = message.data
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      ws.onerror = () => {
        error.value = 'WebSocket connection error'
        isConnected.value = false
      }

      ws.onclose = () => {
        isConnected.value = false
        // Attempt reconnect after 3 seconds
        setTimeout(connect, 3000)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Connection failed'
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  const send = (payload: any) => {
    if (ws && isConnected.value) {
      ws.send(JSON.stringify(payload))
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    data,
    error,
    send,
    disconnect,
  }
}
