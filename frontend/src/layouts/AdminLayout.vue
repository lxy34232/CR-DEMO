<template>
  <el-container class="admin-layout" style="height: 100vh;">
    <!-- Sidebar -->
    <el-aside width="220px" class="sidebar">
      <div class="logo-area">
        <div class="logo-text">
          <div class="logo-title">评审管理系统</div>
          <div class="logo-sub">管理员端</div>
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        background-color="#001529"
        text-color="#ffffffa0"
        active-text-color="#ffffff"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>
        <el-menu-item index="/admin/reports">
          <el-icon><Document /></el-icon>
          <template #title>报告管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <el-header class="header" height="56px">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>管理员</el-breadcrumb-item>
            <el-breadcrumb-item v-if="breadcrumb">{{ breadcrumb }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag type="danger" effect="plain" size="small">管理员</el-tag>
          <el-divider direction="vertical" />
          <el-dropdown @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :size="32" style="background: #ff4d4f;">管</el-avatar>
              <span style="margin-left:8px;">{{ auth.user?.contactPerson }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                <el-dropdown-item command="reset" :icon="RefreshLeft" divided>重置演示数据</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { SwitchButton, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()
dataStore.init()

const activeMenu = computed(() => route.path)

const breadcrumb = computed(() => {
  const map = {
    '/admin/dashboard': '数据看板',
    '/admin/reports': '报告管理',
  }
  return map[route.path] || (route.params.id ? '报告详情' : '')
})

function handleCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  } else if (cmd === 'reset') {
    ElMessageBox.confirm('确定要重置所有演示数据吗？此操作将恢复初始状态。', '重置演示数据', {
      type: 'warning'
    }).then(() => {
      dataStore.resetToDemo()
      ElMessage.success('演示数据已重置')
      router.push('/admin/dashboard')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.admin-layout { background: #f0f2f5; }

.sidebar {
  background: #001529;
  overflow-y: auto;
}

.logo-area {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #ffffff15;
}

.logo-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.logo-sub {
  font-size: 11px;
  color: #ffffff60;
}

.sidebar-menu { border-right: none; }

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
  font-size: 13px;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}
</style>
