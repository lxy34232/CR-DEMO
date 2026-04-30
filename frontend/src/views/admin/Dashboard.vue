<template>
  <div class="admin-dashboard">
    <div class="page-title">数据看板</div>
    <div class="page-sub">企业报告申请总览 · 实时更新</div>

    <!-- Summary Stats -->
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="never" class="stat-card" :style="{ borderTop: `3px solid ${stat.color}` }">
          <div class="stat-num" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <!-- Status Distribution -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span class="card-header-title">📊 报告状态分布</span></template>
          <div class="status-chart">
            <div v-for="item in statusDistribution" :key="item.status" class="status-row">
              <div class="status-info">
                <el-tag :type="item.type" size="small">{{ item.label }}</el-tag>
                <span class="status-count">{{ item.count }} 份</span>
              </div>
              <el-progress
                :percentage="total ? Math.round((item.count / total) * 100) : 0"
                :color="item.color"
                :stroke-width="10"
                style="flex: 1; margin-left: 12px;"
                :show-text="false"
              />
              <span class="status-pct">{{ total ? Math.round((item.count / total) * 100) : 0 }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Recent Submissions -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header-row">
              <span class="card-header-title">📋 最近提交</span>
              <el-button link type="primary" @click="router.push('/admin/reports')">查看全部</el-button>
            </div>
          </template>
          <div v-if="recentReports.length === 0" class="empty-state">暂无提交记录</div>
          <div v-for="r in recentReports" :key="r.id" class="recent-item" @click="router.push(`/admin/reports/${r.id}`)">
            <div class="recent-info">
              <div class="recent-company">{{ r.companyName }}</div>
              <div class="recent-date">{{ r.submittedAt ? formatDate(r.submittedAt) : '—' }}</div>
            </div>
            <el-tag :type="dataStore.getStatusType(r.status)" size="small">
              {{ dataStore.getStatusLabel(r.status) }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Module Completion Heatmap -->
    <el-card shadow="never">
      <template #header><span class="card-header-title">🗺️ 模块完成情况热力图（所有已提交报告）</span></template>
      <div class="heatmap">
        <div class="heatmap-header">
          <div class="heatmap-company-col">企业</div>
          <div v-for="mod in MODULE_LIST" :key="mod.code" class="heatmap-mod-header">
            <el-tooltip :content="mod.name" placement="top">
              <span>{{ mod.code.split('_')[1] }}</span>
            </el-tooltip>
          </div>
          <div class="heatmap-total">完成率</div>
        </div>
        <div v-for="r in submittedReports" :key="r.id" class="heatmap-row">
          <div class="heatmap-company" :title="r.companyName">{{ r.companyName.slice(0, 8) }}...</div>
          <div
            v-for="mod in MODULE_LIST"
            :key="mod.code"
            class="heatmap-cell"
            :class="r.moduleCompletion?.[mod.code] ? 'done' : 'todo'"
            :title="mod.name + ': ' + (r.moduleCompletion?.[mod.code] ? '已完成' : '未完成')"
          >
            <el-icon v-if="r.moduleCompletion?.[mod.code]" size="12"><Check /></el-icon>
            <span v-else>·</span>
          </div>
          <div class="heatmap-total">
            <el-progress
              :percentage="dataStore.getCompletionPercent(r)"
              :stroke-width="8"
              :show-text="true"
              style="min-width: 80px;"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { MODULE_LIST } from '@/utils/moduleConfig'

const router = useRouter()
const dataStore = useDataStore()

const allReports = computed(() => dataStore.allReports)
const submittedReports = computed(() => allReports.value.filter(r => r.status !== 'draft'))
const total = computed(() => allReports.value.length)

const stats = computed(() => [
  { label: '报告总数', value: allReports.value.length, color: '#1677ff' },
  { label: '已提交', value: allReports.value.filter(r => r.status === 'submitted').length, color: '#52c41a' },
  { label: '待修改', value: allReports.value.filter(r => r.status === 'revision').length, color: '#fa8c16' },
  { label: '草稿中', value: allReports.value.filter(r => r.status === 'draft').length, color: '#8c8c8c' },
])

const statusDistribution = [
  { status: 'submitted', label: '已提交', type: 'success', color: '#52c41a',
    count: computed(() => allReports.value.filter(r => r.status === 'submitted').length).value },
  { status: 'revision', label: '待修改', type: 'warning', color: '#fa8c16',
    count: computed(() => allReports.value.filter(r => r.status === 'revision').length).value },
  { status: 'draft', label: '草稿', type: 'info', color: '#8c8c8c',
    count: computed(() => allReports.value.filter(r => r.status === 'draft').length).value },
]

const recentReports = computed(() =>
  [...allReports.value]
    .filter(r => r.submittedAt)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 4)
)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<style scoped>
.admin-dashboard {}
.page-title { font-size: 20px; font-weight: 700; color: #262626; margin-bottom: 4px; }
.page-sub { font-size: 13px; color: #8c8c8c; margin-bottom: 20px; }

.stat-card { text-align: center; padding: 8px 0; }
.stat-num { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
.stat-label { font-size: 13px; color: #8c8c8c; }

.card-header-title { font-size: 14px; font-weight: 600; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }

.status-chart { display: flex; flex-direction: column; gap: 14px; padding: 8px 0; }
.status-row { display: flex; align-items: center; gap: 8px; }
.status-info { display: flex; align-items: center; gap: 8px; min-width: 120px; }
.status-count { font-size: 13px; color: #595959; }
.status-pct { font-size: 13px; font-weight: 500; min-width: 36px; text-align: right; }

.empty-state { text-align: center; color: #bfbfbf; padding: 20px 0; }

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}
.recent-item:hover { background: #f5f9ff; }
.recent-item:last-child { border-bottom: none; }
.recent-company { font-size: 14px; font-weight: 500; color: #262626; }
.recent-date { font-size: 12px; color: #8c8c8c; margin-top: 2px; }

.heatmap { overflow-x: auto; }

.heatmap-header {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.heatmap-company-col {
  width: 90px;
  font-size: 12px;
  color: #8c8c8c;
  flex-shrink: 0;
}

.heatmap-mod-header {
  width: 32px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #595959;
  flex-shrink: 0;
}

.heatmap-row {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 6px;
}

.heatmap-company {
  width: 90px;
  font-size: 12px;
  color: #434343;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.heatmap-cell {
  width: 32px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  cursor: default;
}

.heatmap-cell.done {
  background: #d9f7be;
  color: #389e0d;
}

.heatmap-cell.todo {
  background: #fff1f0;
  color: #f5222d;
}

.heatmap-total {
  margin-left: 8px;
  font-size: 12px;
  min-width: 100px;
}
</style>
