<template>
  <aside
    :class="[
      'fixed  flex flex-col mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'xl:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'xl:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'xl:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="['pt-8 pb-7 flex', !isExpanded && !isHovered ? 'xl:justify-center' : 'justify-start']"
    >
      <router-link to="/">
        <div v-if="isExpanded || isHovered || isMobileOpen" class="flex items-center gap-2 w-full pr-2">
          <img class="h-8 w-8 flex-shrink-0 object-contain" src="/images/logo/Indusmind_logo.png" alt="IndusMind Energy" />
          <div class="flex items-baseline gap-1 min-w-0">
            <span class="text-[16px] leading-none font-bold tracking-tight text-gray-900 dark:text-white truncate">IndusMind</span>
            <span class="text-[11px] leading-none font-semibold uppercase text-primary-600 dark:text-primary-400 truncate">Energy</span>
          </div>
        </div>
        <img v-else class="h-8 w-8 object-contain" src="/images/logo/Indusmind_logo.png" alt="IndusMind Energy" />
      </router-link>
    </div>
    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex items-center leading-[20px] gap-2',
                menuGroup.comingSoon ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600' : 'text-gray-400',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                <span>{{ menuGroup.title }}</span>
                <span
                  v-if="menuGroup.comingSoon"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 ml-auto"
                  >{{ t('sidebar.comingSoon') }}</span
                >
              </template>
              <MoreDots v-else />
            </h2>
            <ul class="flex flex-col gap-1">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered ? 'xl:justify-center' : 'xl:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>

                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text flex items-center gap-2"
                  >
                    {{ item.name }}
                    <span
                      class="absolute right-10"
                      v-if="item.new"
                      :class="[
                        'menu-dropdown-badge',
                        {
                          'menu-dropdown-badge-active': isActive(item),
                          'menu-dropdown-badge-inactive': !isActive(item),
                        },
                      ]"
                      >new</span
                    >
                  </span>

                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      { 'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index) },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path && !item.disabled"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text flex items-center gap-2"
                  >
                    {{ item.name }}
                    <span
                      v-if="item.new"
                      class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-500 text-white"
                      >new</span
                    >
                  </span>
                </router-link>
                <div
                  v-else-if="item.path && item.disabled"
                  :class="[
                    'menu-item group opacity-50 cursor-not-allowed',
                    'menu-item-inactive text-gray-400 dark:text-gray-600',
                  ]"
                >
                  <span class="menu-item-icon-inactive">
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text flex items-center gap-2"
                  >
                    {{ item.name }}
                  </span>
                </div>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) && (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path),
                              'menu-dropdown-item-inactive': !isActive(subItem.path),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge-pro',
                                {
                                  'menu-dropdown-badge-pro-active': isActive(subItem.path),
                                  'menu-dropdown-badge-pro-inactive': !isActive(subItem.path),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
<!--       <SidebarWidget v-if="isExpanded || isHovered || isMobileOpen" /> -->
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import {
  CartIcon,
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  TaskIcon,
  ChatIcon,
  MailIcon,
  PieChartIcon,
  ChevronDownIcon,
  PageIcon,
  TableIcon,
  ListIcon,
  PlugInIcon,
  MoreDots,
  BotIcon,
  CallIcon,
  BellIcon,
  BarChartIcon,
  BoxIcon,
  SettingsIcon,
} from '../../icons'
import SidebarWidget from './SidebarWidget.vue'
import BoxCubeIcon from '@/icons/BoxCubeIcon.vue'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar()

const { t } = useI18n()

const menuGroups = computed(() => [
  {
    title: t('sidebar.monitoring'),
    items: [
      {
        icon: GridIcon,
        name: t('sidebar.dashboard'),
        path: '/dashboard',
      },
      {
        icon: BarChartIcon,
        name: t('sidebar.puissance'),
        path: '/puissance',
      },
      {
        icon: CalenderIcon,
        name: t('sidebar.history'),
        path: '/history',
      },
      {
        icon: BarChartIcon,
        name: t('sidebar.comparison'),
        path: '/comparison',
      },
      {
        icon: SettingsIcon,
        name: t('sidebar.thermalManagement'),
        path: '/thermal-management',
      },
    ],
  },
  {
    title: t('sidebar.analysis') + ' & ' + t('sidebar.reports'),
    comingSoon: true,
    items: [
      {
        icon: CartIcon,
        name: t('sidebar.electricalConsumption'),
        path: '/consumption',
        disabled: true,
      },
      {
        icon: PieChartIcon,
        name: t('sidebar.baseLoad'),
        path: '/base-load',
        disabled: true,
      },
      {
        icon: CartIcon,
        name: t('sidebar.costAnalysis'),
        path: '/cost-analysis',
        disabled: true,
      },
       {
        icon: PageIcon,
        name: t('sidebar.reportsView'),
        path: '/reports',
        disabled: true,
      }
    ]
  },
  {
    title: t('sidebar.equipment'),
    comingSoon: true,
    items: [
      {
        icon: BoxIcon,
        name: t('sidebar.equipment'),
        path: '/equipment',
        disabled: true,
      },

/*       {
        icon: PlugInIcon,
        name: t('sidebar.maintenance'),
        path: '/maintenance',
        disabled: true,
        comingSoon: true,
      }, */
    ],
  },
/*   {
    title: t('sidebar.reports'),
    items: [
      {
        icon: PageIcon,
        name: t('sidebar.reportsView'),
        path: '/reports',
        disabled: true,
        comingSoon: true,
      },
    ],
  }, */
  {
    title: t('sidebar.alerts'),
    comingSoon: true,
    items: [
      {
        icon: BellIcon,
        name: t('sidebar.alertsView'),
        path: '/alerts',
        disabled: true,
      },
      {
        icon: TaskIcon,
        name: t('sidebar.alertRules'),
        path: '/alert-config',
        disabled: true,
      },
    ],
  }
])

const isActive = (path) => route.path === path

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`
  openSubmenu.value = openSubmenu.value === key ? null : key
}

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.value.some((group) =>
    group.items.some(
      (item) => item.subItems && item.subItems.some((subItem) => isActive(subItem.path)),
    ),
  )
})

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups.value[groupIndex].items[itemIndex].subItems?.some((subItem) => isActive(subItem.path)))
  )
}

const startTransition = (el) => {
  el.style.height = 'auto'
  const height = el.scrollHeight
  el.style.height = '0px'
  el.offsetHeight // force reflow
  el.style.height = height + 'px'
}

const endTransition = (el) => {
  el.style.height = ''
}
</script>
