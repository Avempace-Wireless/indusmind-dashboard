<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    fill="none"
  >
    <!-- Ammeter circle (gauge) -->
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />

    <!-- Letter "A" for Ampere inside -->
    <path
      d="M9 16 L12 8 L15 16 M10 14 H14"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Needle/indicator at top -->
    <line x1="12" y1="5" x2="12" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />

    <!-- Scale marks -->
    <line x1="5.5" y1="8" x2="4" y2="7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
    <line x1="18.5" y1="8" x2="20" y2="7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>
</template>
