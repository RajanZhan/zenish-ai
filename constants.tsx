
import { Task, TaskStatus, StepStatus, UIIntent, User, FileItem, OrganizationNode } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Zenith 管理员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZenithAdmin', role: '系统管理员', email: 'admin@zenith.ai', departmentId: 'org1' },
  { id: 'u2', name: '李明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiMing', role: '市场分析师', email: 'liming@zenith.ai', departmentId: 'org2' },
  { id: 'u3', name: '王芳', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangFang', role: '内容运营', email: 'wangfang@zenith.ai', departmentId: 'org2' },
  { id: 'u4', name: '赵武', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoWu', role: '视觉设计', email: 'zhaowu@zenith.ai', departmentId: 'org3' },
  { id: 'u5', name: '孙琪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunQi', role: '后端开发', email: 'sunqi@zenith.ai', departmentId: 'org4' },
];

export const CURRENT_USER = MOCK_USERS[0];

export const INITIAL_ORG: OrganizationNode[] = [
  {
    id: 'org1',
    name: 'Zenith 科技',
    description: '企业总部，负责整体战略与核心决策。',
    managerId: 'u1',
    children: [
      {
        id: 'org2',
        name: '市场部',
        description: '负责品牌推广、市场分析与用户增长。',
        managerId: 'u2',
        children: [
          { id: 'org2-1', name: '品牌组', managerId: 'u3' },
          { id: 'org2-2', name: '增长组' }
        ]
      },
      {
        id: 'org3',
        name: '设计部',
        description: '负责产品 UI/UX 设计与品牌视觉。',
        managerId: 'u4'
      },
      {
        id: 'org4',
        name: '研发部',
        description: '核心技术研发与系统稳定性维护。',
        managerId: 'u5',
        children: [
          { id: 'org4-1', name: '前端组' },
          { id: 'org4-2', name: '后端组', managerId: 'u5' },
          { id: 'org4-3', name: '测试组' }
        ]
      }
    ]
  }
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'f1',
    name: '2024 年度战略规划',
    type: 'FOLDER',
    size: '--',
    owner: MOCK_USERS[0],
    updatedAt: Date.now() - 3600000,
    isCloud: false,
    isStarred: true,
  },
  {
    id: 'f2',
    name: '市场部共享资源',
    type: 'FOLDER',
    size: '--',
    owner: MOCK_USERS[1],
    updatedAt: Date.now() - 7200000,
    isCloud: false,
    isStarred: false,
  },
  {
    id: 'f3',
    name: '项目视觉稿',
    type: 'FOLDER',
    size: '--',
    owner: MOCK_USERS[3],
    updatedAt: Date.now() - 10800000,
    isCloud: false,
    isStarred: false,
  },
  {
    id: 'd1',
    name: 'Q4 季度营销方案.docx',
    type: 'DOC',
    size: '2.4 MB',
    owner: MOCK_USERS[0],
    updatedAt: Date.now() - 1500000,
    isCloud: true,
    isStarred: true,
  },
  {
    id: 'd2',
    name: '全球销售数据分析.xlsx',
    type: 'SHEET',
    size: '1.2 MB',
    owner: MOCK_USERS[1],
    updatedAt: Date.now() - 86400000,
    isCloud: true,
    isStarred: false,
  },
  {
    id: 'd3',
    name: '产品发布会演示文稿.pptx',
    type: 'SLIDE',
    size: '15.8 MB',
    owner: MOCK_USERS[2],
    updatedAt: Date.now() - 43200000,
    isCloud: true,
    isStarred: false,
  },
  {
    id: 'i1',
    name: '品牌 Logo 高清.png',
    type: 'IMAGE',
    size: '4.5 MB',
    owner: MOCK_USERS[3],
    updatedAt: Date.now() - 172800000,
    isCloud: false,
    isStarred: true,
    thumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=300'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'T1',
    name: 'Q4 市场整合报告',
    description: '整合全球销售数据，分析行业趋势并生成 PDF 报告。',
    status: TaskStatus.RUNNING,
    initiator: MOCK_USERS[0],
    steps: [
      {
        id: 's1',
        name: '提取区域销售报表',
        status: StepStatus.SUCCEEDED,
        uiIntent: UIIntent.NONE,
        assignee: MOCK_USERS[1],
        submission: {
          content: '亚太地区本季度增长了 12%。',
          attachments: [],
          submittedAt: Date.now() - 10000000
        }
      },
      {
        id: 's2',
        name: '撰写行业趋势分析',
        status: StepStatus.RUNNING,
        uiIntent: UIIntent.FORM,
        assignee: MOCK_USERS[0]
      },
      {
        id: 's3',
        name: '生成最终 PDF',
        status: StepStatus.PENDING,
        uiIntent: UIIntent.NONE
      }
    ]
  },
  {
    id: 'T2',
    name: '社交媒体品牌周计划',
    description: '下周全平台内容排期与视觉资源协调。',
    status: TaskStatus.RUNNING,
    initiator: MOCK_USERS[0],
    steps: [
      { id: 's2-1', name: '文案初稿', status: StepStatus.RUNNING, uiIntent: UIIntent.NONE, assignee: MOCK_USERS[2] },
      { id: 's2-2', name: '视觉配套', status: StepStatus.PENDING, uiIntent: UIIntent.NONE, assignee: MOCK_USERS[3] }
    ]
  },
  {
    id: 'T3',
    name: 'Zenith 品牌视觉焕新',
    description: '全球品牌标识升级，包括字体、配色方案及 3D 辅助图形。',
    status: TaskStatus.DONE,
    initiator: MOCK_USERS[0],
    steps: [
      { id: 's3-1', name: 'Logo 设计', status: StepStatus.SUCCEEDED, uiIntent: UIIntent.NONE, assignee: MOCK_USERS[3] },
      { id: 's3-2', name: '规范手册', status: StepStatus.SUCCEEDED, uiIntent: UIIntent.NONE, assignee: MOCK_USERS[3] }
    ]
  },
  {
    id: 'T4',
    name: '核心官网 2.0 上线',
    description: '响应式官网前端重构与性能优化。',
    status: TaskStatus.DONE,
    initiator: MOCK_USERS[0],
    steps: [
      { id: 's4-1', name: '性能测试', status: StepStatus.SUCCEEDED, uiIntent: UIIntent.NONE, assignee: MOCK_USERS[4] }
    ]
  },
  {
    id: 'T5',
    name: '2025 年度战略研讨',
    description: '制定明年的产品路线图与核心增长指标。',
    status: TaskStatus.WAITING_INPUT,
    initiator: MOCK_USERS[0],
    steps: [
      {
        id: 's5-1',
        name: '各部门提案汇总',
        status: StepStatus.NEED_CONFIRM,
        uiIntent: UIIntent.FORM,
        assignee: CURRENT_USER,
        uiSchema: {
          title: '年度目标设定',
          fields: [{ key: 'target', label: '增长目标', type: 'number', required: true }],
          actions: [{ type: 'SUBMIT', label: '提交提案' }]
        }
      }
    ]
  }
];

export const WELCOME_MESSAGE = "欢迎回到 Zenith AI。复杂的团队协作已为您准备就绪。您可以点击左侧“待办”查看分配给您的任务，或在此直接下达新的协作指令。";
