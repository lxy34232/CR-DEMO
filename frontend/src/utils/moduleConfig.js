// ============================================================
// 模块列表定义（14个核心业务模块）
// ============================================================
export const MODULE_LIST = [
  { code: 'module_01', name: '申请企业基本情况报告', icon: 'Document', type: 'mixed' },
  { code: 'module_02', name: '高层管理人员情况', icon: 'UserFilled', type: 'table' },
  { code: 'module_03', name: '主要管理制度目录', icon: 'List', type: 'table' },
  { code: 'module_04', name: '售后服务人员情况', icon: 'Service', type: 'table' },
  { code: 'module_05', name: '成熟的产品研发业绩', icon: 'Trophy', type: 'table' },
  { code: 'module_06', name: '生产基础设施', icon: 'OfficeBuilding', type: 'table' },
  { code: 'module_07', name: '主要设备', icon: 'SetUp', type: 'table' },
  { code: 'module_08', name: '工艺装备', icon: 'Tools', type: 'table' },
  { code: 'module_09', name: '检测试验手段', icon: 'DataAnalysis', type: 'table' },
  { code: 'module_10', name: '主要供方清单', icon: 'Shop', type: 'table' },
  { code: 'module_11', name: '主要外包方清单', icon: 'Connection', type: 'table' },
  { code: 'module_12', name: '依托外部试验资源情况', icon: 'Share', type: 'table' },
  { code: 'module_13', name: '国内外联合研发情况', icon: 'Globe', type: 'table' },
  { code: 'module_14', name: '制造/维修产品近三年使用情况', icon: 'TrendCharts', type: 'table' },
]

// ============================================================
// 枚举选项
// ============================================================
export const EDUCATION_OPTIONS = ['大专及以下', '大学本科', '硕士研究生', '博士研究生']
export const GENDER_OPTIONS = ['男', '女']
export const TITLE_OPTIONS = ['见习生', '助理工程师', '工程师', '高级工程师', '正高级工程师', '无']
export const CULTURE_OPTIONS = ['高中及以下', '大专', '大学本科', '硕士研究生', '博士研究生']
export const CERT_STATUS_OPTIONS = ['已获证', '未获证', '不适用']
export const COMPANY_NATURE_OPTIONS = ['国有', '集体', '民营', '个体', '股份制', '合作', '合资', '独资', '台资', '其他']
export const INDUSTRY_OPTIONS = ['铁路运输设备制造', '铁路运输设备修理']
export const PRODUCT_CATEGORY_OPTIONS = ['设计', '制造', '维修']
export const PRODUCT_USAGE_OPTIONS = ['客运', '货运', '客货两用']
export const SYSTEM_CATEGORY_OPTIONS = ['质量管理', '安全管理', '人力资源', '财务管理', '生产管理', '其他']
export const COLLAB_TYPE_OPTIONS = ['国内合作', '国际合作']
export const MANUF_REPAIR_OPTIONS = ['制造', '维修', '制造和维修']
export const ANNUAL_CHECK_OPTIONS = ['已通过', '未通过', '不适用']

// ============================================================
// 动态表格模块列配置（模块02~14）
// ============================================================
export const MODULE_TABLE_CONFIG = {
  module_02: {
    minRows: 1,
    addLabel: '新增人员',
    columns: [
      { key: 'name', label: '姓名', type: 'input', required: true, minWidth: 100 },
      { key: 'gender', label: '性别', type: 'select', required: true, options: GENDER_OPTIONS, minWidth: 80 },
      { key: 'age', label: '年龄', type: 'number', required: true, min: 18, max: 80, minWidth: 80 },
      { key: 'education', label: '学历', type: 'select', required: true, options: EDUCATION_OPTIONS, minWidth: 130 },
      { key: 'position', label: '职务', type: 'input', required: true, minWidth: 130 },
      { key: 'title', label: '职称', type: 'select', required: true, options: TITLE_OPTIONS, minWidth: 130 },
      { key: 'years', label: '从事职务年限(年)', type: 'number', required: true, min: 0, max: 60, minWidth: 140 },
    ]
  },
  module_03: {
    minRows: 1,
    addLabel: '新增制度',
    columns: [
      { key: 'docNo', label: '编号（文号）', type: 'input', required: true, minWidth: 150 },
      { key: 'docName', label: '制度名称', type: 'input', required: true, minWidth: 200 },
      { key: 'issueDate', label: '签发日期', type: 'date', required: true, minWidth: 140 },
      { key: 'category', label: '制度类别', type: 'select', required: true, options: SYSTEM_CATEGORY_OPTIONS, minWidth: 130 },
    ]
  },
  module_04: {
    minRows: 1,
    addLabel: '新增人员',
    columns: [
      { key: 'name', label: '姓名', type: 'input', required: true, minWidth: 90 },
      { key: 'gender', label: '性别', type: 'select', required: true, options: GENDER_OPTIONS, minWidth: 80 },
      { key: 'age', label: '年龄', type: 'number', required: true, min: 18, max: 80, minWidth: 80 },
      { key: 'title', label: '职称', type: 'select', required: true, options: TITLE_OPTIONS, minWidth: 130 },
      { key: 'culture', label: '文化程度', type: 'select', required: true, options: CULTURE_OPTIONS, minWidth: 120 },
      { key: 'major', label: '所学专业', type: 'input', required: true, minWidth: 120 },
      { key: 'expertise', label: '技术特长', type: 'input', required: true, minWidth: 160 },
      { key: 'workYears', label: '工作年限(年)', type: 'number', required: true, min: 0, max: 60, minWidth: 120 },
      { key: 'remark', label: '备注', type: 'input', required: false, minWidth: 120 },
    ]
  },
  module_05: {
    minRows: 1,
    addLabel: '新增业绩',
    columns: [
      { key: 'projectName', label: '项目名称', type: 'input', required: true, minWidth: 220 },
      { key: 'period', label: '项目执行期', type: 'daterange', required: true, minWidth: 260 },
      { key: 'features', label: '项目特点', type: 'textarea', required: true, minWidth: 280 },
    ]
  },
  module_06: {
    minRows: 1,
    addLabel: '新增设施',
    columns: [
      { key: 'facilityName', label: '生产基础设施名称', type: 'input', required: true, minWidth: 200 },
      { key: 'process', label: '所在工序', type: 'input', required: true, minWidth: 150 },
      { key: 'location', label: '位置', type: 'input', required: true, minWidth: 200 },
    ]
  },
  module_07: {
    minRows: 1,
    addLabel: '新增设备',
    columns: [
      { key: 'equipName', label: '设备名称', type: 'input', required: true, minWidth: 160 },
      { key: 'model', label: '规格型号', type: 'input', required: true, minWidth: 140 },
      { key: 'quantity', label: '数量', type: 'number', required: true, min: 1, minWidth: 80 },
      { key: 'usage', label: '用途', type: 'input', required: true, minWidth: 180 },
      { key: 'process', label: '工序', type: 'input', required: true, minWidth: 130 },
      { key: 'location', label: '位置', type: 'input', required: true, minWidth: 160 },
    ]
  },
  module_08: {
    minRows: 1,
    addLabel: '新增工艺装备',
    columns: [
      { key: 'equipName', label: '工艺装备名称', type: 'input', required: true, minWidth: 180 },
      { key: 'model', label: '规格型号', type: 'input', required: true, minWidth: 140 },
      { key: 'quantity', label: '数量', type: 'number', required: true, min: 1, minWidth: 80 },
      { key: 'usage', label: '用途', type: 'input', required: true, minWidth: 180 },
      { key: 'process', label: '工序', type: 'input', required: true, minWidth: 130 },
      { key: 'location', label: '位置', type: 'input', required: true, minWidth: 160 },
    ]
  },
  module_09: {
    minRows: 1,
    addLabel: '新增检测设备',
    columns: [
      { key: 'equipName', label: '检测试验设备名称', type: 'input', required: true, minWidth: 200 },
      { key: 'model', label: '规格型号', type: 'input', required: true, minWidth: 140 },
      { key: 'quantity', label: '数量', type: 'number', required: true, min: 1, minWidth: 80 },
      { key: 'usage', label: '用途', type: 'input', required: true, minWidth: 180 },
      { key: 'process', label: '工序', type: 'input', required: true, minWidth: 130 },
      { key: 'location', label: '位置', type: 'input', required: true, minWidth: 160 },
    ]
  },
  module_10: {
    minRows: 1,
    addLabel: '新增供方',
    columns: [
      { key: 'supplierName', label: '供方名称', type: 'input', required: true, minWidth: 180 },
      { key: 'supplyItems', label: '供货项目', type: 'input', required: true, minWidth: 180 },
      { key: 'certStatus', label: '获证情况', type: 'select', required: true, options: CERT_STATUS_OPTIONS, minWidth: 120 },
      { key: 'certNo', label: '证书编号', type: 'input', required: false, minWidth: 160, showWhen: { field: 'certStatus', value: '已获证' } },
      { key: 'certValidity', label: '证书有效期', type: 'daterange', required: false, minWidth: 260, showWhen: { field: 'certStatus', value: '已获证' } },
    ]
  },
  module_11: {
    minRows: 1,
    addLabel: '新增外包方',
    columns: [
      { key: 'outsourceName', label: '外包方名称', type: 'input', required: true, minWidth: 180 },
      { key: 'outsourceItems', label: '外包项目', type: 'input', required: true, minWidth: 180 },
      { key: 'certStatus', label: '获证情况', type: 'select', required: true, options: CERT_STATUS_OPTIONS, minWidth: 120 },
      { key: 'certNo', label: '证书编号', type: 'input', required: false, minWidth: 160, showWhen: { field: 'certStatus', value: '已获证' } },
      { key: 'certValidity', label: '证书有效期', type: 'daterange', required: false, minWidth: 260, showWhen: { field: 'certStatus', value: '已获证' } },
    ]
  },
  module_12: {
    minRows: 1,
    addLabel: '新增合作资源',
    columns: [
      { key: 'partnerName', label: '合作单位', type: 'input', required: true, minWidth: 200 },
      { key: 'product', label: '产品', type: 'input', required: true, minWidth: 160 },
      { key: 'testProject', label: '试验项目', type: 'input', required: true, minWidth: 200 },
      { key: 'testResource', label: '试验资源', type: 'textarea', required: true, minWidth: 240 },
    ]
  },
  module_13: {
    minRows: 1,
    addLabel: '新增联合研发',
    columns: [
      { key: 'projectName', label: '产品/项目名称', type: 'input', required: true, minWidth: 200 },
      { key: 'partnerUnit', label: '联合单位', type: 'input', required: true, minWidth: 200 },
      { key: 'collabType', label: '合作类型', type: 'select', required: true, options: COLLAB_TYPE_OPTIONS, minWidth: 120 },
      { key: 'period', label: '合作期限', type: 'daterange', required: false, minWidth: 260 },
    ]
  },
  module_14: {
    minRows: 1,
    addLabel: '新增使用记录',
    columns: [
      { key: 'railway', label: '配属局/公司', type: 'input', required: true, minWidth: 160 },
      { key: 'depot', label: '配属段', type: 'input', required: true, minWidth: 140 },
      { key: 'vehicleType', label: '车型', type: 'input', required: true, minWidth: 100 },
      { key: 'category', label: '制造/维修', type: 'select', required: true, options: MANUF_REPAIR_OPTIONS, minWidth: 140 },
      { key: 'quantity', label: '数量', type: 'number', required: true, min: 1, minWidth: 90 },
    ]
  },
}

// 获取空行模板
export function getEmptyRow(moduleCode) {
  const config = MODULE_TABLE_CONFIG[moduleCode]
  if (!config) return {}
  const row = { _id: Date.now() + Math.random() }
  config.columns.forEach(col => { row[col.key] = col.type === 'number' ? null : '' })
  return row
}
