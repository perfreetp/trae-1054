import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Button,
  Space,
  Table,
  Tag,
  List,
  Progress,
  Descriptions,
} from 'antd'
import {
  FileSearchOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { safetyReports, hiddenDangers } from '../mock/data'
import type { SafetyReport } from '../types'

const { Option } = Select

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-01')

  const currentReport = safetyReports.find((r) => r.month === selectedMonth) || safetyReports[0]

  const months = safetyReports.map((r) => r.month)

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
        data: currentReport.dangerTypes.map((dt) => ({
          value: dt.count,
          name: dt.type,
        })),
      },
    ],
  }

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
        data: safetyReports.map((r) => r.totalDangers),
        itemStyle: { color: '#ff4d4f' },
        smooth: true,
      },
      {
        name: '已关闭隐患',
        type: 'line',
        data: safetyReports.map((r) => r.closedDangers),
        itemStyle: { color: '#52c41a' },
        smooth: true,
      },
      {
        name: '突发事件',
        type: 'line',
        data: safetyReports.map((r) => r.totalEvents),
        itemStyle: { color: '#faad14' },
        smooth: true,
      },
      {
        name: '作业许可',
        type: 'line',
        data: safetyReports.map((r) => r.workPermits),
        itemStyle: { color: '#1890ff' },
        smooth: true,
      },
    ],
  }

  const unresolvedDangers = hiddenDangers.filter(
    (d) => d.status === 'pending' || d.status === 'rectifying'
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
          <Button icon={<PrinterOutlined />}>打印</Button>
          <Button icon={<DownloadOutlined />} type="primary">
            导出报告
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="突发事件"
              value={currentReport.totalEvents}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              suffix={`/ 解决 ${currentReport.resolvedEvents}`}
            />
            <Progress
              percent={Math.round((currentReport.resolvedEvents / currentReport.totalEvents) * 100)}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="隐患总数"
              value={currentReport.totalDangers}
              prefix={<FileSearchOutlined style={{ color: '#ff4d4f' }} />}
              suffix={`/ 关闭 ${currentReport.closedDangers}`}
            />
            <Progress
              percent={Math.round((currentReport.closedDangers / currentReport.totalDangers) * 100)}
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
              value={currentReport.workPermits}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="巡查次数"
              value={currentReport.patrolCount}
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
                  <Tag color={item.status === 'pending' ? 'warning' : 'processing'}>
                    {item.status === 'pending' ? '待整改' : '整改中'}
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
                共 {currentReport.totalEvents} 起，已解决 {currentReport.resolvedEvents} 起，解决率{' '}
                {Math.round((currentReport.resolvedEvents / currentReport.totalEvents) * 100)}%
              </Descriptions.Item>
              <Descriptions.Item label="隐患排查">
                共排查 {currentReport.totalDangers} 项，已闭环 {currentReport.closedDangers} 项，闭环率{' '}
                {Math.round((currentReport.closedDangers / currentReport.totalDangers) * 100)}%
              </Descriptions.Item>
              <Descriptions.Item label="作业许可">
                共审批 {currentReport.workPermits} 份
              </Descriptions.Item>
              <Descriptions.Item label="巡查工作">
                共开展巡查 {currentReport.patrolCount} 次
              </Descriptions.Item>
              <Descriptions.Item label="环境异常">
                记录环境异常 {currentReport.envAbnormalities} 起，均已处置
              </Descriptions.Item>
              <Descriptions.Item label="隐患类型统计">
                {currentReport.dangerTypes.map((dt, index) => (
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
    </div>
  )
}

export default Reports
