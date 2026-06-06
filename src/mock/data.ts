import type {
  DangerZone,
  Person,
  Vehicle,
  RiskPoint,
  WorkPermit,
  PatrolRoute,
  HiddenDanger,
  EnvData,
  SewageRecord,
  Camera,
  EmergencyEvent,
  EmergencyPlan,
  SafetyReport
} from '../types'

const baseLat = 31.2304
const baseLng = 121.4737

export const dangerZones: DangerZone[] = [
  { id: 'z1', name: '一号油罐区', type: 'danger', lat: baseLat + 0.002, lng: baseLng + 0.002, radius: 80, description: '易燃易爆区域，严禁烟火' },
  { id: 'z2', name: '化学品仓库', type: 'danger', lat: baseLat - 0.001, lng: baseLng + 0.003, radius: 60, description: '危险化学品储存区' },
  { id: 'z3', name: '集装箱堆场A', type: 'warning', lat: baseLat + 0.003, lng: baseLng - 0.001, radius: 100, description: '重型设备作业区，注意安全' },
  { id: 'z4', name: '码头前沿作业区', type: 'warning', lat: baseLat - 0.002, lng: baseLng - 0.002, radius: 120, description: '船舶装卸作业区' },
]

export const persons: Person[] = [
  { id: 'p1', name: '张三', department: '安全部', role: '安全员', lat: baseLat + 0.0015, lng: baseLng + 0.0015, status: 'online' },
  { id: 'p2', name: '李四', department: '操作部', role: '场桥司机', lat: baseLat + 0.0025, lng: baseLng - 0.0005, status: 'online' },
  { id: 'p3', name: '王五', department: '工程部', role: '维修工程师', lat: baseLat - 0.0005, lng: baseLng + 0.0025, status: 'warning' },
  { id: 'p4', name: '赵六', department: '操作部', role: '理货员', lat: baseLat - 0.0015, lng: baseLng - 0.0015, status: 'online' },
  { id: 'p5', name: '钱七', department: '安全部', role: '安全员', lat: baseLat + 0.001, lng: baseLng - 0.001, status: 'offline' },
]

export const vehicles: Vehicle[] = [
  { id: 'v1', plate: '港A-001', type: '集卡', driver: '陈师傅', lat: baseLat + 0.002, lng: baseLng, status: 'running' },
  { id: 'v2', plate: '港A-002', type: '叉车', driver: '刘师傅', lat: baseLat, lng: baseLng + 0.002, status: 'stopped' },
  { id: 'v3', plate: '港A-003', type: '场桥', driver: '周师傅', lat: baseLat - 0.001, lng: baseLng - 0.001, status: 'running' },
  { id: 'v4', plate: '港A-004', type: '巡逻车', driver: '吴师傅', lat: baseLat + 0.0005, lng: baseLng + 0.0005, status: 'running' },
]

export const riskPoints: RiskPoint[] = [
  { id: 'r1', name: '1号泊位起重机', location: '码头1区', level: 'high', status: 'normal', lastCheck: '2024-01-15 09:30', responsible: '张工', description: '大型起重设备，定期检查钢丝绳' },
  { id: 'r2', name: '油罐区消防系统', location: '油罐区A', level: 'high', status: 'abnormal', lastCheck: '2024-01-14 14:20', responsible: '李工', description: '消防压力偏低，需要检修' },
  { id: 'r3', name: '化学品仓库通风', location: '仓库B区', level: 'medium', status: 'normal', lastCheck: '2024-01-15 08:00', responsible: '王工', description: '通风系统运行正常' },
  { id: 'r4', name: '集装箱堆高机', location: '堆场C区', level: 'medium', status: 'maintenance', lastCheck: '2024-01-13 16:45', responsible: '赵工', description: ' scheduled maintenance' },
  { id: 'r5', name: '配电房', location: '中心区', level: 'low', status: 'normal', lastCheck: '2024-01-15 10:00', responsible: '钱工', description: '电力供应正常' },
]

export const workPermits: WorkPermit[] = [
  { id: 'wp1', type: 'hot', applicant: '陈工', department: '工程部', location: '油罐区旁维修间', startTime: '2024-01-16 09:00', endTime: '2024-01-16 17:00', status: 'pending', description: '管道焊接维修', safetyMeasures: ['配备灭火器', '清理易燃物', '专人监护'] },
  { id: 'wp2', type: 'height', applicant: '刘工', department: '操作部', location: '3号门机', startTime: '2024-01-16 08:30', endTime: '2024-01-16 12:00', status: 'approved', description: '更换信号灯', safetyMeasures: ['系安全带', '设置警示区', '天气确认'] },
  { id: 'wp3', type: 'confined', applicant: '周工', department: '工程部', location: '污水处理池', startTime: '2024-01-15 14:00', endTime: '2024-01-15 18:00', status: 'completed', description: '清理污泥', safetyMeasures: ['气体检测', '通风换气', '双人作业'] },
  { id: 'wp4', type: 'electric', applicant: '吴工', department: '工程部', location: '2号配电房', startTime: '2024-01-17 09:00', endTime: '2024-01-17 11:30', status: 'rejected', description: '更换变压器', safetyMeasures: ['断电挂牌', '验电接地', '专人监护'] },
]

export const patrolRoutes: PatrolRoute[] = [
  { id: 'pr1', name: '日班巡查路线', checkpoints: ['门卫', '办公楼', '油罐区', '码头', '堆场'], frequency: '每日2次', responsible: '安全部' },
  { id: 'pr2', name: '夜班巡查路线', checkpoints: ['围墙周界', '仓库', '配电房', '消防泵房'], frequency: '每2小时1次', responsible: '安保部' },
  { id: 'pr3', name: '专项安全巡查', checkpoints: ['化学品仓库', '气瓶间', '危废暂存点'], frequency: '每周1次', responsible: '环保部' },
]

export const hiddenDangers: HiddenDanger[] = [
  { id: 'hd1', title: '消防通道堆物', location: 'B栋办公楼西侧', type: '消防安全', level: 'major', status: 'rectifying', reporter: '张三', reportTime: '2024-01-14 10:30', deadline: '2024-01-18', rectifier: '行政部', description: '消防通道被杂物堵塞' },
  { id: 'hd2', title: '安全护栏损坏', location: '3号泊位', type: '设施安全', level: 'critical', status: 'pending', reporter: '李四', reportTime: '2024-01-15 08:00', deadline: '2024-01-16', rectifier: '工程部', description: '码头边缘护栏有3米断裂' },
  { id: 'hd3', title: '应急灯故障', location: '仓库A区', type: '消防安全', level: 'general', status: 'verified', reporter: '王五', reportTime: '2024-01-12 15:20', deadline: '2024-01-15', rectifier: '工程部', description: '3盏应急灯不亮' },
  { id: 'hd4', title: '电线裸露', location: '堆场控制室', type: '电气安全', level: 'major', status: 'closed', reporter: '赵六', reportTime: '2024-01-10 11:00', deadline: '2024-01-13', rectifier: '动力部', description: '控制柜内电线绝缘层破损' },
]

export const generateEnvData = (): EnvData[] => {
  const data: EnvData[] = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    data.push({
      time: `${time.getHours().toString().padStart(2, '0')}:00`,
      dust: Math.random() * 150 + 50,
      noise: Math.random() * 30 + 55,
      temperature: Math.random() * 15 + 5,
      humidity: Math.random() * 30 + 50,
      pm25: Math.random() * 75 + 25,
      pm10: Math.random() * 100 + 40,
    })
  }
  return data
}

export const sewageRecords: SewageRecord[] = [
  { id: 's1', time: '2024-01-15 14:30', location: '2号排污口', type: 'sewage', level: 'normal', description: '水质检测正常', handler: '环保部' },
  { id: 's2', time: '2024-01-15 10:15', location: '码头油污水池', type: 'oil', level: 'abnormal', description: '含油量略超标，已加强处理', handler: '环保部' },
  { id: 's3', time: '2024-01-14 16:45', location: '1号排污口', type: 'sewage', level: 'normal', description: 'COD达标排放', handler: '环保部' },
  { id: 's4', time: '2024-01-14 09:20', location: '维修区集水池', type: 'oil', level: 'critical', description: '发现油污泄漏，已启动应急预案', handler: '应急办' },
]

export const cameras: Camera[] = [
  { id: 'c1', name: '1号泊位摄像头', location: '1号泊位', status: 'online', group: '码头' },
  { id: 'c2', name: '2号泊位摄像头', location: '2号泊位', status: 'online', group: '码头' },
  { id: 'c3', name: '油罐区摄像头', location: '油罐区A', status: 'online', group: '仓储' },
  { id: 'c4', name: '仓库A摄像头', location: '仓库A区', status: 'offline', group: '仓储' },
  { id: 'c5', name: '大门摄像头', location: '正门入口', status: 'online', group: '周界' },
  { id: 'c6', name: '堆场A摄像头', location: '堆场A区', status: 'online', group: '堆场' },
  { id: 'c7', name: '办公楼大厅', location: '办公楼1楼', status: 'online', group: '办公' },
  { id: 'c8', name: '危险品仓库', location: '危化品仓库', status: 'online', group: '仓储' },
]

export const emergencyEvents: EmergencyEvent[] = [
  {
    id: 'e1',
    title: '化学品仓库冒烟',
    type: '火灾',
    level: 'level2',
    status: 'handling',
    location: '危化品仓库B区',
    reporter: '监控室',
    reportTime: '2024-01-15 14:25',
    description: '监控发现危化品仓库B区有烟雾冒出',
    planId: 'plan1',
    handlers: ['消防队', '安全部', '仓储部'],
    processLog: [
      { time: '2024-01-15 14:25', operator: '监控室', action: '事件上报', description: '发现烟雾，立即上报' },
      { time: '2024-01-15 14:27', operator: '值班主任', action: '启动预案', description: '启动二级火灾应急预案' },
      { time: '2024-01-15 14:30', operator: '消防队', action: '赶赴现场', description: '消防车已出发' },
    ]
  },
  {
    id: 'e2',
    title: '集卡追尾事故',
    type: '交通事故',
    level: 'level3',
    status: 'resolved',
    location: '港区大道中段',
    reporter: '路人',
    reportTime: '2024-01-14 09:15',
    description: '两辆集卡发生追尾，后车驾驶室变形',
    planId: 'plan2',
    handlers: ['安全部', '医务室', '操作部'],
    processLog: [
      { time: '2024-01-14 09:15', operator: '路人', action: '事件上报', description: '电话报警' },
      { time: '2024-01-14 09:18', operator: '安全部', action: '现场处置', description: '人员已救出，送医检查' },
      { time: '2024-01-14 10:30', operator: '安全部', action: '事件结案', description: '轻微受伤，无生命危险' },
    ]
  },
]

export const emergencyPlans: EmergencyPlan[] = [
  { id: 'plan1', name: '火灾爆炸应急预案', type: '火灾', level: '二级', content: '1. 立即报警并启动消防系统\n2. 组织人员疏散\n3. 切断电源和气源\n4. 消防队现场灭火\n5. 医疗救护待命', positions: ['值班主任', '消防队', '安全部', '医务室', '保卫部'] },
  { id: 'plan2', name: '交通事故应急预案', type: '交通事故', level: '三级', content: '1. 现场保护和人员救助\n2. 设置警示标志\n3. 联系医疗救援\n4. 事故调查和取证', positions: ['安全部', '医务室', '保卫部'] },
  { id: 'plan3', name: '化学品泄漏应急预案', type: '泄漏', level: '二级', content: '1. 佩戴防护装备\n2. 控制泄漏源\n3. 围堵收集泄漏物\n4. 通风换气\n5. 环境监测', positions: ['应急办', '消防队', '环保部', '安全部'] },
  { id: 'plan4', name: '人员伤亡应急预案', type: '人员伤亡', level: '三级', content: '1. 现场急救\n2. 拨打120\n3. 保护现场\n4. 通知家属', positions: ['医务室', '安全部', '行政部'] },
]

export const safetyReports: SafetyReport[] = [
  {
    month: '2024-01',
    totalEvents: 12,
    resolvedEvents: 10,
    totalDangers: 45,
    closedDangers: 38,
    dangerTypes: [
      { type: '消防安全', count: 12 },
      { type: '设施安全', count: 10 },
      { type: '电气安全', count: 8 },
      { type: '作业安全', count: 9 },
      { type: '交通安全', count: 6 },
    ],
    workPermits: 56,
    patrolCount: 180,
    envAbnormalities: 3,
  },
  {
    month: '2023-12',
    totalEvents: 8,
    resolvedEvents: 8,
    totalDangers: 52,
    closedDangers: 48,
    dangerTypes: [
      { type: '消防安全', count: 15 },
      { type: '设施安全', count: 12 },
      { type: '电气安全', count: 10 },
      { type: '作业安全', count: 8 },
      { type: '交通安全', count: 7 },
    ],
    workPermits: 63,
    patrolCount: 186,
    envAbnormalities: 5,
  },
]
