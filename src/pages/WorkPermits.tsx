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
  DatePicker,
  Checkbox,
  message,
  Descriptions,
  Timeline,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { WorkPermit, ApprovalRecord } from '../types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

interface WorkPermitsProps {
  permits: WorkPermit[]
  setPermits: React.Dispatch<React.SetStateAction<WorkPermit[]>>
}

const WorkPermits = ({ permits, setPermits }: WorkPermitsProps) => {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [addVisible, setAddVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null)
  const [approvalVisible, setApprovalVisible] = useState(false)
  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | 'complete'>('approve')
  const [approvalPermitId, setApprovalPermitId] = useState<string>('')
  const [form] = Form.useForm()
  const [approvalForm] = Form.useForm()

  const typeColorMap: Record<string, string> = {
    hot: 'red',
    height: 'orange',
    confined: 'purple',
    electric: 'blue',
  }

  const typeTextMap: Record<string, string> = {
    hot: '动火作业',
    height: '高处作业',
    confined: '受限空间',
    electric: '临时用电',
  }

  const statusColorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'default',
  }

  const statusTextMap: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已驳回',
    completed: '已完成',
  }

  const filteredPermits = permits.filter((item) => {
    const matchType = selectedType === 'all' || item.type === selectedType
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus
    const matchText =
      !searchText ||
      item.applicant.includes(searchText) ||
      item.location.includes(searchText) ||
      item.department.includes(searchText)
    return matchType && matchStatus && matchText
  })

  const openApprovalModal = (id: string, type: 'approve' | 'reject' | 'complete') => {
    setApprovalPermitId(id)
    setApprovalType(type)
    setApprovalVisible(true)
    approvalForm.resetFields()
  }

  const handleApprovalSubmit = () => {
    approvalForm.validateFields().then((values) => {
      const newRecord: ApprovalRecord = {
        time: dayjs().format('YYYY-MM-DD HH:mm'),
        operator: '当前用户',
        action: approvalType,
        opinion: values.opinion || '',
      }

      let newStatus: WorkPermit['status'] = 'pending'
      let successMessage = ''

      if (approvalType === 'approve') {
        newStatus = 'approved'
        successMessage = '已批准作业许可'
      } else if (approvalType === 'reject') {
        newStatus = 'rejected'
        successMessage = '已驳回作业许可'
      } else if (approvalType === 'complete') {
        newStatus = 'completed'
        successMessage = '作业已完成'
      }

      setPermits((prev) =>
        prev.map((p) =>
          p.id === approvalPermitId
            ? {
                ...p,
                status: newStatus,
                approvalRecords: [...(p.approvalRecords || []), newRecord],
              }
            : p
        )
      )

      if (selectedPermit?.id === approvalPermitId) {
        setSelectedPermit((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                approvalRecords: [...(prev.approvalRecords || []), newRecord],
              }
            : null
        )
      }

      message.success(successMessage)
      setApprovalVisible(false)
    })
  }

  const handleApprove = (id: string) => {
    openApprovalModal(id, 'approve')
  }

  const handleReject = (id: string) => {
    openApprovalModal(id, 'reject')
  }

  const handleComplete = (id: string) => {
    openApprovalModal(id, 'complete')
  }

  const columns: ColumnsType<WorkPermit> = [
    {
      title: '许可证编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '作业类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={typeColorMap[type]}>{typeTextMap[type]}</Tag>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '作业地点',
      dataIndex: 'location',
      key: 'location',
      width: 180,
    },
    {
      title: '作业时间',
      key: 'time',
      width: 240,
      render: (_, record) => (
        <span>
          {record.startTime} ~ {record.endTime}
        </span>
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
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPermit(record)
              setDetailVisible(true)
            }}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                批准
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                驳回
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record.id)}
            >
              作业完成
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const safetyMeasureLabels: Record<string, string> = {
        fire: '配备消防器材',
        guard: '专人现场监护',
        harness: '佩戴安全带/防护装备',
        gas: '气体检测合格',
        power: '切断电源/挂牌上锁',
        warning: '设置警示区域',
      }
      const newPermit: WorkPermit = {
        id: `wp${Date.now()}`,
        type: values.type,
        applicant: values.applicant,
        department: values.department,
        location: values.location,
        startTime: dayjs(values.timeRange[0]).format('YYYY-MM-DD HH:mm'),
        endTime: dayjs(values.timeRange[1]).format('YYYY-MM-DD HH:mm'),
        status: 'pending',
        description: values.description,
        safetyMeasures: (values.safetyMeasures || []).map(
          (m: string) => safetyMeasureLabels[m] || m
        ),
        approvalRecords: [],
      }
      setPermits((prev) => [newPermit, ...prev])
      message.success('作业许可申请已提交')
      setAddVisible(false)
      form.resetFields()
    })
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="作业许可总数"
              value={permits.length}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="待审核"
              value={permits.filter((p) => p.status === 'pending').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="进行中"
              value={permits.filter((p) => p.status === 'approved').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成"
              value={permits.filter((p) => p.status === 'completed').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索申请人、地点、部门"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ width: 150 }}
          >
            <Option value="all">全部类型</Option>
            <Option value="hot">动火作业</Option>
            <Option value="height">高处作业</Option>
            <Option value="confined">受限空间</Option>
            <Option value="electric">临时用电</Option>
          </Select>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 150 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已批准</Option>
            <Option value="rejected">已驳回</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
            申请作业许可
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPermits}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="申请作业许可"
        open={addVisible}
        onOk={handleAdd}
        onCancel={() => {
          setAddVisible(false)
          form.resetFields()
        }}
        width={700}
        okText="提交申请"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="作业类型"
                rules={[{ required: true, message: '请选择作业类型' }]}
              >
                <Select placeholder="请选择作业类型">
                  <Option value="hot">动火作业</Option>
                  <Option value="height">高处作业</Option>
                  <Option value="confined">受限空间作业</Option>
                  <Option value="electric">临时用电作业</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: '请输入申请人' }]}
              >
                <Input placeholder="请输入申请人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请输入部门' }]}
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="作业地点"
                rules={[{ required: true, message: '请输入作业地点' }]}
              >
                <Input placeholder="请输入作业地点" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="timeRange"
            label="作业时间"
            rules={[{ required: true, message: '请选择作业时间' }]}
          >
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="作业内容描述"
            rules={[{ required: true, message: '请输入作业内容' }]}
          >
            <TextArea rows={3} placeholder="请详细描述作业内容" />
          </Form.Item>
          <Form.Item
            name="safetyMeasures"
            label="安全措施"
          >
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="fire">配备消防器材</Checkbox>
                <Checkbox value="guard">专人现场监护</Checkbox>
                <Checkbox value="harness">佩戴安全带/防护装备</Checkbox>
                <Checkbox value="gas">气体检测合格</Checkbox>
                <Checkbox value="power">切断电源/挂牌上锁</Checkbox>
                <Checkbox value="warning">设置警示区域</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="作业许可详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        onOk={() => setDetailVisible(false)}
        width={700}
      >
        {selectedPermit && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="许可证编号">{selectedPermit.id}</Descriptions.Item>
              <Descriptions.Item label="作业类型">
                <Tag color={typeColorMap[selectedPermit.type]}>
                  {typeTextMap[selectedPermit.type]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedPermit.applicant}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedPermit.department}</Descriptions.Item>
              <Descriptions.Item label="作业地点" span={2}>
                {selectedPermit.location}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedPermit.startTime}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{selectedPermit.endTime}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColorMap[selectedPermit.status]}>
                  {statusTextMap[selectedPermit.status]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <p><strong>作业内容：</strong></p>
              <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {selectedPermit.description}
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              <p><strong>安全措施：</strong></p>
              {selectedPermit.safetyMeasures.map((measure, index) => (
                <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                  {measure}
                </Tag>
              ))}
            </div>
            {selectedPermit.approvalRecords && selectedPermit.approvalRecords.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p><strong>审批记录：</strong></p>
                <Timeline
                  items={selectedPermit.approvalRecords.map((record) => ({
                    color:
                      record.action === 'approve'
                        ? 'green'
                        : record.action === 'reject'
                        ? 'red'
                        : 'blue',
                    children: (
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>
                          {record.action === 'approve'
                            ? '批准'
                            : record.action === 'reject'
                            ? '驳回'
                            : '作业完成'}
                          <span style={{ color: '#999', marginLeft: 8, fontWeight: 'normal' }}>
                            {record.time}
                          </span>
                        </p>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                          审批人：{record.operator}
                        </p>
                        {record.opinion && (
                          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                            意见：{record.opinion}
                          </p>
                        )}
                      </div>
                    ),
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={
          approvalType === 'approve'
            ? '批准作业许可'
            : approvalType === 'reject'
            ? '驳回作业许可'
            : '确认作业完成'
        }
        open={approvalVisible}
        onOk={handleApprovalSubmit}
        onCancel={() => setApprovalVisible(false)}
        okText={
          approvalType === 'approve'
            ? '确认批准'
            : approvalType === 'reject'
            ? '确认驳回'
            : '确认完成'
        }
        okButtonProps={{
          danger: approvalType === 'reject',
          type: approvalType === 'reject' ? 'primary' : 'primary',
        }}
      >
        <Form form={approvalForm} layout="vertical">
          <Form.Item
            name="opinion"
            label={
              approvalType === 'complete' ? '完成情况说明' : '审批意见'
            }
            rules={
              approvalType === 'reject'
                ? [{ required: true, message: '请填写驳回理由' }]
                : []
            }
          >
            <TextArea
              rows={4}
              placeholder={
                approvalType === 'approve'
                  ? '请输入审批意见（选填）'
                  : approvalType === 'reject'
                  ? '请输入驳回理由（必填）'
                  : '请输入作业完成情况说明（选填）'
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WorkPermits
