<template>
  <div class="report-detail">
    <!-- Not Found -->
    <el-result v-if="!report" icon="404" title="报告不存在" sub-title="未找到对应的报告记录">
      <template #extra>
        <el-button @click="router.push('/admin/reports')">返回列表</el-button>
      </template>
    </el-result>

    <template v-else>
      <!-- Breadcrumb & Actions -->
      <div class="detail-header">
        <div>
          <el-button link @click="router.push('/admin/reports')" :icon="ArrowLeft">报告列表</el-button>
          <h2 class="detail-title">{{ report.companyName }}</h2>
          <div class="detail-meta">
            报告编号：{{ report.id }} ·
            <el-tag :type="dataStore.getStatusType(report.status)" size="small">{{ dataStore.getStatusLabel(report.status) }}</el-tag>
            · 提交时间：{{ report.submittedAt ? formatDate(report.submittedAt) : '未提交' }}
          </div>
        </div>
        <div class="detail-actions">
          <el-button
            v-if="report.status === 'submitted'"
            type="warning"
            @click="sendRevision"
          >退回修改</el-button>
          <el-button
            v-if="report.status === 'submitted'"
            type="success"
            @click="approveReport"
          >批准报告</el-button>
          <el-button @click="router.push('/admin/reports')">返回列表</el-button>
        </div>
      </div>

      <!-- Revision Note -->
      <el-alert
        v-if="report.revisionNote"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 16px;"
      >
        <template #title>退回修改意见</template>
        <div style="white-space: pre-line; margin-top: 8px;">{{ report.revisionNote }}</div>
      </el-alert>

      <!-- Module Tabs -->
      <el-tabs v-model="activeTab" type="card">
        <!-- Module 01: Overview -->
        <el-tab-pane label="01 企业概况" name="module_01">
          <template v-if="report.moduleData?.module_01">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="企业名称（中文）">{{ d01.companyNameCn }}</el-descriptions-item>
              <el-descriptions-item label="企业名称（英文）">{{ d01.companyNameEn || '—' }}</el-descriptions-item>
              <el-descriptions-item label="统一社会信用代码">{{ d01.creditCode }}</el-descriptions-item>
              <el-descriptions-item label="注册资本（万元）">{{ d01.registeredCapital }}</el-descriptions-item>
              <el-descriptions-item label="营业执照发证机关">{{ d01.licenseAuthority || '—' }}</el-descriptions-item>
              <el-descriptions-item label="营业执照有效期">{{ d01.licenseValidity || '—' }}</el-descriptions-item>
              <el-descriptions-item label="企业性质">{{ arrToStr(d01.companyNature) }}</el-descriptions-item>
              <el-descriptions-item label="行业类别">{{ arrToStr(d01.industry) }}</el-descriptions-item>
              <el-descriptions-item label="年审情况">{{ d01.annualCheck }}</el-descriptions-item>
              <el-descriptions-item label="职工总人数">{{ d01.totalStaff }} 人</el-descriptions-item>
              <el-descriptions-item label="技术人员数">{{ d01.technicalStaff }} 人（占比 {{ calcRatio(d01.technicalStaff, d01.totalStaff) }}%）</el-descriptions-item>
              <el-descriptions-item label="专职研发人员">{{ d01.rdStaff }} 人（占比 {{ calcRatio(d01.rdStaff, d01.totalStaff) }}%）</el-descriptions-item>
              <el-descriptions-item label="ISO 9001 认证">{{ d01.iso9001Status }}{{ d01.iso9001CertNo ? ' · ' + d01.iso9001CertNo : '' }}</el-descriptions-item>
              <el-descriptions-item label="ISO/TS 22163 认证">{{ d01.isoTs22163Status }}{{ d01.isoTs22163CertNo ? ' · ' + d01.isoTs22163CertNo : '' }}</el-descriptions-item>
              <el-descriptions-item label="经营范围" :span="2">{{ d01.businessScope }}</el-descriptions-item>
            </el-descriptions>

            <div class="sub-title">近三年销售收入</div>
            <el-table :data="d01.salesThreeYears || []" border size="small" style="max-width: 400px;">
              <el-table-column label="年度" prop="year" />
              <el-table-column label="销售收入（万元）" prop="amount">
                <template #default="{ row }">{{ row.amount?.toLocaleString() }}</template>
              </el-table-column>
            </el-table>

            <!-- 营业执照附件预览 -->
            <div class="sub-title" style="margin-top: 20px;">
              <el-icon style="vertical-align: middle; margin-right: 4px;"><Paperclip /></el-icon>
              营业执照附件
            </div>
            <template v-if="d01.businessLicense">
              <el-alert
                type="info"
                :closable="false"
                style="margin-bottom: 12px;"
                title="以下文件由企业用户在其浏览器中上传，仅可在同一浏览器中预览（Demo 模式限制）"
              />
              <DemoFileUpload
                :storage-key="`demo_attach_${report.id}_module_01_businessLicense`"
                :readonly="true"
              />
            </template>
            <el-empty
              v-else
              description="企业未上传营业执照附件"
              :image-size="60"
              style="padding: 20px 0;"
            />
          </template>
          <el-empty v-else description="该模块暂无数据" />
        </el-tab-pane>

        <!-- Modules 02-14: Table view -->
        <el-tab-pane
          v-for="mod in tableModules"
          :key="mod.code"
          :label="mod.code.split('_')[1] + ' ' + mod.name.slice(0, 6)"
          :name="mod.code"
        >
          <div class="module-name-full">{{ mod.name }}</div>
          <template v-if="report.moduleData?.[mod.code]?.length">
            <div class="table-wrapper">
              <table class="view-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th v-for="col in getColumns(mod.code)" :key="col.key">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in report.moduleData[mod.code]" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td v-for="col in getColumns(mod.code)" :key="col.key">
                      {{ formatCellValue(row[col.key], col) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <el-empty v-else description="该模块暂无数据" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- Revision Dialog -->
    <el-dialog v-model="revisionDialog.visible" title="退回修改意见" width="500px">
      <el-form label-position="top">
        <el-form-item label="退回原因" required>
          <el-input v-model="revisionDialog.note" type="textarea" :rows="6" placeholder="请详细说明需要修改的内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="revisionDialog.visible = false">取消</el-button>
        <el-button type="warning" @click="confirmRevision">确认退回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { MODULE_LIST, MODULE_TABLE_CONFIG } from '@/utils/moduleConfig'
import { ArrowLeft, Paperclip } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DemoFileUpload from '@/components/DemoFileUpload.vue'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()

const report = computed(() => dataStore.getReportById(route.params.id))
const d01 = computed(() => report.value?.moduleData?.module_01 || {})
const activeTab = ref('module_01')

const tableModules = MODULE_LIST.filter(m => m.type === 'table')

function getColumns(moduleCode) {
  return MODULE_TABLE_CONFIG[moduleCode]?.columns || []
}

function arrToStr(arr) {
  if (!arr) return '—'
  return Array.isArray(arr) ? arr.join('、') : arr
}

function calcRatio(num, total) {
  if (!num || !total) return '—'
  return ((num / total) * 100).toFixed(1)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function formatCellValue(val, col) {
  if (val === null || val === undefined || val === '') return '—'
  if (col.type === 'daterange') {
    if (Array.isArray(val) && val.length === 2) return `${val[0]} 至 ${val[1]}`
    return '—'
  }
  if (col.type === 'number') return val?.toString() ?? '—'
  return val
}

const revisionDialog = ref({ visible: false, note: '' })

function sendRevision() {
  revisionDialog.value = { visible: true, note: '' }
}

function confirmRevision() {
  if (!revisionDialog.value.note.trim()) {
    ElMessage.warning('请填写退回原因')
    return
  }
  dataStore.updateReportStatus(report.value.id, 'revision', revisionDialog.value.note)
  revisionDialog.value.visible = false
  ElMessage.success('已退回企业修改')
}

function approveReport() {
  ElMessageBox.confirm(`确认批准 "${report.value.companyName}" 的报告？`, '批准报告', {
    type: 'success', confirmButtonText: '确认批准'
  }).then(() => {
    dataStore.updateReportStatus(report.value.id, 'approved')
    ElMessage.success('报告已批准')
  }).catch(() => {})
}
</script>

<style scoped>
.report-detail {}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  margin: 8px 0 6px;
}

.detail-meta {
  font-size: 13px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.detail-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.module-name-full {
  font-size: 15px;
  font-weight: 600;
  color: #434343;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  color: #434343;
  margin: 16px 0 10px;
}

.table-wrapper { overflow-x: auto; }

.view-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.view-table th, .view-table td {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  white-space: nowrap;
}

.view-table th {
  background: #fafafa;
  font-weight: 500;
  color: #434343;
}

.view-table tbody tr:nth-child(even) { background: #fafafa; }
.view-table tbody tr:hover { background: #f0f9ff; }
</style>
