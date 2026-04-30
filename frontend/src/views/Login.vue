<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-pattern"></div>
    </div>
    <div class="login-container">
      <!-- Left Panel -->
      <div class="left-panel">
        <div class="system-info">
          <div class="system-logo">🚄</div>
          <h1 class="system-title">企业基本情况<br/>报告填报系统</h1>
          <p class="system-desc">铁路行业产品认证评审数字化平台<br/>支持14个核心业务模块在线填报与审核</p>
          <div class="feature-list">
            <div class="feature-item" v-for="f in features" :key="f.text">
              <el-icon :color="f.color"><component :is="f.icon" /></el-icon>
              <span>{{ f.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="right-panel">
        <div class="login-card">
          <h2 class="login-title">用户登录</h2>
          <p class="login-subtitle">请选择角色并使用演示账号登录</p>

          <!-- Role Selection -->
          <div class="role-tabs">
            <div
              class="role-tab"
              :class="{ active: selectedRole === 'enterprise' }"
              @click="selectRole('enterprise')"
            >
              <el-icon size="20"><OfficeBuilding /></el-icon>
              <span>企业填报</span>
            </div>
            <div
              class="role-tab"
              :class="{ active: selectedRole === 'admin' }"
              @click="selectRole('admin')"
            >
              <el-icon size="20"><UserFilled /></el-icon>
              <span>管理员</span>
            </div>
          </div>

          <!-- Demo Account Hint -->
          <el-alert type="info" :closable="false" class="demo-hint">
            <template #title>
              <span v-if="selectedRole === 'enterprise'">
                演示账号：<strong>enterprise</strong> / <strong>demo123</strong>
              </span>
              <span v-else>
                演示账号：<strong>admin</strong> / <strong>admin123</strong>
              </span>
            </template>
          </el-alert>

          <!-- Login Form -->
          <el-form :model="form" :rules="rules" ref="formRef" label-position="top" @submit.prevent="handleLogin">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                clearable
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              style="width: 100%; margin-top: 8px;"
            >
              登录
            </el-button>
          </el-form>

          <div class="quick-login">
            <span class="quick-label">快速登录：</span>
            <el-button link type="primary" @click="quickLogin('enterprise')">企业端演示</el-button>
            <el-divider direction="vertical" />
            <el-button link type="primary" @click="quickLogin('admin')">管理员演示</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()
dataStore.init()

const selectedRole = ref('enterprise')
const loading = ref(false)
const formRef = ref()

const form = reactive({ username: 'enterprise', password: 'demo123' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const features = [
  { icon: 'DocumentChecked', color: '#52c41a', text: '14个核心模块在线填报' },
  { icon: 'DataAnalysis', color: '#1677ff', text: '实时数据统计与可视化' },
  { icon: 'UserFilled', color: '#722ed1', text: '企业与管理员双端协作' },
  { icon: 'Shield', color: '#fa8c16', text: '数据安全存储与权限管控' },
]

function selectRole(role) {
  selectedRole.value = role
  if (role === 'enterprise') {
    form.username = 'enterprise'
    form.password = 'demo123'
  } else {
    form.username = 'admin'
    form.password = 'admin123'
  }
}

function quickLogin(role) {
  selectRole(role)
  handleLogin()
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch { return }

  loading.value = true
  await new Promise(r => setTimeout(r, 500)) // Simulate network
  const result = auth.login(form.username, form.password)
  loading.value = false

  if (result.success) {
    ElMessage.success('登录成功')
    if (auth.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/enterprise/dashboard')
    }
  } else {
    ElMessage.error(result.message)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #003a8c 50%, #0958d9 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 580px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #0958d9 0%, #001d6c 100%);
  padding: 50px 40px;
  display: flex;
  align-items: center;
  color: #fff;
}

.system-logo {
  font-size: 56px;
  margin-bottom: 20px;
}

.system-title {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 16px;
}

.system-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  line-height: 1.8;
  margin-bottom: 30px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255,255,255,0.85);
}

.right-panel {
  width: 420px;
  background: #fff;
  padding: 50px 40px;
  display: flex;
  align-items: center;
}

.login-card { width: 100%; }

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 24px;
}

.role-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.role-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #8c8c8c;
  transition: all 0.2s;
}

.role-tab.active {
  border-color: #1677ff;
  color: #1677ff;
  background: #e6f4ff;
}

.role-tab:hover:not(.active) {
  border-color: #bfbfbf;
  color: #595959;
}

.demo-hint {
  margin-bottom: 20px;
  font-size: 13px;
}

.quick-login {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 13px;
  color: #8c8c8c;
}

.quick-label { margin-right: 4px; }

@media (max-width: 640px) {
  .left-panel { display: none; }
  .right-panel { width: 100%; }
}
</style>
