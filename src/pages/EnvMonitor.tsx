import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
} from 'antd'
import {
  EnvironmentOutlined,
  SoundOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { generateEnvData, sewageRecords } from '../mock/data'
import type { ColumnsType } from 'antd/es/table'
import type { EnvData, SewageRecord } from '../types'

const { Option } = Select
const { RangePicker } = DatePicker

const EnvMonitor = () => {
  const [envData, setEnvData] = useState<EnvData[]>([])
  const [recordType, setRecordType] = useState<string>('all')
  const [addRecordVisible, setAddRecordVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    setEnvData(generateEnvData())
  }, [])

  const latestData = envData[envData.length - 1]

  const getStatusByValue = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'success'
    if (value < thresholds[1]) return 'warning'
    return 'error'
  }

  const dustChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['粉尘浓度', 'PM2.5', 'PM10'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: envData.map((d) => d.time),
    },
    yAxis: { type: 'value', name: 'μg/m³' },
    series: [
      {
        name: '粉尘浓度',
        type: 'line',
        smooth: true,
        data: envData.map((d) => d.dust.toFixed(1)),
        itemStyle: { color: '#faad14' },
        areaStyle: { opacity: 0.3 },
      },
      {
        name: 'PM2.5',
        type: 'line',
        smooth: true,
        data: envData.map((d) => d.pm25.toFixed(1)),
        itemStyle: { color: '#ff4d4f' },
      },
      {
        name: 'PM10',
        type: 'line',
        smooth: true,
        data: envData.map((d) => d.pm10.toFixed(1)),
        itemStyle: { color: '#722ed1' },
      },
    ],
  }

  const noiseChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['噪声'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: envData.map((d) => d.time),
    },
    yAxis: { type: 'value', name: 'dB(A)' },
    series: [
      {
        name: '噪声',
        type: 'line',
        smooth: true,
        data: envData.map((d) => d.noise.toFixed(1)),
        itemStyle: { color: '#1890ff' },
        areaStyle: { opacity: 0.3, color: '#1890ff' },
        markLine: {
          data: [{ yAxis: 85, name: '警戒线', lineStyle: { color: '#ff4d4f' } }],
        },
      },
    ],
  }

  const tempHumidChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['温度', '湿度'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: envData.map((d) => d.time),
    },
    yAxis: [
      { type: 'value', name: '°C', position: 'left' },
      { type: 'value', name: '%', position: 'right' },
    ],
    series: [
      {
        name: '温度',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        data: envData.map((d) => d.temperature.toFixed(1)),
        itemStyle: { color: '#ff7a45' },
      },
      {
        name: '湿度',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: envData.map((d) => d.humidity.toFixed(1)),
        itemStyle: { color: '#13c2c2' },
      },
    ],
  }

  const levelColorMap: Record<string, string> = {
    normal: 'success',
    abnormal: 'warning',
    critical: 'error',
  }

  const levelTextMap: Record<string, string> = {
    normal: '正常',
    abnormal: '异常',
    critical: '严重',
  }

  const typeColorMap: Record<string, string> = {
    sewage: 'blue',
    oil: 'orange',
  }

  const typeTextMap: Record<string, string> = {
    sewage: '污水',
    oil: '油污',
  }

  const filteredRecords = sewageRecords.filter(
    (r) => recordType === 'all' || r.type === recordType
  )

  const columns: ColumnsType<SewageRecord> = [
    { title: '记录时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '监测点位', dataIndex: 'location', key: 'location', width: 150 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => <Tag color={typeColorMap[type]}>{typeTextMap[type]}</Tag>,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => <Tag color={levelColorMap[level]}>{levelTextMap[level]}</Tag>,
    },
    { title: '情况描述', dataIndex: 'description', key: 'description' },
    { title: '处理人', dataIndex: 'handler', key: 'handler', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
        </Space>
      ),
    },
  ]

  const handleAddRecord = () => {
    form.validateFields().then(() => {
      message.success('异常记录已登记')
      setAddRecordVisible(false)
      form.resetFields()
    })
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="粉尘浓度"
              value={latestData?.dust.toFixed(1) || 0}
              suffix="μg/m³"
              prefix={<CloudOutlined style={{ color: '#faad14' }} />}
              valueStyle={{
                color: getStatusByValue(latestData?.dust || 0, [100, 150]) === 'success'
                  ? '#52c41a'
                  : getStatusByValue(latestData?.dust || 0, [100, 150]) === 'warning'
                  ? '#faad14'
                  : '#ff4d4f',
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="噪声"
              value={latestData?.noise.toFixed(1) || 0}
              suffix="dB(A)"
              prefix={<SoundOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{
                color: getStatusByValue(latestData?.noise || 0, [70, 85]) === 'success'
                  ? '#52c41a'
                  : getStatusByValue(latestData?.noise || 0, [70, 85]) === 'warning'
                  ? '#faad14'
                  : '#ff4d4f',
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="PM2.5"
              value={latestData?.pm25.toFixed(1) || 0}
              suffix="μg/m³"
              prefix={<EnvironmentOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="环境异常"
              value={sewageRecords.filter((r) => r.level !== 'normal').length}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="粉尘监测趋势" size="small">
            <ReactECharts option={dustChartOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="噪声监测趋势" size="small">
            <ReactECharts option={noiseChartOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="温湿度监测" size="small">
            <ReactECharts option={tempHumidChartOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="污水/油污异常记录"
            size="small"
            extra={
              <Space>
                <Select
                  value={recordType}
                  onChange={setRecordType}
                  size="small"
                  style={{ width: 120 }}
                >
                  <Option value="all">全部类型</Option>
                  <Option value="sewage">污水</Option>
                  <Option value="oil">油污</Option>
                </Select>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setAddRecordVisible(true)}
                >
                  登记异常
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="登记环境异常"
        open={addRecordVisible}
        onOk={handleAddRecord}
        onCancel={() => {
          setAddRecordVisible(false)
          form.resetFields()
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="异常类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择">
                  <Option value="sewage">污水异常</Option>
                  <Option value="oil">油污异常</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="异常等级"
                rules={[{ required: true, message: '请选择等级' }]}
              >
                <Select placeholder="请选择">
                  <Option value="normal">一般</Option>
                  <Option value="abnormal">异常</Option>
                  <Option value="critical">严重</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="location"
            label="监测点位"
            rules={[{ required: true, message: '请输入点位' }]}
          >
            <Select placeholder="请选择或输入">
              <Option value="1号排污口">1号排污口</Option>
              <Option value="2号排污口">2号排污口</Option>
              <Option value="码头油污水池">码头油污水池</Option>
              <Option value="维修区集水池">维修区集水池</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="情况描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <textarea
              style={{ width: '100%', minHeight: 80, padding: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}
              placeholder="请详细描述异常情况"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EnvMonitor
