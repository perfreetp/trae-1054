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
  Modal,
  Form,
  Input,
  message,
} from 'antd'
import {
  EnvironmentOutlined,
  SoundOutlined,
  CloudOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { generateEnvData } from '../mock/data'
import type { ColumnsType } from 'antd/es/table'
import type { EnvData, SewageRecord } from '../types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface EnvMonitorProps {
  records: SewageRecord[]
  setRecords: React.Dispatch<React.SetStateAction<SewageRecord[]>>
}

const EnvMonitor = ({ records, setRecords }: EnvMonitorProps) => {
  const [envData, setEnvData] = useState<EnvData[]>([])
  const [recordType, setRecordType] = useState<string>('all')
  const [recordStatus, setRecordStatus] = useState<string>('all')
  const [addRecordVisible, setAddRecordVisible] = useState(false)
  const [assignVisible, setAssignVisible] = useState(false)
  const [processVisible, setProcessVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<SewageRecord | null>(null)
  const [form] = Form.useForm()
  const [assignForm] = Form.useForm()
  const [processForm] = Form.useForm()

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

  const statusColorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    processed: 'green',
  }

  const statusTextMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    processed: '已处理',
  }

  const filteredRecords = records.filter(
    (r) =>
      (recordType === 'all' || r.type === recordType) &&
      (recordStatus === 'all' || r.status === recordStatus)
  )

  const pendingCount = records.filter((r) => r.status === 'pending').length
  const processingCount = records.filter((r) => r.status === 'processing').length
  const processedCount = records.filter((r) => r.status === 'processed').length

  const handleAssign = (record: SewageRecord) => {
    setCurrentRecord(record)
    setAssignVisible(true)
    assignForm.setFieldsValue({ handler: record.handler })
  }

  const handleAssignSubmit = () => {
    assignForm.validateFields().then((values) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === currentRecord?.id
            ? { ...r, handler: values.handler, status: 'processing' as const }
            : r
        )
      )
      message.success('处理人已分配')
      setAssignVisible(false)
      assignForm.resetFields()
      setCurrentRecord(null)
    })
  }

  const handleProcess = (record: SewageRecord) => {
    setCurrentRecord(record)
    setProcessVisible(true)
    processForm.setFieldsValue({ processResult: record.processResult })
  }

  const handleProcessSubmit = () => {
    processForm.validateFields().then((values) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === currentRecord?.id
            ? { ...r, processResult: values.processResult, status: 'processed' as const }
            : r
        )
      )
      message.success('处理结果已提交')
      setProcessVisible(false)
      processForm.resetFields()
      setCurrentRecord(null)
    })
  }

  const handleViewDetail = (record: SewageRecord) => {
    setCurrentRecord(record)
    setDetailVisible(true)
  }

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
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>,
    },
    { title: '情况描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (handler: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>{handler || '-'}</span>
        </Space>
      ),
    },
    {
      title: '处理结果',
      dataIndex: 'processResult',
      key: 'processResult',
      width: 150,
      ellipsis: true,
      render: (result: string) => result || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleAssign(record)}>
              分配处理人
            </Button>
          )}
          {record.status === 'processing' && (
            <Button type="link" size="small" onClick={() => handleProcess(record)}>
              填写处理结果
            </Button>
          )}
          {record.status === 'processed' && (
            <Tag color="green" icon={<CheckCircleOutlined />}>已完成</Tag>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ]

  const handleAddRecord = () => {
    form.validateFields().then((values) => {
      const newRecord: SewageRecord = {
        id: `s${Date.now()}`,
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        location: values.location,
        type: values.type,
        level: values.level,
        description: values.description,
        status: 'pending',
        handler: '',
        processResult: '',
      }
      setRecords((prev) => [newRecord, ...prev])
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
                color:
                  getStatusByValue(latestData?.dust || 0, [100, 150]) === 'success'
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
                color:
                  getStatusByValue(latestData?.noise || 0, [70, 85]) === 'success'
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
              value={records.filter((r) => r.level !== 'normal').length}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={processingCount}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="已处理"
              value={processedCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
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
                <Select
                  value={recordStatus}
                  onChange={setRecordStatus}
                  size="small"
                  style={{ width: 120 }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="pending">待处理</Option>
                  <Option value="processing">处理中</Option>
                  <Option value="processed">已处理</Option>
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
            <TextArea rows={3} placeholder="请详细描述异常情况" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配处理人"
        open={assignVisible}
        onOk={handleAssignSubmit}
        onCancel={() => {
          setAssignVisible(false)
          assignForm.resetFields()
          setCurrentRecord(null)
        }}
        width={500}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="handler"
            label="处理人"
            rules={[{ required: true, message: '请输入处理人' }]}
          >
            <Select placeholder="请选择或输入处理人">
              <Option value="环保部">环保部</Option>
              <Option value="安全部">安全部</Option>
              <Option value="工程部">工程部</Option>
              <Option value="操作部">操作部</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="填写处理结果"
        open={processVisible}
        onOk={handleProcessSubmit}
        onCancel={() => {
          setProcessVisible(false)
          processForm.resetFields()
          setCurrentRecord(null)
        }}
        width={600}
      >
        <Form form={processForm} layout="vertical">
          <Form.Item
            name="processResult"
            label="处理结果"
            rules={[{ required: true, message: '请输入处理结果' }]}
          >
            <TextArea rows={4} placeholder="请详细描述处理结果" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="异常记录详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false)
          setCurrentRecord(null)
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailVisible(false)
              setCurrentRecord(null)
            }}
          >
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentRecord && (
          <div>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>记录编号</div>
                <div style={{ fontSize: 14 }}>{currentRecord.id}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>记录时间</div>
                <div style={{ fontSize: 14 }}>{currentRecord.time}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>监测点位</div>
                <div style={{ fontSize: 14 }}>{currentRecord.location}</div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>异常类型</div>
                <div style={{ fontSize: 14 }}>
                  <Tag color={typeColorMap[currentRecord.type]}>
                    {typeTextMap[currentRecord.type]}
                  </Tag>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>异常等级</div>
                <div style={{ fontSize: 14 }}>
                  <Tag color={levelColorMap[currentRecord.level]}>
                    {levelTextMap[currentRecord.level]}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>处理状态</div>
                <div style={{ fontSize: 14 }}>
                  <Tag color={statusColorMap[currentRecord.status]}>
                    {statusTextMap[currentRecord.status]}
                  </Tag>
                </div>
              </Col>
            </Row>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#666', marginBottom: 4 }}>情况描述</div>
              <div style={{ fontSize: 14, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                {currentRecord.description}
              </div>
            </div>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <div style={{ color: '#666', marginBottom: 4 }}>处理人</div>
                <div style={{ fontSize: 14 }}>
                  {currentRecord.handler ? (
                    <Space>
                      <UserOutlined style={{ color: '#1890ff' }} />
                      <span>{currentRecord.handler}</span>
                    </Space>
                  ) : (
                    <span style={{ color: '#999' }}>-</span>
                  )}
                </div>
              </Col>
            </Row>
            <div>
              <div style={{ color: '#666', marginBottom: 4 }}>处理结果</div>
              <div style={{ fontSize: 14, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                {currentRecord.processResult || <span style={{ color: '#999' }}>暂无</span>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EnvMonitor
