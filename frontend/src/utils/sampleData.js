// 演示样本数据（预置在 localStorage 中，供管理员视图使用）

export const SAMPLE_REPORTS = [
  {
    id: 'RPT-2026-BJ001',
    companyName: '北京轨道装备制造有限公司',
    creditCode: '91110000100000001X',
    status: 'submitted',
    createdAt: '2026-04-20T08:00:00Z',
    submittedAt: '2026-04-25T10:30:00Z',
    updatedAt: '2026-04-25T10:30:00Z',
    contactPerson: '张明',
    contactPhone: '010-88881234',
    moduleCompletion: {
      module_01: true, module_02: true, module_03: true, module_04: true,
      module_05: true, module_06: true, module_07: true, module_08: true,
      module_09: true, module_10: true, module_11: true, module_12: false,
      module_13: false, module_14: true
    },
    moduleData: {
      module_01: {
        companyNameCn: '北京轨道装备制造有限公司',
        companyNameEn: 'Beijing Railway Equipment Manufacturing Co., Ltd.',
        creditCode: '91110000100000001X',
        licenseAuthority: '北京市市场监督管理局',
        licenseValidity: '2030-12-31',
        registeredCapital: 50000,
        companyNature: ['国有'],
        industry: ['铁路运输设备制造'],
        businessScope: '铁路机车车辆零部件设计、制造、维修及销售；轨道交通设备的研发与技术服务。',
        annualCheck: '已通过',
        iso9001Status: '已获证',
        iso9001CertNo: 'QMS-2023-BJ-001',
        iso9001Validity: '2026-12-31',
        isoTs22163Status: '已获证',
        isoTs22163CertNo: 'IRIS-2024-BJ-001',
        isoTs22163Validity: '2027-06-30',
        qualityManualName: 'QM-BJ-2024',
        qualityManualVersion: 'V3.0',
        qualityManualDate: '2024-01-15',
        afterSalesOrgName: '售后服务中心',
        afterSalesOrgContact: '李强 010-88885678',
        rdStrategy: '以自主创新为核心，重点发展高速列车关键零部件研发，推进智能制造转型。',
        totalStaff: 1250,
        technicalStaff: 380,
        technicalPercent: 30,
        staffWithTitle: 210,
        titlePercent: 17,
        highTitle: 45,
        midTitle: 98,
        juniorTitle: 67,
        rdStaff: 156,
        rdPercent: 12,
        doctoralStaff: 18,
        masterStaff: 86,
        bachelorStaff: 210,
        collegeStaff: 66,
        salesThreeYears: [
          { year: 2023, amount: 18600 },
          { year: 2024, amount: 21300 },
          { year: 2025, amount: 24800 }
        ],
        mainProducts: [
          { productName: '高速列车转向架', rdUnit: '北京交通大学', productCategory: ['制造'], productUsage: ['客运'], productModel: 'ZXJ-350', productCount: 1200, annualMaintainCount: 450 }
        ]
      },
      module_02: [
        { _id: 1, name: '王建国', gender: '男', age: 55, education: '大学本科', position: '董事长', title: '高级工程师', years: 15 },
        { _id: 2, name: '李敏华', gender: '女', age: 48, education: '硕士研究生', position: '总经理', title: '高级工程师', years: 10 },
        { _id: 3, name: '赵永强', gender: '男', age: 52, education: '大学本科', position: '总工程师', title: '正高级工程师', years: 18 },
        { _id: 4, name: '陈云飞', gender: '男', age: 45, education: '硕士研究生', position: '副总经理', title: '高级工程师', years: 8 },
      ],
      module_03: [
        { _id: 1, docNo: 'BJ-QM-001', docName: '质量管理手册', issueDate: '2024-01-15', category: '质量管理' },
        { _id: 2, docNo: 'BJ-QP-002', docName: '文件控制程序', issueDate: '2024-01-15', category: '质量管理' },
        { _id: 3, docNo: 'BJ-HR-001', docName: '员工招聘与培训管理制度', issueDate: '2023-06-01', category: '人力资源' },
        { _id: 4, docNo: 'BJ-PM-001', docName: '生产计划管理制度', issueDate: '2023-09-10', category: '生产管理' },
        { _id: 5, docNo: 'BJ-FM-001', docName: '财务管理制度', issueDate: '2023-03-20', category: '财务管理' },
      ],
      module_04: [
        { _id: 1, name: '张东阳', gender: '男', age: 38, title: '工程师', culture: '大学本科', major: '机械工程', expertise: '轨道车辆故障诊断', workYears: 12, remark: '' },
        { _id: 2, name: '刘晓燕', gender: '女', age: 32, title: '工程师', culture: '大学本科', major: '电气工程', expertise: '电气系统维护', workYears: 8, remark: '' },
        { _id: 3, name: '孙志远', gender: '男', age: 42, title: '高级工程师', culture: '硕士研究生', major: '车辆工程', expertise: '转向架检修', workYears: 16, remark: '团队负责人' },
      ],
      module_05: [
        { _id: 1, projectName: 'CRH380高速动车组转向架研发项目', period: ['2020-01-01', '2022-12-31'], features: '国内首创轻量化铝合金构架设计，通过国家铁路局型式试验，可靠性达到99.97%。' },
        { _id: 2, projectName: '城市轨道交通B型车构架技术升级', period: ['2022-06-01', '2024-05-31'], features: '采用有限元分析优化设计，减重8%，疲劳寿命提升至300万公里。' },
      ],
      module_06: [
        { _id: 1, facilityName: '精密加工车间', process: '机加工', location: '北京市昌平区工业园区A栋' },
        { _id: 2, facilityName: '焊接装配车间', process: '焊接/装配', location: '北京市昌平区工业园区B栋' },
        { _id: 3, facilityName: '热处理中心', process: '热处理', location: '北京市昌平区工业园区C栋' },
      ],
      module_07: [
        { _id: 1, equipName: '数控龙门铣床', model: 'GMC2030', quantity: 3, usage: '大型结构件加工', process: '机加工', location: 'A栋车间' },
        { _id: 2, equipName: '数控卧式加工中心', model: 'HMC800', quantity: 6, usage: '精密零件加工', process: '机加工', location: 'A栋车间' },
        { _id: 3, equipName: '自动化焊接机器人', model: 'OTC-AX-V6', quantity: 8, usage: '构架焊接', process: '焊接', location: 'B栋车间' },
      ],
      module_08: [
        { _id: 1, equipName: '构架焊接工装', model: 'ZJ-WZ-001', quantity: 4, usage: '保证焊接精度', process: '焊接', location: 'B栋车间' },
        { _id: 2, equipName: '轴箱装配工装', model: 'ZJ-ZP-002', quantity: 2, usage: '轴箱精确装配', process: '装配', location: 'B栋车间' },
      ],
      module_09: [
        { _id: 1, equipName: '三坐标测量机', model: 'Zeiss-CMM-700', quantity: 2, usage: '精密尺寸测量', process: '质量检测', location: 'C栋检测中心' },
        { _id: 2, equipName: '超声波探伤仪', model: 'Olympus-UT-310', quantity: 4, usage: '焊缝无损探伤', process: '质量检测', location: 'C栋检测中心' },
        { _id: 3, equipName: '疲劳试验台', model: 'MTS-809', quantity: 1, usage: '构架疲劳寿命验证', process: '型式试验', location: 'D栋试验台' },
      ],
      module_10: [
        { _id: 1, supplierName: '宝钢股份有限公司', supplyItems: '高强度钢板、型材', certStatus: '已获证', certNo: 'QMS-BSG-2023', certValidity: ['2023-06-01', '2026-05-31'] },
        { _id: 2, supplierName: '洛阳轴承研究所', supplyItems: '轴箱轴承', certStatus: '已获证', certNo: 'QMS-LYZ-2022', certValidity: ['2022-08-01', '2025-07-31'] },
        { _id: 3, supplierName: '株洲时代新材料', supplyItems: '橡胶弹性元件', certStatus: '不适用', certNo: '', certValidity: [] },
      ],
      module_11: [
        { _id: 1, outsourceName: '北京华盛热处理有限公司', outsourceItems: '构架热处理工序', certStatus: '已获证', certNo: 'QMS-HS-2023', certValidity: ['2023-01-01', '2025-12-31'] },
      ],
      module_14: [
        { _id: 1, railway: '北京铁路局集团', depot: '北京机务段', vehicleType: 'CRH380A', category: '制造', quantity: 120 },
        { _id: 2, railway: '上海铁路局集团', depot: '上海机务段', vehicleType: 'CRH380A', category: '维修', quantity: 45 },
        { _id: 3, railway: '广州铁路局集团', depot: '广州机务段', vehicleType: 'CRH2C', category: '维修', quantity: 30 },
      ],
    }
  },
  {
    id: 'RPT-2026-SH002',
    companyName: '上海铁路设备维修技术有限公司',
    creditCode: '91310000200000002X',
    status: 'submitted',
    createdAt: '2026-04-18T09:00:00Z',
    submittedAt: '2026-04-26T14:20:00Z',
    updatedAt: '2026-04-26T14:20:00Z',
    contactPerson: '刘海波',
    contactPhone: '021-66662345',
    moduleCompletion: {
      module_01: true, module_02: true, module_03: true, module_04: true,
      module_05: true, module_06: true, module_07: true, module_08: true,
      module_09: true, module_10: true, module_11: true, module_12: true,
      module_13: true, module_14: true
    },
    moduleData: {
      module_01: {
        companyNameCn: '上海铁路设备维修技术有限公司',
        companyNameEn: 'Shanghai Railway Equipment Maintenance Technology Co., Ltd.',
        creditCode: '91310000200000002X',
        licenseAuthority: '上海市市场监督管理局',
        licenseValidity: '2028-08-15',
        registeredCapital: 20000,
        companyNature: ['民营'],
        industry: ['铁路运输设备修理'],
        businessScope: '铁路机车车辆及零部件检修、维修；铁路轨道设备维护；相关技术服务与咨询。',
        annualCheck: '已通过',
        iso9001Status: '已获证',
        iso9001CertNo: 'QMS-2022-SH-005',
        iso9001Validity: '2025-09-30',
        isoTs22163Status: '未获证',
        isoTs22163CertNo: '',
        isoTs22163Validity: '',
        qualityManualName: 'SH-QM-2023',
        qualityManualVersion: 'V2.1',
        qualityManualDate: '2023-05-20',
        afterSalesOrgName: '技术服务部',
        afterSalesOrgContact: '陈浩 021-66665678',
        rdStrategy: '专注高铁动车组转向架系统维修技术积累，逐步建立完整的维修技术体系。',
        totalStaff: 680,
        technicalStaff: 210,
        technicalPercent: 31,
        staffWithTitle: 145,
        titlePercent: 21,
        highTitle: 22,
        midTitle: 68,
        juniorTitle: 55,
        rdStaff: 45,
        rdPercent: 7,
        doctoralStaff: 5,
        masterStaff: 38,
        bachelorStaff: 120,
        collegeStaff: 47,
        salesThreeYears: [
          { year: 2023, amount: 5800 },
          { year: 2024, amount: 6900 },
          { year: 2025, amount: 8200 }
        ],
        mainProducts: [
          { productName: '动车组转向架大修', rdUnit: '上海铁路局', productCategory: ['维修'], productUsage: ['客运'], productModel: 'CRH2A', productCount: 0, annualMaintainCount: 280 }
        ]
      },
      module_02: [
        { _id: 1, name: '刘海波', gender: '男', age: 50, education: '大学本科', position: '总经理', title: '高级工程师', years: 12 },
        { _id: 2, name: '吴雪梅', gender: '女', age: 44, education: '硕士研究生', position: '副总经理', title: '高级工程师', years: 7 },
        { _id: 3, name: '蒋志明', gender: '男', age: 48, education: '大学本科', position: '总工程师', title: '正高级工程师', years: 14 },
      ],
      module_03: [
        { _id: 1, docNo: 'SH-QM-001', docName: '质量管理手册', issueDate: '2023-05-20', category: '质量管理' },
        { _id: 2, docNo: 'SH-PM-001', docName: '检修作业规程', issueDate: '2023-05-20', category: '生产管理' },
        { _id: 3, docNo: 'SH-SM-001', docName: '安全生产管理制度', issueDate: '2023-08-10', category: '安全管理' },
      ],
      module_04: [
        { _id: 1, name: '周强', gender: '男', age: 36, title: '工程师', culture: '大学本科', major: '机械工程', expertise: '转向架系统维修', workYears: 10, remark: '' },
        { _id: 2, name: '许倩倩', gender: '女', age: 29, title: '助理工程师', culture: '大学本科', major: '电气工程', expertise: '制动系统维护', workYears: 5, remark: '' },
      ],
      module_05: [
        { _id: 1, projectName: 'CRH2型动车组转向架架大修技术研究', period: ['2021-03-01', '2023-02-28'], features: '形成完整的维修工艺规程，维修效率提升30%，获得铁路局批准资质。' },
      ],
      module_06: [
        { _id: 1, facilityName: '动车组检修库', process: '整体检修', location: '上海市嘉定区检修基地' },
        { _id: 2, facilityName: '零部件清洗间', process: '清洗', location: '上海市嘉定区检修基地辅楼' },
      ],
      module_07: [
        { _id: 1, equipName: '转向架拆解台', model: 'ZJ-CJ-001', quantity: 4, usage: '转向架整体拆解', process: '拆解', location: '检修库' },
        { _id: 2, equipName: '构架探伤设备', model: 'MT-UT-500', quantity: 2, usage: '磁粉超声探伤', process: '检测', location: '探伤间' },
      ],
      module_08: [
        { _id: 1, equipName: '轴承压装工装', model: 'YZ-001', quantity: 2, usage: '轴承精密压装', process: '装配', location: '装配间' },
      ],
      module_09: [
        { _id: 1, equipName: '轮对几何参数检测仪', model: 'WP-LDZ-300', quantity: 2, usage: '轮径轮缘检测', process: '质量检测', location: '检测间' },
        { _id: 2, equipName: '制动缸试验台', model: 'ZD-TEST-100', quantity: 1, usage: '制动缸性能验证', process: '测试', location: '试验间' },
      ],
      module_10: [
        { _id: 1, supplierName: '大连瓦轴集团', supplyItems: '车轴轴承', certStatus: '已获证', certNo: 'QMS-DZ-2023', certValidity: ['2023-04-01', '2026-03-31'] },
        { _id: 2, supplierName: '北京橡胶制品厂', supplyItems: '橡胶垫', certStatus: '未获证', certNo: '', certValidity: [] },
      ],
      module_11: [
        { _id: 1, outsourceName: '上海中仪检测技术服务有限公司', outsourceItems: '电气系统检测', certStatus: '已获证', certNo: 'QMS-SH-ZY-001', certValidity: ['2024-01-01', '2026-12-31'] },
      ],
      module_12: [
        { _id: 1, partnerName: '同济大学轨道交通研究院', product: 'CRH2型转向架', testProject: '构架疲劳试验', testResource: '同济大学轨道结构疲劳实验室，MTS疲劳试验台' },
      ],
      module_13: [
        { _id: 1, projectName: 'CRH2型转向架智能检修技术', partnerUnit: '日本川崎重工', collabType: '国际合作', period: ['2022-01-01', '2024-12-31'] },
      ],
      module_14: [
        { _id: 1, railway: '上海铁路局集团', depot: '上海动车段', vehicleType: 'CRH2A', category: '维修', quantity: 200 },
        { _id: 2, railway: '杭州铁路局集团', depot: '杭州动车段', vehicleType: 'CRH2C', category: '维修', quantity: 80 },
      ],
    }
  },
  {
    id: 'RPT-2026-CD003',
    companyName: '成都机车车辆制造集团有限公司',
    creditCode: '91510000300000003X',
    status: 'revision',
    createdAt: '2026-04-15T10:00:00Z',
    submittedAt: '2026-04-20T16:00:00Z',
    updatedAt: '2026-04-28T09:00:00Z',
    contactPerson: '谢建华',
    contactPhone: '028-85553456',
    revisionNote: '【退回原因】\n1. 模块07主要设备：请补充完善设备数量信息，部分设备数量填写为0，请核实修改。\n2. 模块10主要供方清单：已获证供方的证书有效期格式不正确，请重新填写。\n3. 模块01企业概况：注册资本金额单位请统一使用万元。',
    moduleCompletion: {
      module_01: true, module_02: true, module_03: true, module_04: true,
      module_05: true, module_06: true, module_07: true, module_08: true,
      module_09: true, module_10: true, module_11: false, module_12: false,
      module_13: true, module_14: true
    },
    moduleData: {
      module_01: {
        companyNameCn: '成都机车车辆制造集团有限公司',
        companyNameEn: 'Chengdu Locomotive Rolling Stock Manufacturing Group Co., Ltd.',
        creditCode: '91510000300000003X',
        registeredCapital: 80000,
        companyNature: ['国有'],
        industry: ['铁路运输设备制造'],
        businessScope: '机车车辆整车及关键零部件设计、制造；轨道交通装备的维修及检测服务。',
        annualCheck: '已通过',
        totalStaff: 3200,
        technicalStaff: 960,
        technicalPercent: 30,
        iso9001Status: '已获证',
        salesThreeYears: [
          { year: 2023, amount: 45000 },
          { year: 2024, amount: 52000 },
          { year: 2025, amount: 58000 }
        ]
      },
      module_02: [
        { _id: 1, name: '谢建华', gender: '男', age: 58, education: '大学本科', position: '董事长兼总经理', title: '高级工程师', years: 20 },
        { _id: 2, name: '冯晓云', gender: '女', age: 50, education: '硕士研究生', position: '副总经理', title: '高级工程师', years: 10 },
      ],
      module_03: [
        { _id: 1, docNo: 'CD-QM-001', docName: '质量管理手册', issueDate: '2023-03-01', category: '质量管理' },
      ],
      module_07: [
        { _id: 1, equipName: '大型卧式车床', model: 'CW6163', quantity: 0, usage: '大型轴类零件加工', process: '机加工', location: '加工车间A' },
        { _id: 2, equipName: '立式加工中心', model: 'VMC1060', quantity: 8, usage: '箱体类零件加工', process: '机加工', location: '加工车间B' },
      ],
    }
  },
  {
    id: 'RPT-2026-WH004',
    companyName: '武汉铁路科技有限公司',
    creditCode: '91420000400000004X',
    status: 'draft',
    createdAt: '2026-04-29T14:00:00Z',
    submittedAt: null,
    updatedAt: '2026-04-30T10:00:00Z',
    contactPerson: '马俊杰',
    contactPhone: '027-87654321',
    moduleCompletion: {
      module_01: true, module_02: false, module_03: false, module_04: false,
      module_05: false, module_06: false, module_07: false, module_08: false,
      module_09: false, module_10: false, module_11: false, module_12: false,
      module_13: false, module_14: false
    },
    moduleData: {
      module_01: {
        companyNameCn: '武汉铁路科技有限公司',
        creditCode: '91420000400000004X',
        registeredCapital: 8000,
        companyNature: ['民营'],
        industry: ['铁路运输设备修理'],
        totalStaff: 320,
        annualCheck: '已通过',
        iso9001Status: '已获证',
        salesThreeYears: [
          { year: 2023, amount: 3200 },
          { year: 2024, amount: 3800 },
          { year: 2025, amount: 4500 }
        ]
      }
    }
  }
]
