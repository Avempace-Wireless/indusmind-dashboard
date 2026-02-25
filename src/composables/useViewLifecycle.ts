/**
 * useViewLifecycle - Controls API call lifecycle per view
 *
 * Problem: When navigating between views, in-flight API calls from the previous
 * view continue executing, causing unnecessary backend load and ThingsBoard
 * API queue buildup (70+ queued calls draining 4 at a time).
 *
 * Solution: Provides an `isActive` flag and AbortController that views can use
 * to guard async chains and cancel in-flight fetch requests on unmount.
 *
 * Usage:
 *   const { isActive, signal, guard } = useViewLifecycle()
 *
 *   onMounted(async () => {
 *     await fetchData1()
 *     if (!guard()) return   // Bail out if unmounted during fetchData1
 *     await fetchData2()
 *   })
 *
 *   // In interval callbacks:
 *   setInterval(() => {
 *     if (!isActive.value) return  // Don't fire new requests if unmounted
 *     fetchDataSilently()
 *   }, 15000)
 */
import { ref, onUnmounted } from 'vue'

export function useViewLifecycle() {
  const isActive = ref(true)
  const controller = new AbortController()

  onUnmounted(() => {
    isActive.value = false
    controller.abort()
  })

  /**
   * Guard function - call after each await to bail out if component was unmounted.
   * Returns true if still active (safe to continue), false if unmounted.
   */
  function guard(): boolean {
    return isActive.value
  }

  return {
    /** Reactive flag: true while the component is mounted, false after unmount */
    isActive,
    /** AbortSignal: pass to fetch() calls to cancel them on unmount */
    signal: controller.signal,
    /** Guard function: returns false if component was unmounted during an await */
    guard,
  }
}
