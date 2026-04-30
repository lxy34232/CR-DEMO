<template>
  <div class="report-list">
    <div class="page-header">
      <h2 class="page-title">报告管理</h2>
      <div class="header-right">
        <span class="total-text">共 {{ filteredReports.length }} 份报告</span>
      </div>
    </div>

    <!-- Filters -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-row :gutter="12" align="middle">
        <el-col :xs="24" :sm="8">
          <el-input
            v-model="searchText"
            placeholder="搜索企业名称或信用代码"
            clearable
            :prefix-icon="Search"
          />
        </el-col>
        <el-col :xs="24" :sm="6">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 100%;">
            <el-option label="已提交" value="submitted" />
            <el-option label="待修改" value="revision" />
            <el-option label="草稿" value="draft" />
            <el-option label="已批准" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Report Table -->
    <el-card shadow="never">
      <el-table :data="filteredReports" stripe row-key="id" @row-click="viewReport" style="cursor: pointer;">
        <el-table-column label="报告编号" prop="id" width="160" />
        <el-table-column label="企业名称" prop="companyName" min-width="200" show-overflow-tooltip />
        <el-table-column label="联系人" prop="contactPerson" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="dataStore.getStatusType(row.status)" size="small">
              {{ dataStore.getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="完成进度" width="130">
          <template #default="{ row }">
            <el-progress
              :percentage="dataStore.getCompletionPercent(row)"
              :stroke-width="8"
              :show-text="true"
            />
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="130">
          <template #default="{ row }">
            {{ row.submittedAt ? formatDate(row.submittedAt) : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="130">
          <template #default="{ row }">
            {{ row.updatedAt ? formatDate(row.updatedAt) : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click.stop="viewReport(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'submitted'"
              size="small"
              type="warning"
              @click.stop="sendRevision(row)"
            >退回修改</el-button>
            <el-button
              v-if="row.status === 'submitted'"
              size="small"
              type="success"
              @click.stop="approveReport(row)"
            >批准</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Revision Dialog -->
    <el-dialog v-model="revisionDialog.visible" title="退回修改意见" width="500px">
      <el-form label-position="top">
        <el-form-item label="退回原因（将发送给企业）" required>
          <el-input
            v-model="revisionDialog.note"
            type="textarea"
            :rows="6"
            placeholder="请详细说明需要修改的内容..."
          />
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
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const dataStore = useDataStore()

const searchText = ref('')
const statusFilter = ref('')

const filteredReports = computed(() => {
  let list = dataStore.allReports
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter(r =>
      r.companyName?.toLowerCase().includes(q) ||
      r.creditCode?.includes(q) ||
      r.id?.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) {
    list = list.filter(r => r.status === statusFilter.value)
  }
  return list
})

function resetFilters() {
  searchText.value = ''
  statusFilter.value = ''
}

function viewReport(row) {
  router.push(`/admin/reports/${row.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const revisionDialog = ref({ visible: false, reportId: '', note: '' })

function sendRevision(row) {
  revisionDialog.value = { visible: true, reportId: row.id, note: '' }
}

function confirmRevision() {
  if (!revisionDialog.value.note.trim()) {
    ElMessage.warning('请填写退回原因')
    return
  }
  dataStore.updateReportStatus(revisionDialog.value.reportId, 'revision', revisionDialog.value.note)
  revisionDialog.value.visible = false
  ElMessage.success('已退回企业修改')
}

function approveReport(row) {
  ElMessageBox.confirm(`确认批准 "${row.companyName}" 的报告？`, '批准报告', {
    type: 'success', confirmButtonText: '确认批准'
  }).then(() => {
    dataStore.updateReportStatus(row.id, 'approved')
    ElMessage.success('报告已批准')
  }).catch(() => {})
}
</script>

<style scoped>
.report-list {}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.total-text { font-size: 13px; color: #8c8c8c; }
</style>
