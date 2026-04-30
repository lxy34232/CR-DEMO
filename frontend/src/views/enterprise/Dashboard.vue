<template>
  <div class="enterprise-dashboard">
    <!-- Status Banner -->
    <el-alert
      v-if="report?.status === 'revision'"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 16px;"
    >
      <template #title>报告已被退回修改</template>
      <div style="white-space: pre-line; margin-top: 8px; font-size: 13px;">{{ report.revisionNote }}</div>
    </el-alert>

    <el-alert
      v-else-if="report?.status === 'submitted'"
      type="success"
      :closable="false"
      show-icon
      title="报告已成功提交，等待评审中。如需修改请联系管理员。"
      style="margin-bottom: 16px;"
    />

    <!-- Overview Cards -->
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6f4ff;">
              <el-icon size="28" color="#1677ff"><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ completedCount }}/{{ totalCount }}</div>
              <div class="stat-label">已完成模块</div>
            </div>
          </div>
          <el-progress :percentage="completionPercent" :stroke-width="6" style="margin-top: 12px;" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f6ffed;">
              <el-icon size="28" color="#52c41a"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ report?.companyName || '—' }}</div>
              <div class="stat-label">填报企业</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fff7e6;">
              <el-icon size="28" color="#fa8c16"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                <el-tag :type="dataStore.getStatusType(report?.status)" size="large">
                  {{ dataStore.getStatusLabel(report?.status) }}
                </el-tag>
              </div>
              <div class="stat-label">当前状态</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Module Grid -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">📋 填报模块进度</span>
          <el-button
            type="primary"
            :disabled="completedCount < 1 || report?.status === 'submitted'"
            @click="handleSubmit"
          >
            {{ report?.status === 'submitted' ? '已提交' : '提交报告' }}
          </el-button>
        </div>
      </template>
      <div class="module-grid">
        <div
          v-for="mod in MODULE_LIST"
          :key="mod.code"
          class="module-card"
          :class="{ done: isModuleDone(mod.code), current: isCurrentModule(mod.code) }"
          @click="goToModule(mod)"
        >
          <div class="module-num">{{ mod.code.split('_')[1] }}</div>
          <div class="module-icon">
            <el-icon size="24"><component :is="mod.icon" /></el-icon>
          </div>
          <div class="module-name">{{ mod.name }}</div>
          <div class="module-status">
            <el-tag v-if="isModuleDone(mod.code)" type="success" size="small" round>已完成</el-tag>
            <el-tag v-else type="warning" size="small" round>待填写</el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { MODULE_LIST } from '@/utils/moduleConfig'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()

const report = computed(() => dataStore.getReportById(auth.user?.reportId))
const totalCount = MODULE_LIST.length
const completedCount = computed(() => {
  if (!report.value?.moduleCompletion) return 0
  return Object.values(report.value.moduleCompletion).filter(Boolean).length
})
const completionPercent = computed(() => Math.round((completedCount.value / totalCount) * 100))

function isModuleDone(code) {
  return report.value?.moduleCompletion?.[code] || false
}

function isCurrentModule(code) {
  // Currently active module (could be enhanced with route tracking)
  return false
}

function goToModule(mod) {
  const num = mod.code.split('_')[1]
  if (num === '01') router.push('/enterprise/module/01')
  else router.push(`/enterprise/module/${num}`)
}

function handleSubmit() {
  ElMessageBox.confirm(
    `当前已完成 ${completedCount.value}/${totalCount} 个模块。确定提交报告吗？提交后将无法修改。`,
    '确认提交',
    { type: 'warning', confirmButtonText: '确认提交', cancelButtonText: '取消' }
  ).then(() => {
    dataStore.submitReport(report.value.id)
    ElMessage.success('报告已成功提交！')
  }).catch(() => {})
}
</script>

<style scoped>
.enterprise-dashboard {}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info { flex: 1; min-width: 0; }

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.module-card {
  border: 2px solid #f0f0f0;
  border-radius: 10px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.module-card:hover {
  border-color: #1677ff;
  box-shadow: 0 4px 12px rgba(22,119,255,0.15);
  transform: translateY(-2px);
}

.module-card.done {
  border-color: #52c41a;
  background: #f6ffed;
}

.module-num {
  position: absolute;
  top: 8px;
  left: 10px;
  font-size: 11px;
  font-weight: 700;
  color: #bfbfbf;
}

.module-icon {
  color: #1677ff;
  margin-bottom: 8px;
}

.module-card.done .module-icon { color: #52c41a; }

.module-name {
  font-size: 12px;
  color: #434343;
  line-height: 1.4;
  margin-bottom: 10px;
  min-height: 34px;
}

.module-status {}
</style>
