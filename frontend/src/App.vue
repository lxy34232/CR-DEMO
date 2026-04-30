<template>
  <router-view />
</template>

<script setup></script>

<style>
:root {
  --sidebar-bg: #001529;
  --sidebar-width: 240px;
  --header-height: 56px;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f0f2f5;
  color: #262626;
}

.el-menu--collapse { width: 64px; }

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
</style>
