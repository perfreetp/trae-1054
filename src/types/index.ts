export interface DangerZone {
  id: string
  name: string
  type: 'danger' | 'warning'
  lat: number
  lng: number
  radius: number
  description: string
}

export interface Person {
  id: string
  name: string
  department: string
  role: string
  lat: number
  lng: number
  status: 'online' | 'offline' | 'warning'
}

export interface Vehicle {
  id: string
  plate: string
  type: string
  driver: string
  lat: number
  lng: number
  status: 'running' | 'stopped' | 'maintenance'
}

export interface RiskPoint {
  id: string
  name: string
  location: string
  level: 'high' | 'medium' | 'low'
  status: 'normal' | 'abnormal' | 'maintenance'
  lastCheck: string
  responsible: string
  description: string
}

export interface ApprovalRecord {
  time: string
  operator: string
  action: 'approve' | 'reject' | 'complete'
  opinion: string
}

export interface WorkPermit {
  id: string
  type: 'hot' | 'height' | 'confined' | 'electric'
  applicant: string
  department: string
  location: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  description: string
  safetyMeasures: string[]
  approvalRecords: ApprovalRecord[]
}

export interface PatrolRoute {
  id: string
  name: string
  checkpoints: string[]
  frequency: string
  responsible: string
}

export interface PatrolCheckResult {
  cameraId: string
  status: 'normal' | 'abnormal'
  remark: string
}

export interface PatrolRecord {
  id: string
  routeId: string
  routeName: string
  startTime: string
  endTime: string
  operator: string
  results: PatrolCheckResult[]
}

export interface RectificationRecord {
  time: string
  operator: string
  action: 'assign' | 'submit' | 'verify' | 'reject'
  description: string
  photos?: string[]
}

export interface HiddenDanger {
  id: string
  title: string
  location: string
  type: string
  level: 'critical' | 'major' | 'general'
  status: 'pending' | 'rectifying' | 'submitted' | 'verified' | 'closed'
  reporter: string
  reportTime: string
  deadline: string
  rectifier: string
  description: string
  rectificationRequirement: string
  rectificationFeedback: string
  rejectReason: string
  records: RectificationRecord[]
}

export interface EnvData {
  time: string
  dust: number
  noise: number
  temperature: number
  humidity: number
  pm25: number
  pm10: number
}

export interface SewageRecord {
  id: string
  time: string
  location: string
  type: 'sewage' | 'oil'
  level: 'normal' | 'abnormal' | 'critical'
  description: string
  status: 'pending' | 'processing' | 'processed'
  handler: string
  processResult: string
}

export interface Camera {
  id: string
  name: string
  location: string
  status: 'online' | 'offline'
  group: string
}

export interface EmergencyEvent {
  id: string
  title: string
  type: string
  level: 'level1' | 'level2' | 'level3' | 'level4'
  status: 'reported' | 'handling' | 'resolved' | 'closed'
  location: string
  reporter: string
  reportTime: string
  description: string
  planId: string
  handlers: string[]
  processLog: ProcessLog[]
  resolution: string
  closeNote: string
}

export interface ProcessLog {
  time: string
  operator: string
  action: string
  description: string
  type?: 'report' | 'start_plan' | 'notify' | 'handling' | 'resolve' | 'close'
}

export interface EmergencyPlan {
  id: string
  name: string
  type: string
  level: string
  content: string
  positions: string[]
}

export interface SafetyReport {
  month: string
  totalEvents: number
  resolvedEvents: number
  totalDangers: number
  closedDangers: number
  dangerTypes: { type: string; count: number }[]
  workPermits: number
  patrolCount: number
  envAbnormalities: number
}
