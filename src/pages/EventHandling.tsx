import { useState } from 'react'
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
  Timeline,
  List,
  Steps,
  Descriptions,
} from 'antd'
import {
  AlertOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  PhoneOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { emergencyPlans } from '../mock/data'
import type { EmergencyEvent, EmergencyPlan, ProcessLog } from '../types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Step } = Steps

interface EventHandlingProps {
  events: EmergencyEvent[]
  setEvents: React.Dispatch<React.SetStateAction<EmergencyEvent[]>>
}

const EventHandling = ({ events, setEvents }: EventHandlingProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [reportVisible, setReportVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [planVisible, setPlanVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EmergencyEvent | null>(null)
  const [addLogVisible, setAddLogVisible] = useState(false)
  const [resolveVisible, setResolveVisible] = useState(false)
  const [closeVisible, setCloseVisible] = useState(false)
  const [form] = Form.useForm()
  const [logForm] = Form.useForm()
  const [resolveForm] = Form.useForm()
  const [closeForm] = Form.useForm()

  const levelColorMap: Record<string, string> = {
    level1: 'red',
    level2: 'orange',
    level3: 'yellow',
    level4: 'blue',
  }

  const levelTextMap: Record<string, string> = {
    level1: '特别重大',
    level2: '重大',
    level3: '较大',
    level4: '一般',
  }

  const statusColorMap: Record<string, string> = {
    reported: 'warning',
    handling: 'processing',
    resolved: 'success',
    closed: 'default',
  }

  const statusTextMap: Record<string, string> = {
    reported: '已上报',
    handling: '处置中',
    resolved: '已解决',
    closed: '已结案',
  }

  const statusStepMap: Record<string, number> = {
    reported: 0,
    handling: 1,
    resolved: 2,
    closed: 3,
  }

  const timelineColorMap: Record<string, string> = {
    report: 'red',
    start_plan: 'orange',
    handling: 'blue',
    resolve: 'green',
    close: 'gray',
  }

  const filteredEvents = events.filter((item) => {
    const matchLevel = selectedLevel === 'all' || item.level === selectedLevel
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchLevel && matchStatus
  })

  const handleReport = () => {
    form.validateFields().then((values) => {
      const newEvent: EmergencyEvent = {
        id: `e${Date.now()}`,
        title: values.title,
        type: values.type,
        level: values.level,
        status: 'reported',
        location: values.location,
        reporter: '当前用户',
        reportTime: dayjs().format('YYYY-MM-DD HH:mm'),
        description: values.description,
        planId: '',
        handlers: [],
        processLog: [
          {
            time: dayjs().format('YYYY-MM-DD HH:mm'),
            operator: '当前用户',
            action: '事件上报',
            description: values.description,
            type: 'report',
          },
        ],
        resolution: '',
        closeNote: '',
      }
      setEvents((prev) => [newEvent, ...prev])
      message.success('事件已上报')
      setReportVisible(false)
      form.resetFields()
    })
  }

  const handleStartPlan = (plan: EmergencyPlan) => {
    if (!selectedEvent) return
    const newLog: ProcessLog = {
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      operator: '值班主任',
      action: '启动预案',
      description: `启动${plan.name}，已通知：${plan.positions.join('、')}`,
      type: 'start_plan',
    }
    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id
          ? {
              ...e,
              status: 'handling' as const,
              planId: plan.id,
              handlers: plan.positions,
              processLog: [...e.processLog, newLog],
            }
          : e
      )
    )
    setSelectedEvent((prev) =>
      prev
        ? {
            ...prev,
            status: 'handling' as const,
            planId: plan.id,
            handlers: plan.positions,
            processLog: [...prev.processLog, newLog],
          }
        : null
    )
    message.success(`应急预案已启动：${plan.name}，已通知相关岗位`)
    setPlanVisible(false)
  }

  const handleAddLog = () => {
    logForm.validateFields().then((values) => {
      if (!selectedEvent) return
      const newLog: ProcessLog = {
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        operator: values.operator,
        action: values.action,
        description: values.description,
        type: 'handling',
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? { ...e, processLog: [...e.processLog, newLog] }
            : e
        )
      )
      setSelectedEvent((prev) =>
        prev ? { ...prev, processLog: [...prev.processLog, newLog] } : null
      )
      message.success('处置记录已保存')
      setAddLogVisible(false)
      logForm.resetFields()
    })
  }

  const handleResolve = () => {
    resolveForm.validateFields().then((values) => {
      if (!selectedEvent) return
      const newLog: ProcessLog = {
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        operator: '当前用户',
        action: '事件解决',
        description: values.resolution,
        type: 'resolve',
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? {
                ...e,
                status: 'resolved' as const,
                resolution: values.resolution,
                processLog: [...e.processLog, newLog],
              }
            : e
        )
      )
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              status: 'resolved' as const,
              resolution: values.resolution,
              processLog: [...prev.processLog, newLog],
            }
          : null
      )
      message.success('事件已标记为解决')
      setResolveVisible(false)
      resolveForm.resetFields()
    })
  }

  const handleClose = () => {
    closeForm.validateFields().then((values) => {
      if (!selectedEvent) return
      const newLog: ProcessLog = {
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        operator: '当前用户',
        action: '结案归档',
        description: values.closeNote,
        type: 'close',
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? {
                ...e,
                status: 'closed' as const,
                closeNote: values.closeNote,
                processLog: [...e.processLog, newLog],
              }
            : e
        )
      )
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              status: 'closed' as const,
              closeNote: values.closeNote,
              processLog: [...prev.processLog, newLog],
            }
          : null
      )
      message.success('事件已结案')
      setCloseVisible(false)
      closeForm.resetFields()
    })
  }

  const notifyPositions = (positions: string[]) => {
    message.success(`已通知：${positions.join('、')}`)
  }

  const columns: ColumnsType<EmergencyEvent> = [
    {
      title: '事件标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
    },
    {
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={levelColorMap[level]}>{levelTextMap[level]}</Tag>
      ),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100,
    },
    {
      title: '上报时间',
      dataIndex: 'reportTime',
      key: 'reportTime',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedEvent(record)
              setDetailVisible(true)
            }}
          >
            详情
          </Button>
          {record.status === 'reported' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setSelectedEvent(record)
                setPlanVisible(true)
              }}
            >
              启动预案
            </Button>
          )}
          {record.status === 'handling' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setSelectedEvent(record)
                  setAddLogVisible(true)
                }}
              >
                记录处置
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedEvent(record)
                  setResolveVisible(true)
                }}
              >
                标记解决
              </Button>
            </>
          )}
          {record.status === 'resolved' && (
            <Button
              type="link"
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedEvent(record)
                setCloseVisible(true)
              }}
            >
              结案
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const sortedProcessLog = (logs: ProcessLog[]) => {
    return [...logs].sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf())
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="突发事件总数"
              value={events.length}
              prefix={<AlertOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="处置中"
              value={events.filter((e) => e.status === 'handling').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已解决"
              value={events.filter((e) => e.status === 'resolved' || e.status === 'closed').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="重大事件"
              value={events.filter((e) => e.level === 'level1' || e.level === 'level2').length}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="突发事件列表"
        extra={
          <Space>
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="all">全部级别</Option>
              <Option value="level1">特别重大</Option>
              <Option value="level2">重大</Option>
              <Option value="level3">较大</Option>
              <Option value="level4">一般</Option>
            </Select>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="all">全部状态</Option>
              <Option value="reported">已上报</Option>
              <Option value="handling">处置中</Option>
              <Option value="resolved">已解决</Option>
              <Option value="closed">已结案</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setReportVisible(true)}
            >
              上报事件
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredEvents}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="应急预案库" size="small">
            <List
              dataSource={emergencyPlans}
              renderItem={(plan) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" onClick={() => setPlanVisible(true)}>
                      查看
                    </Button>,
                    <Button
                      type="link"
                      size="small"
                      onClick={() => notifyPositions(plan.positions)}
                    >
                      通知岗位
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <FileTextOutlined />
                        {plan.name}
                      </Space>
                    }
                    description={
                      <span>
                        类型：{plan.type} | 级别：{plan.level} | 涉及岗位：
                        {plan.positions.join('、')}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="快速通知"
            size="small"
            extra={<Button type="primary" size="small">发送通知</Button>}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                '值班主任',
                '安全部',
                '消防队',
                '医务室',
                '保卫部',
                '操作部',
                '工程部',
                '环保部',
              ].map((pos) => (
                <Tag
                  key={pos}
                  color="blue"
                  style={{ padding: '4px 12px', cursor: 'pointer', fontSize: 14 }}
                  onClick={() => message.success(`已通知${pos}`)}
                >
                  <PhoneOutlined style={{ marginRight: 4 }} />
                  {pos}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="上报突发事件"
        open={reportVisible}
        onOk={handleReport}
        onCancel={() => {
          setReportVisible(false)
          form.resetFields()
        }}
        width={700}
        okText="提交上报"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="事件标题"
                rules={[{ required: true, message: '请输入事件标题' }]}
              >
                <Input placeholder="请简要描述事件" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="事件类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择">
                  <Option value="火灾">火灾</Option>
                  <Option value="泄漏">化学品泄漏</Option>
                  <Option value="交通事故">交通事故</Option>
                  <Option value="人员伤亡">人员伤亡</Option>
                  <Option value="设备故障">设备故障</Option>
                  <Option value="环境污染">环境污染</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label="事件级别"
                rules={[{ required: true, message: '请选择级别' }]}
              >
                <Select placeholder="请选择">
                  <Option value="level1">特别重大（I级）</Option>
                  <Option value="level2">重大（II级）</Option>
                  <Option value="level3">较大（III级）</Option>
                  <Option value="level4">一般（IV级）</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="发生地点"
                rules={[{ required: true, message: '请输入地点' }]}
              >
                <Input placeholder="请输入具体地点" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="事件详情"
            rules={[{ required: true, message: '请输入详情' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述事件情况、伤亡情况、已采取措施等"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="事件详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {selectedEvent && (
          <div>
            <Steps
              current={statusStepMap[selectedEvent.status]}
              style={{ marginBottom: 24 }}
              size="small"
            >
              <Step title="事件上报" icon={<ExclamationCircleOutlined />} />
              <Step title="启动预案" icon={<PlayCircleOutlined />} />
              <Step title="处置完成" icon={<CheckCircleOutlined />} />
              <Step title="结案归档" icon={<CloseCircleOutlined />} />
            </Steps>

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="事件标题">{selectedEvent.title}</Descriptions.Item>
              <Descriptions.Item label="事件类型">{selectedEvent.type}</Descriptions.Item>
              <Descriptions.Item label="级别">
                <Tag color={levelColorMap[selectedEvent.level]}>
                  {levelTextMap[selectedEvent.level]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="地点">{selectedEvent.location}</Descriptions.Item>
              <Descriptions.Item label="上报人">{selectedEvent.reporter}</Descriptions.Item>
              <Descriptions.Item label="上报时间">{selectedEvent.reportTime}</Descriptions.Item>
              <Descriptions.Item label="涉及部门" span={2}>
                {selectedEvent.handlers.length > 0
                  ? selectedEvent.handlers.join('、')
                  : '待分配'}
              </Descriptions.Item>
              <Descriptions.Item label="事件描述" span={2}>
                {selectedEvent.description}
              </Descriptions.Item>
              {selectedEvent.resolution && (
                <Descriptions.Item label="处置结果" span={2}>
                  {selectedEvent.resolution}
                </Descriptions.Item>
              )}
              {selectedEvent.closeNote && (
                <Descriptions.Item label="结案说明" span={2}>
                  {selectedEvent.closeNote}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Card title="处置过程记录" size="small">
              <Timeline>
                {sortedProcessLog(selectedEvent.processLog).map((log, index) => (
                  <Timeline.Item
                    key={index}
                    color={log.type ? timelineColorMap[log.type] : 'gray'}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>{log.action}</strong> - {log.operator}
                      <span style={{ color: '#999', marginLeft: 8 }}>{log.time}</span>
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>{log.description}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="选择应急预案"
        open={planVisible}
        onCancel={() => setPlanVisible(false)}
        footer={null}
        width={700}
      >
        <List
          dataSource={emergencyPlans}
          renderItem={(plan) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleStartPlan(plan)}
                >
                  启动此预案
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={plan.name}
                description={
                  <div>
                    <p style={{ margin: '4px 0' }}>
                      类型：{plan.type} | 级别：{plan.level}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      涉及岗位：{plan.positions.join('、')}
                    </p>
                    <p style={{ margin: '4px 0', whiteSpace: 'pre-line' }}>{plan.content}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title="记录处置过程"
        open={addLogVisible}
        onOk={handleAddLog}
        onCancel={() => {
          setAddLogVisible(false)
          logForm.resetFields()
        }}
        width={600}
      >
        <Form form={logForm} layout="vertical">
          <Form.Item
            name="action"
            label="处置动作"
            rules={[{ required: true, message: '请输入处置动作' }]}
          >
            <Select placeholder="请选择或输入">
              <Option value="现场勘查">现场勘查</Option>
              <Option value="人员疏散">人员疏散</Option>
              <Option value="灭火作业">灭火作业</Option>
              <Option value="医疗救护">医疗救护</Option>
              <Option value="泄漏控制">泄漏控制</Option>
              <Option value="现场清理">现场清理</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="operator"
            label="操作人"
            rules={[{ required: true, message: '请输入操作人' }]}
          >
            <Input placeholder="请输入操作人姓名" />
          </Form.Item>
          <Form.Item
            name="description"
            label="处置详情"
            rules={[{ required: true, message: '请输入详情' }]}
          >
            <TextArea rows={4} placeholder="请详细描述处置过程和结果" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="标记事件解决"
        open={resolveVisible}
        onOk={handleResolve}
        onCancel={() => {
          setResolveVisible(false)
          resolveForm.resetFields()
        }}
        width={600}
        okText="确认解决"
      >
        <Form form={resolveForm} layout="vertical">
          <Form.Item
            name="resolution"
            label="处置结果"
            rules={[{ required: true, message: '请填写处置结果' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述事件处置结果、伤亡情况、财产损失情况等"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="结案归档"
        open={closeVisible}
        onOk={handleClose}
        onCancel={() => {
          setCloseVisible(false)
          closeForm.resetFields()
        }}
        width={600}
        okText="确认结案"
      >
        <Form form={closeForm} layout="vertical">
          <Form.Item
            name="closeNote"
            label="结案说明"
            rules={[{ required: true, message: '请填写结案说明' }]}
          >
            <TextArea
              rows={4}
              placeholder="请填写结案说明、经验教训、改进措施等"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EventHandling
