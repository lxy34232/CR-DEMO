<template>
  <div class="demo-file-upload">
    <!-- 已上传文件展示 -->
    <div v-if="uploadedFile" class="file-card">
      <div class="file-icon">
        <el-icon v-if="isPdf" size="32" color="#e74c3c"><Document /></el-icon>
        <el-icon v-else size="32" color="#3498db"><Picture /></el-icon>
      </div>
      <div class="file-info">
        <div class="file-name" :title="uploadedFile.name">{{ uploadedFile.name }}</div>
        <div class="file-meta">
          {{ formatSize(uploadedFile.size) }} · 上传于 {{ formatTime(uploadedFile.uploadedAt) }}
        </div>
      </div>
      <div class="file-actions">
        <el-button type="primary" size="small" link @click="previewFile">
          <el-icon><View /></el-icon> 预览
        </el-button>
        <el-button type="danger" size="small" link @click="deleteFile" :disabled="readonly">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      v-else-if="!readonly"
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'uploading': uploading }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        style="display:none"
        @change="handleFileChange"
      />
      <div v-if="!uploading" class="upload-hint">
        <el-icon size="36" color="#bfbfbf"><UploadFilled /></el-icon>
        <div class="upload-text">拖拽文件至此或 <span class="upload-link">点击上传</span></div>
        <div class="upload-desc">{{ hint }}</div>
      </div>
      <div v-else class="uploading-hint">
        <el-progress type="circle" :percentage="uploadProgress" :width="60" />
        <div style="margin-top: 8px; color: #8c8c8c;">正在读取...</div>
      </div>
    </div>

    <!-- 只读时无文件提示 -->
    <div v-else class="no-file-hint">
      <el-icon color="#bfbfbf"><DocumentDelete /></el-icon>
      <span style="color: #bfbfbf; margin-left: 6px;">暂无附件</span>
    </div>

    <!-- PDF/图片预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      :title="uploadedFile?.name"
      width="90%"
      top="3vh"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="preview-container">
        <!-- PDF 预览 -->
        <iframe
          v-if="isPdf && previewUrl"
          :src="previewUrl"
          class="pdf-preview"
          frameborder="0"
        />
        <!-- 图片预览 -->
        <img
          v-else-if="previewUrl"
          :src="previewUrl"
          class="img-preview"
          alt="预览"
        />
      </div>
      <template #footer>
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <el-button @click="downloadFile">
            <el-icon><Download /></el-icon> 下载
          </el-button>
          <el-button type="primary" @click="previewVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Picture, View, Delete, UploadFilled, DocumentDelete, Download } from '@element-plus/icons-vue'

const props = defineProps({
  // 存储键（唯一标识，存 localStorage）
  storageKey: { type: String, required: true },
  // 允许的文件类型（MIME 字符串）
  accept: { type: String, default: 'application/pdf,image/jpeg,image/png' },
  // 最大文件大小（MB）
  maxSizeMb: { type: Number, default: 5 },
  // 提示文字
  hint: { type: String, default: '支持 PDF、JPG、PNG，不超过 5MB（Demo 存储于本地浏览器）' },
  // 是否只读
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])

const fileInputRef = ref(null)
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const previewVisible = ref(false)
const previewUrl = ref(null) // blob URL
const uploadedFile = ref(null) // { name, size, type, dataUrl, uploadedAt }

const isPdf = computed(() => uploadedFile.value?.type === 'application/pdf')

// 挂载时从 localStorage 读取
onMounted(() => {
  const raw = localStorage.getItem(props.storageKey)
  if (raw) {
    try {
      uploadedFile.value = JSON.parse(raw)
    } catch {
      uploadedFile.value = null
    }
  }
})

// 清理 blob URL
onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
  // 清空 input 以允许重复选同一文件
  e.target.value = ''
}

function processFile(file) {
  // 校验文件类型
  const allowedTypes = props.accept.split(',').map(s => s.trim())
  const matched = allowedTypes.some(t => {
    if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t)
    return file.type === t
  })
  if (!matched) {
    ElMessage.error(`不支持的文件格式，请上传：${props.accept}`)
    return
  }

  // 校验文件大小
  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (file.size > maxBytes) {
    ElMessage.error(`文件大小超限，最大允许 ${props.maxSizeMb}MB（当前 ${formatSize(file.size)}）`)
    return
  }

  // 读取为 base64
  uploading.value = true
  uploadProgress.value = 0

  const reader = new FileReader()
  reader.onprogress = (e) => {
    if (e.lengthComputable) {
      uploadProgress.value = Math.round((e.loaded / e.total) * 90)
    }
  }
  reader.onload = (e) => {
    uploadProgress.value = 100
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: e.target.result,
      uploadedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(props.storageKey, JSON.stringify(fileData))
      uploadedFile.value = fileData
      emit('change', { key: props.storageKey, name: file.name, size: file.size, type: file.type })
      ElMessage.success('文件上传成功（已保存至本地浏览器）')
    } catch (err) {
      ElMessage.error('存储失败：浏览器本地存储空间不足，请尝试上传更小的文件')
    } finally {
      uploading.value = false
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
    uploading.value = false
  }
  reader.readAsDataURL(file)
}

function previewFile() {
  if (!uploadedFile.value?.dataUrl) return
  // 从 base64 创建 blob URL
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  const arr = uploadedFile.value.dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i)
  const blob = new Blob([u8arr], { type: mime })
  previewUrl.value = URL.createObjectURL(blob)
  previewVisible.value = true
}

function downloadFile() {
  if (!uploadedFile.value?.dataUrl) return
  const a = document.createElement('a')
  a.href = uploadedFile.value.dataUrl
  a.download = uploadedFile.value.name
  a.click()
}

function deleteFile() {
  localStorage.removeItem(props.storageKey)
  uploadedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  emit('change', null)
  ElMessage.success('文件已删除')
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
.demo-file-upload {}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s;
}
.file-card:hover { border-color: #1677ff; }

.file-icon { flex-shrink: 0; }

.file-info { flex: 1; min-width: 0; }
.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-meta { font-size: 12px; color: #8c8c8c; margin-top: 2px; }

.file-actions { display: flex; gap: 4px; flex-shrink: 0; }

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}
.upload-area:hover { border-color: #1677ff; background: #f0f7ff; }
.upload-area.drag-over { border-color: #1677ff; background: #e8f4ff; }
.upload-area.uploading { cursor: not-allowed; }

.upload-hint { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.upload-text { font-size: 14px; color: #595959; }
.upload-link { color: #1677ff; }
.upload-desc { font-size: 12px; color: #bfbfbf; }

.uploading-hint { display: flex; flex-direction: column; align-items: center; }

.no-file-hint {
  display: flex;
  align-items: center;
  padding: 12px;
  color: #bfbfbf;
  font-size: 13px;
}

.preview-container {
  width: 100%;
  height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.pdf-preview {
  width: 100%;
  height: 100%;
  border: none;
}

.img-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
