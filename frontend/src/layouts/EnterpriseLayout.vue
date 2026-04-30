<template>
  <el-container class="enterprise-layout" style="height: 100vh;">
    <!-- Sidebar -->
    <el-aside :width="collapse ? '64px' : '240px'" class="sidebar">
      <div class="logo-area">
        <el-icon v-if="collapse" size="28" color="#fff"><Train /></el-icon>
        <div v-else class="logo-text">
          <div class="logo-title">填报系统</div>
          <div class="logo-sub">企业端</div>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="collapse"
        background-color="#001529"
        text-color="#ffffffa0"
        active-text-color="#ffffff"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/enterprise/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        <el-sub-menu index="modules">
          <template #title>
            <el-icon><FolderOpened /></el-icon>
            <span>填报模块</span>
          </template>
          <el-menu-item
            v-for="mod in MODULE_LIST"
            :key="mod.code"
            :index="getModuleRoute(mod.code)"
            class="module-menu-item"
          >
            <div class="module-item-content">
              <span class="module-label">{{ mod.code.split('_')[1] }}. {{ mod.name }}</span>
              <el-icon v-if="isModuleDone(mod.code)" color="#52c41a" size="14"><CircleCheck /></el-icon>
              <el-icon v-else color="#faad14" size="14"><Clock /></el-icon>
            </div>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <!-- Header -->
      <el-header class="header" height="56px">
        <div class="header-left">
          <el-button :icon="collapse ? 'Expand' : 'Fold'" text @click="collapse = !collapse" size="large" />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/enterprise/dashboard' }">工作台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentModuleName">{{ currentModuleName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag type="success" effect="plain" size="small">
            {{ report?.status === 'submitted' ? '已提交' : report?.status === 'revision' ? '待修改' : '草稿' }}
          </el-tag>
          <el-divider direction="vertical" />
          <el-icon size="16"><Building /></el-icon>
          <span class="company-name">{{ auth.user?.companyName }}</span>
          <el-divider direction="vertical" />
          <el-dropdown @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :size="32" style="background: #1677ff;">{{ auth.user?.contactPerson?.[0] || '企' }}</el-avatar>
              <span style="margin-left:8px;">{{ auth.user?.contactPerson }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Content -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { MODULE_LIST } from '@/utils/moduleConfig'
import { SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()
dataStore.init()

const collapse = ref(false)

const report = computed(() => dataStore.getReportById(auth.user?.reportId))

const activeMenu = computed(() => route.path)

const currentModuleName = computed(() => {
  const code = route.params.code
  if (!code) return ''
  const mod = MODULE_LIST.find(m => m.code === `module_${code}`)
  return mod ? mod.name : ''
})

function getModuleRoute(code) {
  const num = code.split('_')[1]
  if (num === '01') return '/enterprise/module/01'
  return `/enterprise/module/${num}`
}

function isModuleDone(code) {
  return report.value?.moduleCompletion?.[code] || false
}

function handleCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.enterprise-layout { background: #f0f2f5; }

.sidebar {
  background: #001529;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s;
}

.logo-area {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ffffff15;
  padding: 0 16px;
  overflow: hidden;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.logo-sub {
  font-size: 11px;
  color: #ffffff60;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.module-menu-item :deep(.el-menu-item) {
  padding-left: 48px !important;
  height: 36px;
  line-height: 36px;
  font-size: 12px;
}

.module-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
}

.module-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #595959;
}

.company-name {
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
  font-size: 13px;
}

.main-content {
  padding: 16px;
  overflow-y: auto;
}
</style>
