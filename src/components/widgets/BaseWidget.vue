<template>
  <div class="base-widget" :class="widgetClasses">
    <!-- Loading State -->
    <div v-if="isLoading && !hasData" class="widget-loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingText || 'Chargement...' }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError && !hasData" class="widget-error">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ errorText || error?.message || 'Erreur de chargement' }}</p>
      <button v-if="showRetry" @click="handleRetry" class="retry-button">
        Réessayer
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty && !hasData" class="widget-empty">
      <div class="empty-icon">📊</div>
      <p class="empty-text">{{ emptyText || 'Aucune donnée disponible' }}</p>
    </div>

    <!-- Content -->
    <div v-else class="widget-content">
      <!-- Optional header -->
      <div v-if="showHeader" class="widget-header">
        <div class="widget-title-section">
          <span v-if="icon" class="widget-icon">{{ icon }}</span>
          <h3 v-if="title" class="widget-title">{{ title }}</h3>
        </div>
        <div class="widget-actions">
          <button
            v-if="showRefresh"
            @click="handleRefresh"
            class="action-button"
            :class="{ 'refreshing': isRefreshing }"
            :disabled="isRefreshing"
          >
            🔄
          </button>
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Main content slot -->
      <div class="widget-body">
        <slot :data="data" :loading="isLoading" :error="error"></slot>
      </div>

      <!-- Optional footer -->
      <div v-if="$slots.footer" class="widget-footer">
        <slot name="footer"></slot>
      </div>

      <!-- Loading overlay for refresh -->
      <div v-if="isLoading && hasData" class="widget-loading-overlay">
        <div class="loading-spinner small"></div>
      </div>
    </div>

    <!-- Optional metadata (last updated, cached indicator) -->
    <div v-if="showMetadata && fetchedAt" class="widget-metadata">
      <span class="metadata-item">
        <span class="metadata-label">Mis à jour:</span>
        <span class="metadata-value">{{ formatTimestamp(fetchedAt) }}</span>
      </span>
      <span v-if="cached" class="metadata-item cached">
        <span class="cache-indicator">📦</span>
        <span class="metadata-value">En cache</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WidgetConfig, TransformContext } from '@/types/widgetRegistry'
import { useWidgetData } from '@/composables/useWidgetData'

interface Props {
  /** Widget configuration from registry */
  widget: WidgetConfig

  /** Device UUID */
  deviceUUID: string

  /** Additional context */
  context?: TransformContext

  /** Widget title (overrides config) */
  title?: string

  /** Widget icon */
  icon?: string

  /** Show header section */
  showHeader?: boolean

  /** Show refresh button */
  showRefresh?: boolean

  /** Show retry button on error */
  showRetry?: boolean

  /** Show metadata footer */
  showMetadata?: boolean

  /** Enable auto-refresh */
  autoRefresh?: boolean

  /** Refresh interval in ms */
  refreshInterval?: number

  /** Custom loading text */
  loadingText?: string

  /** Custom error text */
  errorText?: string

  /** Custom empty text */
  emptyText?: string

  /** Additional CSS classes */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showRefresh: true,
  showRetry: true,
  showMetadata: false,
  autoRefresh: false,
  refreshInterval: 5 * 60 * 1000
})

// Use widget data composable
const {
  loading,
  error,
  data,
  fetchedAt,
  cached,
  isLoading,
  hasError,
  hasData,
  isEmpty,
  refresh
} = useWidgetData({
  widget: props.widget,
  deviceUUID: props.deviceUUID,
  context: props.context,
  autoRefresh: props.autoRefresh,
  refreshInterval: props.refreshInterval,
  immediate: true
})

// Local state for refresh animation
const isRefreshing = ref(false)

// Widget CSS classes
const widgetClasses = computed(() => ({
  [`widget-${props.widget.type}`]: true,
  [`widget-${props.widget.id}`]: true,
  'widget-loading-state': isLoading.value,
  'widget-error-state': hasError.value,
  'widget-empty-state': isEmpty.value,
  [props.customClass || '']: !!props.customClass
}))

/**
 * Handle refresh button click
 */
const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await refresh()
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500) // Show animation for at least 500ms
  }
}

/**
 * Handle retry button click
 */
const handleRetry = async () => {
  await refresh()
}

/**
 * Format timestamp for display
 */
const formatTimestamp = (ts: number): string => {
  const date = new Date(ts)
  const now = Date.now()
  const diff = now - ts

  // Less than 1 minute
  if (diff < 60000) {
    return 'À l\'instant'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `Il y a ${minutes} min`
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `Il y a ${hours}h`
  }

  // Format as time
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.base-widget {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Loading State */
.widget-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Error State */
.widget-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 200px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

/* Empty State */
.widget-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 200px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Content */
.widget-content {
  position: relative;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.widget-title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-icon {
  font-size: 1.25rem;
}

.widget-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.widget-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.action-button.refreshing {
  animation: spin 0.8s linear infinite;
  pointer-events: none;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.widget-body {
  padding: 1.25rem;
}

.widget-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.widget-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Metadata */
.widget-metadata {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1.25rem;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  font-size: 0.75rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
}

.metadata-item.cached {
  color: #059669;
}

.metadata-label {
  font-weight: 500;
}

.cache-indicator {
  font-size: 0.875rem;
}
</style>
