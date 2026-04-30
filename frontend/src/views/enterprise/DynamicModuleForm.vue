<template>
  <div class="dynamic-module">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">模块 {{ moduleNumDisplay }}：{{ moduleConfig?.name || moduleName }}</h2>
        <div class="module-desc" v-if="moduleConfig">
          共 {{ rows.length }} 条记录 · 最少需填写 {{ minRows }} 条
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="saveAndComplete" :loading="saving">保存并完成</el-button>
      </div>
    </div>

    <!-- Unknown module fallback -->
    <el-result
      v-if="!moduleConfig"
      icon="warning"
      title="模块未找到"
      :sub-title="`模块代码 ${code} 的配置不存在`"
    >
      <template #extra>
        <el-button @click="router.push('/enterprise/dashboard')">返回工作台</el-button>
      </template>
    </el-result>

    <template v-else>
      <!-- Table-based form -->
      <el-card shadow="never" class="table-card">
        <div class="table-wrapper">
          <table class="form-table">
            <thead>
              <tr>
                <th width="50">序号</th>
                <th
                  v-for="col in visibleColumns"
                  :key="col.key"
                  :style="{ minWidth: col.minWidth + 'px' }"
                >
                  {{ col.label }}
                  <span v-if="col.required" style="color:#ff4d4f;margin-left:2px;">*</span>
                </th>
                <th width="70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="row._id">
                <td class="row-num">{{ idx + 1 }}</td>
                <td v-for="col in visibleColumns" :key="col.key" class="data-cell">
                  <!-- Conditional: hide if showWhen not met -->
                  <template v-if="!col.showWhen || row[col.showWhen.field] === col.showWhen.value">
                    <el-input
                      v-if="col.type === 'input'"
                      v-model="row[col.key]"
                      size="small"
                      :placeholder="col.label"
                      clearable
                    />
                    <el-input
                      v-else-if="col.type === 'textarea'"
                      v-model="row[col.key]"
                      size="small"
                      type="textarea"
                      :rows="2"
                      :placeholder="col.label"
                    />
                    <el-input-number
                      v-else-if="col.type === 'number'"
                      v-model="row[col.key]"
                      size="small"
                      :min="col.min ?? 0"
                      :max="col.max"
                      controls-position="right"
                      style="width: 100%;"
                    />
                    <el-select
                      v-else-if="col.type === 'select'"
                      v-model="row[col.key]"
                      size="small"
                      style="width: 100%;"
                      :placeholder="col.label"
                      clearable
                    >
                      <el-option v-for="opt in col.options" :key="opt" :label="opt" :value="opt" />
                    </el-select>
                    <el-date-picker
                      v-else-if="col.type === 'date'"
                      v-model="row[col.key]"
                      size="small"
                      type="date"
                      value-format="YYYY-MM-DD"
                      style="width: 100%;"
                      :placeholder="col.label"
                    />
                    <el-date-picker
                      v-else-if="col.type === 'daterange'"
                      v-model="row[col.key]"
                      size="small"
                      type="daterange"
                      value-format="YYYY-MM-DD"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      style="width: 100%;"
                    />
                  </template>
                  <span v-else class="na-text">—</span>
                </td>
                <td class="action-cell">
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="removeRow(idx)"
                    :disabled="rows.length <= minRows"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <el-button @click="addRow" type="primary" plain>
            <el-icon><Plus /></el-icon>
            {{ moduleConfig.addLabel || '新增行' }}
          </el-button>
          <span class="row-count">已有 {{ rows.length }} 条</span>
        </div>
      </el-card>

      <!-- Bottom Actions -->
      <div class="bottom-actions">
        <el-button @click="router.push('/enterprise/dashboard')">返回工作台</el-button>
        <el-button
          v-if="prevModule"
          @click="goToModule(prevModule)"
        >上一模块</el-button>
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="saveAndComplete" :loading="saving">保存并完成</el-button>
        <el-button
          v-if="nextModule"
          type="success"
          @click="saveAndGoNext"
          :loading="saving"
        >保存并进入下一模块 →</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { MODULE_LIST, MODULE_TABLE_CONFIG, getEmptyRow } from '@/utils/moduleConfig'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()

const code = computed(() => route.params.code)
const moduleCode = computed(() => `module_${code.value}`)
const moduleNumDisplay = computed(() => code.value)
const moduleName = computed(() => {
  const m = MODULE_LIST.find(m => m.code === moduleCode.value)
  return m?.name || moduleCode.value
})
const moduleConfig = computed(() => MODULE_TABLE_CONFIG[moduleCode.value])
const minRows = computed(() => moduleConfig.value?.minRows ?? 1)

const visibleColumns = computed(() => moduleConfig.value?.columns ?? [])

const rows = ref([])
const saving = ref(false)

// Navigation between modules
const allTableModules = MODULE_LIST.filter(m => m.type === 'table')
const currentIdx = computed(() => allTableModules.findIndex(m => m.code === moduleCode.value))
const prevModule = computed(() => currentIdx.value > 0 ? allTableModules[currentIdx.value - 1] : null)
const nextModule = computed(() => currentIdx.value < allTableModules.length - 1 ? allTableModules[currentIdx.value + 1] : null)

function goToModule(mod) {
  const num = mod.code.split('_')[1]
  if (num === '01') router.push('/enterprise/module/01')
  else router.push(`/enterprise/module/${num}`)
}

function loadData() {
  const report = dataStore.getReportById(auth.user?.reportId)
  const saved = report?.moduleData?.[moduleCode.value]
  if (saved && Array.isArray(saved) && saved.length > 0) {
    rows.value = JSON.parse(JSON.stringify(saved))
  } else {
    rows.value = [getEmptyRow(moduleCode.value)]
  }
}

onMounted(loadData)
watch(code, loadData)

function addRow() {
  rows.value.push(getEmptyRow(moduleCode.value))
}

function removeRow(idx) {
  if (rows.value.length <= minRows.value) {
    ElMessage.warning(`至少需要保留 ${minRows.value} 条记录`)
    return
  }
  rows.value.splice(idx, 1)
}

async function saveDraft() {
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  const reportId = auth.user?.reportId
  if (reportId) {
    dataStore.saveModuleData(reportId, moduleCode.value, JSON.parse(JSON.stringify(rows.value)))
  }
  saving.value = false
  ElMessage.success('草稿已保存')
}

async function saveAndComplete() {
  const hasData = rows.value.some(row => {
    return visibleColumns.value.some(col => {
      const val = row[col.key]
      return val !== null && val !== undefined && val !== ''
    })
  })
  if (!hasData) {
    ElMessage.warning('请至少填写一条完整记录')
    return
  }
  await saveDraft()
  ElMessage.success(`模块${moduleNumDisplay.value}已标记为完成！`)
  router.push('/enterprise/dashboard')
}

async function saveAndGoNext() {
  await saveDraft()
  if (nextModule.value) goToModule(nextModule.value)
}
</script>

<style scoped>
.dynamic-module {}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 4px;
}

.module-desc {
  font-size: 13px;
  color: #8c8c8c;
}

.header-actions { display: flex; gap: 10px; }

.table-card {}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 12px;
}

.form-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.form-table th, .form-table td {
  border: 1px solid #e8e8e8;
  padding: 6px 8px;
  white-space: nowrap;
  vertical-align: middle;
}

.form-table th {
  background: #fafafa;
  font-weight: 500;
  color: #434343;
  text-align: center;
}

.form-table tbody tr:hover { background: #f5f9ff; }

.row-num { text-align: center; color: #8c8c8c; }

.data-cell { padding: 4px 6px; }

.action-cell { text-align: center; }

.na-text { color: #bfbfbf; font-style: italic; }

.table-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.row-count { font-size: 13px; color: #8c8c8c; }

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
