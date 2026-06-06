import { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  List,
  message,
  DatePicker,
  Upload,
  Radio,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { riskPoints, patrolRoutes } from '../mock/data'
import type { RiskPoint, HiddenDanger, PatrolRoute, RectificationRecord } from '../types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface RiskPointsProps {
  dangers: HiddenDanger[]
  setDangers: React.Dispatch<React.SetStateAction<HiddenDanger[]>>
}

const RiskPoints = ({ dangers, setDangers }: RiskPointsProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | null>(null)
  const [tabKey, setTabKey] = useState('risks')
  const [addDangerVisible, setAddDangerVisible] = useState(false)
  const [assignVisible, setAssignVisible] = useState(false)
  const [submitVisible, setSubmitVisible] = useState(false)
  const [verifyVisible, setVerifyVisible] = useState(false)
  const [selectedDanger, setSelectedDanger] = useState<HiddenDanger | null>(null)
  const [dangerForm] = Form.useForm()
  const [assignForm] = Form.useForm()
  const [submitForm] = Form.useForm()
  const [verifyForm] = Form.useForm()

  const levelColorMap: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue',
  }

  const levelTextMap: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  }

  const statusColorMap: Record<string, string> = {
    normal: 'success',
    abnormal: 'error',
    maintenance: 'warning',
  }

  const statusTextMap: Record<string, string> = {
    normal: '正常',
    abnormal: '异常',
    maintenance: '维护中',
  }

  const dangerLevelColorMap: Record<string, string> = {
    critical: 'red',
    major: 'orange',
    general: 'blue',
  }

  const dangerLevelTextMap: Record<string, string> = {
    critical: '重大',
    major: '较大',
    general: '一般',
  }

  const dangerStatusColorMap: Record<string, string> = {
    pending: 'default',
    rectifying: 'processing',
    submitted: 'warning',
    verified: 'success',
    closed: 'success',
  }

  const dangerStatusTextMap: Record<string, string> = {
    pending: '待整改',
    rectifying: '整改中',
    submitted: '待验收',
    verified: '已验收',
    closed: '已关闭',
  }

  const filteredRisks = riskPoints.filter((item) => {
    const matchLevel = selectedLevel === 'all' || item.level === selectedLevel
    const matchText =
      !searchText ||
      item.name.includes(searchText) ||
      item.location.includes(searchText) ||
      item.responsible.includes(searchText)
    return matchLevel && matchText
  })

  const addRecord = (danger: HiddenDanger, record: RectificationRecord): HiddenDanger => {
    return {
      ...danger,
      records: [...danger.records, record],
    }
  }

  const handleAddDanger = () => {
    dangerForm.validateFields().then((values) => {
      const newDanger: HiddenDanger = {
        id: `hd${Date.now()}`,
        title: values.title,
        location: values.location,
        type: values.type,
        level: values.level,
        status: 'pending',
        reporter: values.reporter || '当前用户',
        reportTime: dayjs().format('YYYY-MM-DD HH:mm'),
        deadline: dayjs(values.deadline).format('YYYY-MM-DD'),
        rectifier: values.rectifier,
        description: values.description,
        rectificationRequirement: '',
        rectificationFeedback: '',
        rejectReason: '',
        records: [],
      }
      setDangers((prev) => [newDanger, ...prev])
      message.success('隐患已登记')
      setAddDangerVisible(false)
      dangerForm.resetFields()
    })
  }

  const handleAssign = (record: HiddenDanger) => {
    setSelectedDanger(record)
    assignForm.setFieldsValue({
      rectifier: record.rectifier,
      deadline: dayjs(record.deadline),
      rectificationRequirement: record.rectificationRequirement,
    })
    setAssignVisible(true)
  }

  const confirmAssign = () => {
    assignForm.validateFields().then((values) => {
      if (selectedDanger) {
        const newRecord: RectificationRecord = {
          time: dayjs().format('YYYY-MM-DD HH:mm'),
          operator: '安全主管',
          action: 'assign',
          description: values.rectificationRequirement || '下发整改任务',
        }
        setDangers((prev) =>
          prev.map((d) =>
            d.id === selectedDanger.id
              ? addRecord(
                  {
                    ...d,
                    status: 'rectifying' as const,
                    rectifier: values.rectifier,
                    deadline: dayjs(values.deadline).format('YYYY-MM-DD'),
                    rectificationRequirement: values.rectificationRequirement,
                  },
                  newRecord
                )
              : d
          )
        )
        message.success('整改任务已下发')
        setAssignVisible(false)
        assignForm.resetFields()
      }
    })
  }

  const handleSubmit = (record: HiddenDanger) => {
    setSelectedDanger(record)
    submitForm.setFieldsValue({
      rectificationFeedback: record.rectificationFeedback,
    })
    setSubmitVisible(true)
  }

  const confirmSubmit = () => {
    submitForm.validateFields().then((values) => {
      if (selectedDanger) {
        const newRecord: RectificationRecord = {
          time: dayjs().format('YYYY-MM-DD HH:mm'),
          operator: selectedDanger.rectifier,
          action: 'submit',
          description: values.rectificationFeedback || '提交整改完成',
          photos: [],
        }
        setDangers((prev) =>
          prev.map((d) =>
            d.id === selectedDanger.id
              ? addRecord(
                  {
                    ...d,
                    status: 'submitted' as const,
                    rectificationFeedback: values.rectificationFeedback,
                  },
                  newRecord
                )
              : d
          )
        )
        message.success('整改已提交，等待验收')
        setSubmitVisible(false)
        submitForm.resetFields()
      }
    })
  }

  const handleVerify = (record: HiddenDanger) => {
    setSelectedDanger(record)
    verifyForm.resetFields()
    setVerifyVisible(true)
  }

  const confirmVerify = () => {
    verifyForm.validateFields().then((values) => {
      if (selectedDanger) {
        const isPass = values.verifyResult === 'pass'
        const newRecord: RectificationRecord = {
          time: dayjs().format('YYYY-MM-DD HH:mm'),
          operator: '安全主管',
          action: isPass ? 'verify' : 'reject',
          description: isPass ? '验收通过' : values.rejectReason || '验收不通过',
        }
        setDangers((prev) =>
          prev.map((d) =>
            d.id === selectedDanger.id
              ? addRecord(
                  {
                    ...d,
                    status: isPass ? ('verified' as const) : ('rectifying' as const),
                    rejectReason: isPass ? '' : values.rejectReason,
                  },
                  newRecord
                )
              : d
          )
        )
        message.success(isPass ? '验收通过' : '已退回整改')
        setVerifyVisible(false)
        verifyForm.resetFields()
      }
    })
  }

  const handleClose = (id: string) => {
    setDangers((prev) =>
      prev.map((d) =>
        d.id === id
          ? addRecord(
              { ...d, status: 'closed' as const },
              {
                time: dayjs().format('YYYY-MM-DD HH:mm'),
                operator: '安全主管',
                action: 'verify',
                description: '已关闭',
              }
            )
          : d
      )
    )
    message.success('已关闭')
  }

  const riskColumns: ColumnsType<RiskPoint> = [
    {
      title: '风险点名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={levelColorMap[level]}>{levelTextMap[level]}</Tag>
      ),
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
      title: '最近检查',
      dataIndex: 'lastCheck',
      key: 'lastCheck',
      width: 160,
    },
    {
      title: '责任人',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRisk(record)
              setDetailVisible(true)
            }}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ]

  const dangerColumns: ColumnsType<HiddenDanger> = [
    {
      title: '隐患标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={dangerLevelColorMap[level]}>{dangerLevelTextMap[level]}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={dangerStatusColorMap[status]}>{dangerStatusTextMap[status]}</Tag>
      ),
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 80,
    },
    {
      title: '整改期限',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
    },
    {
      title: '整改责任人',
      dataIndex: 'rectifier',
      key: 'rectifier',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => handleAssign(record)}>
              下发整改
            </Button>
          )}
          {record.status === 'rectifying' && (
            <Button type="link" size="small" onClick={() => handleSubmit(record)}>
              提交整改
            </Button>
          )}
          {record.status === 'submitted' && (
            <Button type="link" size="small" onClick={() => handleVerify(record)}>
              验收
            </Button>
          )}
          {record.status === 'verified' && (
            <Button type="link" size="small" onClick={() => handleClose(record.id)}>
              关闭
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="风险点总数"
              value={riskPoints.length}
              prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="高风险点"
              value={riskPoints.filter((r) => r.level === 'high').length}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="待整改隐患"
              value={dangers.filter((d) => d.status === 'pending' || d.status === 'rectifying' || d.status === 'submitted').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成整改"
              value={dangers.filter((d) => d.status === 'closed' || d.status === 'verified').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        tabList={[
          { key: 'risks', tab: '风险点清单' },
          { key: 'dangers', tab: '隐患登记整改' },
          { key: 'patrol', tab: '巡查路线设置' },
        ]}
        activeTabKey={tabKey}
        onTabChange={(key) => setTabKey(key)}
        bodyStyle={{ paddingTop: 16 }}
      >
        {tabKey === 'risks' && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
              <Input
                placeholder="搜索风险点名称、位置、责任人"
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                value={selectedLevel}
                onChange={setSelectedLevel}
                style={{ width: 150 }}
              >
                <Option value="all">全部等级</Option>
                <Option value="high">高风险</Option>
                <Option value="medium">中风险</Option>
                <Option value="low">低风险</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />}>
                添加风险点
              </Button>
            </div>
            <Table
              columns={riskColumns}
              dataSource={filteredRisks}
              rowKey="id"
              size="middle"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}

        {tabKey === 'dangers' && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddDangerVisible(true)}
              >
                登记隐患
              </Button>
              <Button onClick={() => message.info('导出隐患清单')}>导出</Button>
            </div>
            <Table
              columns={dangerColumns}
              dataSource={dangers}
              rowKey="id"
              size="middle"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}

        {tabKey === 'patrol' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />}>新建路线</Button>
            </div>
            <Row gutter={[16, 16]}>
              {patrolRoutes.map((route: PatrolRoute) => (
                <Col span={8} key={route.id}>
                  <Card
                    title={route.name}
                    size="small"
                    extra={<Button type="link" size="small">编辑</Button>}
                  >
                    <p style={{ margin: '4px 0' }}>
                      <strong>巡查频率：</strong>{route.frequency}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>负责部门：</strong>{route.responsible}
                    </p>
                    <p style={{ margin: '8px 0 4px' }}>
                      <strong>检查点：</strong>
                    </p>
                    <List
                      size="small"
                      dataSource={route.checkpoints}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '2px 0' }}>· {item}</List.Item>
                      )}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Card>

      <Modal
        title="风险点详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        onOk={() => setDetailVisible(false)}
        width={600}
      >
        {selectedRisk && (
          <div>
            <p><strong>名称：</strong>{selectedRisk.name}</p>
            <p><strong>位置：</strong>{selectedRisk.location}</p>
            <p>
              <strong>风险等级：</strong>
              <Tag color={levelColorMap[selectedRisk.level]}>
                {levelTextMap[selectedRisk.level]}
              </Tag>
            </p>
            <p>
              <strong>状态：</strong>
              <Tag color={statusColorMap[selectedRisk.status]}>
                {statusTextMap[selectedRisk.status]}
              </Tag>
            </p>
            <p><strong>最近检查时间：</strong>{selectedRisk.lastCheck}</p>
            <p><strong>责任人：</strong>{selectedRisk.responsible}</p>
            <p style={{ marginTop: 12 }}>
              <strong>描述：</strong>
            </p>
            <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              {selectedRisk.description}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="登记隐患"
        open={addDangerVisible}
        onOk={handleAddDanger}
        onCancel={() => {
          setAddDangerVisible(false)
          dangerForm.resetFields()
        }}
        width={600}
        okText="提交登记"
      >
        <Form form={dangerForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="隐患标题"
                rules={[{ required: true, message: '请输入隐患标题' }]}
              >
                <Input placeholder="请简要描述隐患" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="隐患位置"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="请输入具体位置" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="隐患类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择">
                  <Option value="消防安全">消防安全</Option>
                  <Option value="设施安全">设施安全</Option>
                  <Option value="电气安全">电气安全</Option>
                  <Option value="作业安全">作业安全</Option>
                  <Option value="交通安全">交通安全</Option>
                  <Option value="环境安全">环境安全</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="隐患等级"
                rules={[{ required: true, message: '请选择等级' }]}
              >
                <Select placeholder="请选择">
                  <Option value="critical">重大隐患</Option>
                  <Option value="major">较大隐患</Option>
                  <Option value="general">一般隐患</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reporter"
                label="上报人"
                initialValue="当前用户"
              >
                <Input placeholder="请输入上报人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rectifier"
                label="整改责任人"
                rules={[{ required: true, message: '请输入责任人' }]}
              >
                <Input placeholder="请输入整改责任人" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="deadline"
            label="整改期限"
            rules={[{ required: true, message: '请选择期限' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择整改截止日期" />
          </Form.Item>
          <Form.Item
            name="description"
            label="隐患详情描述"
            rules={[{ required: true, message: '请输入详情' }]}
          >
            <TextArea rows={3} placeholder="请详细描述隐患情况" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="下发整改任务"
        open={assignVisible}
        onOk={confirmAssign}
        onCancel={() => {
          setAssignVisible(false)
          assignForm.resetFields()
        }}
        width={500}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="rectifier"
            label="整改责任人"
            rules={[{ required: true, message: '请输入责任人' }]}
          >
            <Input placeholder="请输入整改责任人" />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="整改期限"
            rules={[{ required: true, message: '请选择期限' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择整改截止日期" />
          </Form.Item>
          <Form.Item
            name="rectificationRequirement"
            label="整改要求"
            rules={[{ required: true, message: '请输入整改要求' }]}
          >
            <TextArea rows={3} placeholder="请详细描述整改要求" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="提交整改"
        open={submitVisible}
        onOk={confirmSubmit}
        onCancel={() => {
          setSubmitVisible(false)
          submitForm.resetFields()
        }}
        width={500}
      >
        <Form form={submitForm} layout="vertical">
          <Form.Item
            name="rectificationFeedback"
            label="整改反馈"
            rules={[{ required: true, message: '请输入整改反馈' }]}
          >
            <TextArea rows={4} placeholder="请详细描述整改完成情况" />
          </Form.Item>
          <Form.Item label="整改照片">
            <Upload listType="picture-card" beforeUpload={() => false}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传照片</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="验收隐患"
        open={verifyVisible}
        onOk={confirmVerify}
        onCancel={() => {
          setVerifyVisible(false)
          verifyForm.resetFields()
        }}
        width={500}
      >
        <Form form={verifyForm} layout="vertical">
          <Form.Item
            name="verifyResult"
            label="验收结果"
            rules={[{ required: true, message: '请选择验收结果' }]}
          >
            <Radio.Group>
              <Radio value="pass">验收通过</Radio>
              <Radio value="reject">退回整改</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) => prevValues.verifyResult !== curValues.verifyResult}
          >
            {({ getFieldValue }) =>
              getFieldValue('verifyResult') === 'reject' ? (
                <Form.Item
                  name="rejectReason"
                  label="退回原因"
                  rules={[{ required: true, message: '请输入退回原因' }]}
                >
                  <TextArea rows={3} placeholder="请详细说明退回原因" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RiskPoints
