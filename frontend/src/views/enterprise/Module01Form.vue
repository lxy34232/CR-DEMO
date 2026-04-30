<template>
  <div class="module-01">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title">模块 01：申请企业基本情况报告</h2>
      <div class="header-actions">
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="saveAndComplete">保存并完成</el-button>
      </div>
    </div>

    <el-form :model="form" label-position="top" ref="formRef" class="form-body">

      <!-- Section 1: 企业概况 -->
      <el-card shadow="never" class="section-card">
        <template #header><div class="section-title">第一部分：企业概况</div></template>
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="企业名称（中文）" required>
              <el-input v-model="form.companyNameCn" placeholder="请输入企业全称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="企业名称（英文）">
              <el-input v-model="form.companyNameEn" placeholder="English name (optional)" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="统一社会信用代码" required>
              <el-input v-model="form.creditCode" placeholder="18位统一社会信用代码" maxlength="18" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="注册资本（万元）" required>
              <el-input-number v-model="form.registeredCapital" :min="0" :precision="2" style="width:100%;" placeholder="请输入注册资本" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="营业执照发证机关">
              <el-input v-model="form.licenseAuthority" placeholder="请输入发证机关名称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="营业执照有效期">
              <el-date-picker v-model="form.licenseValidity" type="date" value-format="YYYY-MM-DD" style="width:100%;" placeholder="选择日期" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="企业性质" required>
              <el-checkbox-group v-model="form.companyNature">
                <el-checkbox v-for="opt in COMPANY_NATURE_OPTIONS" :key="opt" :label="opt">{{ opt }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="行业类别" required>
              <el-checkbox-group v-model="form.industry">
                <el-checkbox v-for="opt in INDUSTRY_OPTIONS" :key="opt" :label="opt">{{ opt }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="营业执照年审情况">
              <el-radio-group v-model="form.annualCheck">
                <el-radio v-for="opt in ANNUAL_CHECK_OPTIONS" :key="opt" :label="opt">{{ opt }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24">
            <el-form-item label="经营范围">
              <el-input v-model="form.businessScope" type="textarea" :rows="3" placeholder="请填写营业执照中的经营范围" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Near 3 Years Sales -->
        <div class="sub-section-title">近三年主营业务年销售收入（万元）</div>
        <el-table :data="form.salesThreeYears" border style="width: 100%; margin-bottom: 16px;">
          <el-table-column label="年度" prop="year" width="100" />
          <el-table-column label="销售收入（万元）">
            <template #default="scope">
              <el-input-number v-model="scope.row.amount" :min="0" :precision="2" style="width:100%;" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Section 2: 人员构成统计 -->
      <el-card shadow="never" class="section-card">
        <template #header><div class="section-title">第二部分：人员构成统计</div></template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="职工总人数（人）" required>
              <el-input-number v-model="form.totalStaff" :min="0" style="width:100%;" @change="calcPercent" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="技术人员数（人）" required>
              <el-input-number v-model="form.technicalStaff" :min="0" style="width:100%;" @change="calcPercent" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="技术人员占比（%）">
              <el-input :value="calcRatio(form.technicalStaff, form.totalStaff)" readonly style="color:#1677ff;font-weight:600;">
                <template #suffix>%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="拥有职称人员数（人）">
              <el-input-number v-model="form.staffWithTitle" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="其中：高级职称（人）">
              <el-input-number v-model="form.highTitle" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="中级职称（人）">
              <el-input-number v-model="form.midTitle" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="初级职称（人）">
              <el-input-number v-model="form.juniorTitle" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="专职研发人员数（人）">
              <el-input-number v-model="form.rdStaff" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="研发人员占比（%）">
              <el-input :value="calcRatio(form.rdStaff, form.totalStaff)" readonly style="color:#1677ff;font-weight:600;">
                <template #suffix>%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="博士学历（人）">
              <el-input-number v-model="form.doctoralStaff" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="硕士学历（人）">
              <el-input-number v-model="form.masterStaff" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="本科学历（人）">
              <el-input-number v-model="form.bachelorStaff" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="大专及以下（人）">
              <el-input-number v-model="form.collegeStaff" :min="0" style="width:100%;" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Section 3: 质量管理体系 -->
      <el-card shadow="never" class="section-card">
        <template #header><div class="section-title">第三部分：质量管理体系认证情况</div></template>

        <!-- ISO 9001 -->
        <div class="cert-block">
          <div class="cert-label">ISO 9001 质量管理体系认证</div>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <el-form-item label="获证情况">
                <el-radio-group v-model="form.iso9001Status">
                  <el-radio v-for="opt in ['已获证','未获证','不适用']" :key="opt" :label="opt">{{ opt }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <template v-if="form.iso9001Status === '已获证'">
              <el-col :xs="24" :sm="8">
                <el-form-item label="证书编号">
                  <el-input v-model="form.iso9001CertNo" placeholder="请输入证书编号" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="证书有效期">
                  <el-date-picker v-model="form.iso9001Validity" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </div>

        <!-- ISO/TS 22163 -->
        <div class="cert-block">
          <div class="cert-label">ISO/TS 22163 (IRIS) 铁路行业质量管理体系认证</div>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <el-form-item label="获证情况">
                <el-radio-group v-model="form.isoTs22163Status">
                  <el-radio v-for="opt in ['已获证','未获证','不适用']" :key="opt" :label="opt">{{ opt }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <template v-if="form.isoTs22163Status === '已获证'">
              <el-col :xs="24" :sm="8">
                <el-form-item label="证书编号">
                  <el-input v-model="form.isoTs22163CertNo" placeholder="请输入证书编号" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="证书有效期">
                  <el-date-picker v-model="form.isoTs22163Validity" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </div>

        <!-- Quality Manual -->
        <div class="cert-block">
          <div class="cert-label">质量手册信息</div>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <el-form-item label="质量手册名称">
                <el-input v-model="form.qualityManualName" placeholder="如：QM-2024" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="版本号">
                <el-input v-model="form.qualityManualVersion" placeholder="如：V3.0" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="发布日期">
                <el-date-picker v-model="form.qualityManualDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- Section 4: 售后服务 -->
      <el-card shadow="never" class="section-card">
        <template #header><div class="section-title">第四部分：售后服务机构情况</div></template>
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item label="售后服务机构名称">
              <el-input v-model="form.afterSalesOrgName" placeholder="如：售后服务中心" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="售后服务联系方式">
              <el-input v-model="form.afterSalesOrgContact" placeholder="联系人及联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Section 5: 产品研发 -->
      <el-card shadow="never" class="section-card">
        <template #header><div class="section-title">第五部分：产品研发能力</div></template>
        <el-form-item label="企业研发战略描述">
          <el-input v-model="form.rdStrategy" type="textarea" :rows="4" placeholder="请描述企业的产品研发战略、方向及核心技术能力" />
        </el-form-item>

        <!-- Main Products Table -->
        <div class="sub-section-title">主要申请认证产品情况</div>
        <div v-for="(prod, idx) in form.mainProducts" :key="idx" class="product-row">
          <el-card class="product-card" shadow="never">
            <template #header>
              <div class="product-header">
                <span>产品 {{ idx + 1 }}</span>
                <el-button type="danger" size="small" text @click="removeProduct(idx)" v-if="form.mainProducts.length > 1">删除</el-button>
              </div>
            </template>
            <el-row :gutter="16">
              <el-col :xs="24" :md="12">
                <el-form-item label="产品名称">
                  <el-input v-model="prod.productName" placeholder="请输入产品名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="研发单位">
                  <el-input v-model="prod.rdUnit" placeholder="主要研发单位" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="制造/维修类别">
                  <el-checkbox-group v-model="prod.productCategory">
                    <el-checkbox v-for="opt in ['设计','制造','维修']" :key="opt" :label="opt">{{ opt }}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="产品用途">
                  <el-checkbox-group v-model="prod.productUsage">
                    <el-checkbox v-for="opt in ['客运','货运','客货两用']" :key="opt" :label="opt">{{ opt }}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8">
                <el-form-item label="产品型号">
                  <el-input v-model="prod.productModel" placeholder="产品型号" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="年产/维修量（辆/年）">
                  <el-input-number v-model="prod.productCount" :min="0" style="width:100%;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="年检修量（辆/年）">
                  <el-input-number v-model="prod.annualMaintainCount" :min="0" style="width:100%;" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </div>
        <el-button @click="addProduct" style="width:100%;margin-top:10px;">
          <el-icon><Plus /></el-icon>添加产品
        </el-button>
      </el-card>

    </el-form>

    <!-- Bottom Actions -->
    <div class="bottom-actions">
      <el-button @click="goBack">返回工作台</el-button>
      <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
      <el-button type="primary" @click="saveAndComplete">保存并标记完成</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { COMPANY_NATURE_OPTIONS, INDUSTRY_OPTIONS, ANNUAL_CHECK_OPTIONS } from '@/utils/moduleConfig'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()
const dataStore = useDataStore()
const saving = ref(false)
const formRef = ref()

const defaultProduct = () => ({
  productName: '', rdUnit: '', productCategory: [], productUsage: [], productModel: '', productCount: 0, annualMaintainCount: 0
})

const form = reactive({
  companyNameCn: '', companyNameEn: '', creditCode: '', licenseAuthority: '', licenseValidity: '',
  registeredCapital: null, companyNature: [], industry: [], businessScope: '', annualCheck: '已通过',
  salesThreeYears: [
    { year: new Date().getFullYear() - 2, amount: null },
    { year: new Date().getFullYear() - 1, amount: null },
    { year: new Date().getFullYear(), amount: null }
  ],
  totalStaff: null, technicalStaff: null, staffWithTitle: null,
  highTitle: null, midTitle: null, juniorTitle: null,
  rdStaff: null, doctoralStaff: null, masterStaff: null, bachelorStaff: null, collegeStaff: null,
  iso9001Status: '未获证', iso9001CertNo: '', iso9001Validity: '',
  isoTs22163Status: '未获证', isoTs22163CertNo: '', isoTs22163Validity: '',
  qualityManualName: '', qualityManualVersion: '', qualityManualDate: '',
  afterSalesOrgName: '', afterSalesOrgContact: '',
  rdStrategy: '',
  mainProducts: [defaultProduct()]
})

function calcRatio(num, total) {
  if (!num || !total || total === 0) return '—'
  return ((num / total) * 100).toFixed(1)
}

function calcPercent() {}

function addProduct() { form.mainProducts.push(defaultProduct()) }
function removeProduct(idx) { form.mainProducts.splice(idx, 1) }

function loadExisting() {
  const report = dataStore.getReportById(auth.user?.reportId)
  const saved = report?.moduleData?.module_01
  if (saved) {
    Object.keys(saved).forEach(k => {
      if (k in form) form[k] = saved[k]
    })
  }
}

onMounted(loadExisting)

async function saveDraft() {
  saving.value = true
  await new Promise(r => setTimeout(r, 300))
  const reportId = auth.user?.reportId
  if (reportId) {
    dataStore.saveModuleData(reportId, 'module_01', JSON.parse(JSON.stringify(form)))
  }
  saving.value = false
  ElMessage.success('草稿已保存')
}

async function saveAndComplete() {
  if (!form.companyNameCn) {
    ElMessage.warning('请至少填写企业名称（中文）')
    return
  }
  await saveDraft()
  ElMessage.success('模块01已标记为完成！')
  router.push('/enterprise/dashboard')
}

function goBack() { router.push('/enterprise/dashboard') }
</script>

<style scoped>
.module-01 { max-width: 1000px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.header-actions { display: flex; gap: 10px; }

.form-body { display: flex; flex-direction: column; gap: 16px; }

.section-card {}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1677ff;
}

.sub-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #434343;
  margin: 16px 0 10px;
  padding-left: 10px;
  border-left: 3px solid #1677ff;
}

.cert-block {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.cert-label {
  font-size: 14px;
  font-weight: 500;
  color: #434343;
  margin-bottom: 12px;
}

.product-card { margin-bottom: 12px; }
.product-header { display: flex; align-items: center; justify-content: space-between; }

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
