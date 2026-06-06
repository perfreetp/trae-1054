import { useState, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Button,
  Space,
  Tag,
  List,
  Progress,
  Descriptions,
  Modal,
} from 'antd'
import {
  FileSearchOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { WorkPermit, HiddenDanger, EmergencyEvent, SewageRecord, PatrolRecord } from '../types'

const { Option } = Select

interface ReportsProps {
  workPermits: WorkPermit[]
  dangers: HiddenDanger[]
  events: EmergencyEvent[]
  envRecords: SewageRecord[]
  patrolRecords: PatrolRecord[]
}

const Reports = ({ workPermits, dangers, events, envRecords, patrolRecords }: ReportsProps) => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const [previewVisible, setPreviewVisible] = useState(false)

  const currentMonthData = useMemo(() => {
    const monthPermits = workPermits
    const monthDangers = dangers
    const monthEvents = events
    const monthEnv = envRecords.filter((r) => r.level !== 'normal')
    const monthPatrols = patrolRecords

    const dangerTypeMap = new Map<string, number>()
    monthDangers.forEach((d) => {
      dangerTypeMap.set(d.type, (dangerTypeMap.get(d.type) || 0) + 1)
    })
    const dangerTypes = Array.from(dangerTypeMap.entries()).map(([type, count]) => ({ type, count }))

    return {
      month: selectedMonth,
      totalEvents: monthEvents.length,
      resolvedEvents: monthEvents.filter((e) => e.status === 'resolved' || e.status === 'closed').length,
      totalDangers: monthDangers.length,
      closedDangers: monthDangers.filter((d) => d.status === 'closed').length,
      dangerTypes,
      workPermits: monthPermits.length,
      patrolCount: monthPatrols.length,
      envAbnormalities: monthEnv.length,
    }
  }, [selectedMonth, workPermits, dangers, events, envRecords, patrolRecords])

  const unresolvedDangers = dangers.filter(
    (d) => d.status === 'pending' || d.status === 'rectifying' || d.status === 'submitted'
  )

  const levelColorMap: Record<string, string> = {
    critical: 'red',
    major: 'orange',
    general: 'blue',
  }

  const levelTextMap: Record<string, string> = {
    critical: '重大',
    major: '较大',
    general: '一般',
  }

  const statusTextMap: Record<string, string> = {
    pending: '待整改',
    rectifying: '整改中',
    submitted: '待验收',
    verified: '已验收',
    closed: '已关闭',
  }

  const dangerTypePieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '隐患类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: currentMonthData.dangerTypes.map((dt) => ({
          value: dt.count,
          name: dt.type,
        })),
      },
    ],
  }

  const months = ['2024-01', '2023-12']

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['隐患总数', '已关闭隐患', '突发事件', '作业许可'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '隐患总数',
        type: 'line',
        data: [currentMonthData.totalDangers, 52],
        itemStyle: { color: '#ff4d4f' },
        smooth: true,
      },
      {
        name: '已关闭隐患',
        type: 'line',
        data: [currentMonthData.closedDangers, 48],
        itemStyle: { color: '#52c41a' },
        smooth: true,
      },
      {
        name: '突发事件',
        type: 'line',
        data: [currentMonthData.totalEvents, 8],
        itemStyle: { color: '#faad14' },
        smooth: true,
      },
      {
        name: '作业许可',
        type: 'line',
        data: [currentMonthData.workPermits, 63],
        itemStyle: { color: '#1890ff' },
        smooth: true,
      },
    ],
  }

  const generateReportContent = () => {
    return `
${selectedMonth} 安全环保月报
================================
编制部门：安全管理室
编制时间：${new Date().toLocaleDateString()}

一、关键指标
--------------------------------
突发事件：共 ${currentMonthData.totalEvents} 起，已解决 ${currentMonthData.resolvedEvents} 起，解决率 ${currentMonthData.totalEvents > 0 ? Math.round((currentMonthData.resolvedEvents / currentMonthData.totalEvents) * 100) : 0}%
隐患排查：共排查 ${currentMonthData.totalDangers} 项，已闭环 ${currentMonthData.closedDangers} 项，闭环率 ${currentMonthData.totalDangers > 0 ? Math.round((currentMonthData.closedDangers / currentMonthData.totalDangers) * 100) : 0}%
作业许可：共审批 ${currentMonthData.workPermits} 份
巡查工作：共开展巡查 ${currentMonthData.patrolCount} 次
环境异常：记录环境异常 ${currentMonthData.envAbnormalities} 起

二、隐患类型统计
--------------------------------
${currentMonthData.dangerTypes.map((dt) => `  ${dt.type}: ${dt.count}项`).join('\n')}

三、未闭环事项
--------------------------------
${unresolvedDangers.length > 0 
  ? unresolvedDangers.map((d, i) => `  ${i + 1}. [${levelTextMap[d.level]}] ${d.title} - 地点：${d.location} - 状态：${statusTextMap[d.status]} - 责任人：${d.rectifier}`).join('\n')
  : '  暂无未闭环事项'}

四、下月重点工作
--------------------------------
1. 持续推进未闭环隐患整改工作
2. 加强重点区域安全巡查频次
3. 组织开展安全培训和应急演练
4. 完善环境监测设备维护计划
    `
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <span>月份：</span>
          <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 150 }}>
            {months.map((m) => (
              <Option key={m} value={m}>
                {m}
              </Option>
            ))}
          </Select>
        </Space>
        <Space>
          <Button icon={<DownloadOutlined />} type="primary" onClick={() => setPreviewVisible(true)}>
            导出报告
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="突发事件"
              value={currentMonthData.totalEvents}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              suffix={`/ 解决 ${currentMonthData.resolvedEvents}`}
            />
            <Progress
              percent={currentMonthData.totalEvents > 0 ? Math.round((currentMonthData.resolvedEvents / currentMonthData.totalEvents) * 100) : 0}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="隐患总数"
              value={currentMonthData.totalDangers}
              prefix={<FileSearchOutlined style={{ color: '#ff4d4f' }} />}
              suffix={`/ 关闭 ${currentMonthData.closedDangers}`}
            />
            <Progress
              percent={currentMonthData.totalDangers > 0 ? Math.round((currentMonthData.closedDangers / currentMonthData.totalDangers) * 100) : 0}
              size="small"
              status="active"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="作业许可"
              value={currentMonthData.workPermits}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="巡查次数"
              value={currentMonthData.patrolCount}
              prefix={<VideoCameraOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="安全趋势分析" size="small">
            <ReactECharts option={trendOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="隐患类型分布" size="small">
            <ReactECharts option={dangerTypePieOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title="未闭环隐患清单"
            size="small"
            extra={<Tag color="red">{unresolvedDangers.length} 项</Tag>}
          >
            <List
              dataSource={unresolvedDangers}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={levelColorMap[item.level]}>
                        {levelTextMap[item.level]}
                      </Tag>
                    }
                    title={item.title}
                    description={
                      <span>
                        地点：{item.location} | 责任人：{item.rectifier} | 期限：{item.deadline}
                      </span>
                    }
                  />
                  <Tag color={item.status === 'pending' ? 'warning' : item.status === 'submitted' ? 'processing' : 'blue'}>
                    {statusTextMap[item.status]}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={`${selectedMonth} 安全月报`} size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="报告月份">{selectedMonth}</Descriptions.Item>
              <Descriptions.Item label="编制部门">安全管理室</Descriptions.Item>
              <Descriptions.Item label="突发事件">
                共 {currentMonthData.totalEvents} 起，已解决 {currentMonthData.resolvedEvents} 起，解决率{' '}
                {currentMonthData.totalEvents > 0 ? Math.round((currentMonthData.resolvedEvents / currentMonthData.totalEvents) * 100) : 0}%
              </Descriptions.Item>
              <Descriptions.Item label="隐患排查">
                共排查 {currentMonthData.totalDangers} 项，已闭环 {currentMonthData.closedDangers} 项，闭环率{' '}
                {currentMonthData.totalDangers > 0 ? Math.round((currentMonthData.closedDangers / currentMonthData.totalDangers) * 100) : 0}%
              </Descriptions.Item>
              <Descriptions.Item label="作业许可">
                共审批 {currentMonthData.workPermits} 份
              </Descriptions.Item>
              <Descriptions.Item label="巡查工作">
                共开展巡查 {currentMonthData.patrolCount} 次
              </Descriptions.Item>
              <Descriptions.Item label="环境异常">
                记录环境异常 {currentMonthData.envAbnormalities} 起
              </Descriptions.Item>
              <Descriptions.Item label="隐患类型统计">
                {currentMonthData.dangerTypes.map((dt, index) => (
                  <Tag key={index} style={{ margin: 2 }}>
                    {dt.type}: {dt.count}项
                  </Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="下月重点工作">
                <ol style={{ paddingLeft: 20, margin: 0 }}>
                  <li>持续推进未闭环隐患整改工作</li>
                  <li>加强重点区域安全巡查频次</li>
                  <li>组织开展春季安全培训</li>
                  <li>完善应急预案演练计划</li>
                </ol>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Modal
        title="报告预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="download" type="primary" onClick={() => {
            const content = generateReportContent()
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${selectedMonth}-安全环保月报.txt`
            a.click()
            URL.revokeObjectURL(url)
          }}>
            下载文本文件
          </Button>,
        ]}
        width={700}
      >
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8, background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {generateReportContent()}
        </pre>
      </Modal>
    </div>
  )
}

export default Reports
