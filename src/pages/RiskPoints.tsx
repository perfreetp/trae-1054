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
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { riskPoints, hiddenDangers, patrolRoutes } from '../mock/data'
import type { RiskPoint, HiddenDanger, PatrolRoute } from '../types'

const { Option } = Select

const RiskPoints = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | null>(null)
  const [tabKey, setTabKey] = useState('risks')

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
    verified: 'success',
    closed: 'success',
  }

  const dangerStatusTextMap: Record<string, string> = {
    pending: '待整改',
    rectifying: '整改中',
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
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => message.success('已下发整改任务')}>
              下发整改
            </Button>
          )}
          {record.status === 'rectifying' && (
            <Button type="link" size="small" onClick={() => message.success('已验收通过')}>
              验收
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
              value={hiddenDangers.filter((d) => d.status === 'pending' || d.status === 'rectifying').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="已完成整改"
              value={hiddenDangers.filter((d) => d.status === 'closed' || d.status === 'verified').length}
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
              <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('打开隐患登记表单')}>
                登记隐患
              </Button>
              <Button onClick={() => message.info('导出隐患清单')}>导出</Button>
            </div>
            <Table
              columns={dangerColumns}
              dataSource={hiddenDangers}
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
    </div>
  )
}

export default RiskPoints
