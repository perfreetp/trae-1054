import { useState, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tree,
  Tag,
  Select,
  Input,
  Badge,
  Modal,
  Tabs,
  Form,
  Table,
  Radio,
  message,
  Divider,
} from 'antd'
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  FullscreenOutlined,
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  RightOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import { cameras as initialCameras } from '../mock/data'
import type { Camera, PatrolRoute, PatrolRecord, PatrolCheckResult } from '../types'

const { Option } = Select
const { TabPane } = Tabs

interface VideoPatrolProps {
  routes: PatrolRoute[]
  setRoutes: React.Dispatch<React.SetStateAction<PatrolRoute[]>>
  patrolRecords: PatrolRecord[]
  setPatrolRecords: React.Dispatch<React.SetStateAction<PatrolRecord[]>>
}

const VideoPatrol: React.FC<VideoPatrolProps> = ({
  routes,
  setRoutes,
  patrolRecords,
  setPatrolRecords,
}) => {
  const [cameras] = useState<Camera[]>([...initialCameras])
  const [selectedCameras, setSelectedCameras] = useState<string[]>(['c1', 'c2', 'c3', 'c6'])
  const [searchText, setSearchText] = useState('')
  const [layout, setLayout] = useState('4')
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('monitor')

  const [routeModalVisible, setRouteModalVisible] = useState(false)
  const [routeForm] = Form.useForm()

  const [patrolModalVisible, setPatrolModalVisible] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0)
  const [patrolResults, setPatrolResults] = useState<PatrolCheckResult[]>([])
  const [currentRemark, setCurrentRemark] = useState('')
  const [currentStatus, setCurrentStatus] = useState<'normal' | 'abnormal'>('normal')

  const filteredCameras = useMemo(() => {
    return cameras.filter(
      (c) =>
        !searchText ||
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.location.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [cameras, searchText])

  const filteredGroups = useMemo(() => {
    return Array.from(new Set(filteredCameras.map((c) => c.group)))
  }, [filteredCameras])

  const treeData: DataNode[] = useMemo(() => {
    return filteredGroups.map((group) => ({
      title: group,
      key: group,
      children: filteredCameras
        .filter((c) => c.group === group)
        .map((camera) => ({
          title: (
            <span>
              {camera.name}
              {camera.status === 'offline' && (
                <Tag color="default" style={{ marginLeft: 8 }}>
                  离线
                </Tag>
              )}
            </span>
          ),
          key: camera.id,
        })),
    }))
  }, [filteredCameras, filteredGroups])

  const getCameraGrid = () => {
    const displayCameras = cameras.filter((c) => selectedCameras.includes(c.id))
    const count = parseInt(layout)
    const cols = count === 1 ? 1 : count === 4 ? 2 : count === 9 ? 3 : 4
    const rows = count === 1 ? 1 : count === 4 ? 2 : count === 9 ? 3 : 4

    return displayCameras.slice(0, count).map((camera) => (
      <Col span={24 / cols} key={camera.id} style={{ padding: 4 }}>
        <Card
          size="small"
          style={{
            height: `${100 / rows}%`,
            position: 'relative',
            background: '#000',
            border: 'none',
          }}
          bodyStyle={{
            padding: 0,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          extra={
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<FullscreenOutlined />}
                onClick={() => setFullscreenCamera(camera.id)}
                style={{ color: '#fff' }}
              />
            </Space>
          }
        >
          {camera.status === 'online' ? (
            <div style={{ color: '#fff', textAlign: 'center' }}>
              <VideoCameraOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 12 }}>实时监控中...</div>
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Badge status="processing" color="#52c41a" />
                <span style={{ fontSize: 12, color: '#52c41a' }}>LIVE</span>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', textAlign: 'center' }}>
              <VideoCameraOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 12 }}>设备离线</div>
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              color: '#fff',
              fontSize: 12,
              textShadow: '0 0 4px rgba(0,0,0,0.8)',
            }}
          >
            {camera.name}
          </div>
        </Card>
      </Col>
    ))
  }

  const handleAddRoute = () => {
    routeForm.resetFields()
    setRouteModalVisible(true)
  }

  const handleSaveRoute = () => {
    routeForm.validateFields().then((values) => {
      const newRoute: PatrolRoute = {
        id: `pr${Date.now()}`,
        name: values.name,
        checkpoints: values.checkpoints,
        frequency: values.frequency,
        responsible: values.responsible,
      }
      setRoutes([...routes, newRoute])
      setRouteModalVisible(false)
      message.success('路线创建成功')
    })
  }

  const handleDeleteRoute = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条巡查路线吗？',
      onOk: () => {
        setRoutes(routes.filter((r) => r.id !== id))
        message.success('删除成功')
      },
    })
  }

  const handleStartPatrol = (routeId: string) => {
    setSelectedRouteId(routeId)
    setCurrentCheckpointIndex(0)
    setPatrolResults([])
    setCurrentRemark('')
    setCurrentStatus('normal')
    setPatrolModalVisible(true)
  }

  const getCurrentRoute = () => {
    return routes.find((r) => r.id === selectedRouteId)
  }

  const getCurrentCamera = () => {
    const route = getCurrentRoute()
    if (!route) return null
    const cameraId = route.checkpoints[currentCheckpointIndex]
    return cameras.find((c) => c.id === cameraId)
  }

  const handleNextCheckpoint = () => {
    const currentCamera = getCurrentCamera()
    if (!currentCamera) return

    const result: PatrolCheckResult = {
      cameraId: currentCamera.id,
      status: currentStatus,
      remark: currentRemark,
    }

    const newResults = [...patrolResults, result]
    setPatrolResults(newResults)

    const route = getCurrentRoute()
    if (!route) return

    if (currentCheckpointIndex < route.checkpoints.length - 1) {
      setCurrentCheckpointIndex(currentCheckpointIndex + 1)
      setCurrentRemark('')
      setCurrentStatus('normal')
    } else {
      const newRecord: PatrolRecord = {
        id: `prec${Date.now()}`,
        routeId: route.id,
        routeName: route.name,
        startTime: new Date().toLocaleString('zh-CN'),
        endTime: new Date().toLocaleString('zh-CN'),
        operator: '当前用户',
        results: newResults,
      }
      setPatrolRecords([newRecord, ...patrolRecords])
      setPatrolModalVisible(false)
      message.success('巡查完成，记录已保存')
    }
  }

  const routeColumns = [
    {
      title: '路线名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '巡查点数量',
      key: 'checkpointCount',
      render: (_: any, record: PatrolRoute) => (
        <Tag color="blue">{record.checkpoints.length} 个</Tag>
      ),
    },
    {
      title: '巡查频次',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PatrolRoute) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartPatrol(record.id)}
          >
            开始巡查
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRoute(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const recordColumns = [
    {
      title: '路线名称',
      dataIndex: 'routeName',
      key: 'routeName',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '检查结果',
      key: 'result',
      render: (_: any, record: PatrolRecord) => {
        const abnormalCount = record.results.filter((r) => r.status === 'abnormal').length
        if (abnormalCount > 0) {
          return <Tag color="red">异常 {abnormalCount} 项</Tag>
        }
        return <Tag color="green">全部正常</Tag>
      },
    },
    {
      title: '详情',
      key: 'detail',
      render: (_: any, record: PatrolRecord) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            const details = record.results
              .map((r) => {
                const camera = cameras.find((c) => c.id === r.cameraId)
                return `${camera?.name || r.cameraId}: ${r.status === 'normal' ? '正常' : '异常'} - ${r.remark || '无备注'}`
              })
              .join('\n')
            Modal.info({
              title: '巡查详情',
              content: <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>,
              width: 600,
            })
          }}
        >
          查看
        </Button>
      ),
    },
  ]

  const renderMonitorTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={18}>
        <Card
          title={
            <Space>
              <VideoCameraOutlined />
              视频监控墙
            </Space>
          }
          extra={
            <Space>
              <Select value={layout} onChange={setLayout} style={{ width: 120 }} size="small">
                <Option value="1">1画面</Option>
                <Option value="4">4画面</Option>
                <Option value="9">9画面</Option>
                <Option value="16">16画面</Option>
              </Select>
            </Space>
          }
        >
          <Row gutter={[8, 8]}>{getCameraGrid()}</Row>
        </Card>
      </Col>

      <Col span={6}>
        <Card
          title="摄像头列表"
          size="small"
          bodyStyle={{ padding: 0 }}
          style={{ height: '100%' }}
          extra={
            <Tag color="success">
              在线 {cameras.filter((c) => c.status === 'online').length}/
              {cameras.length}
            </Tag>
          }
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <Input
              size="small"
              placeholder="搜索摄像头名称或位置"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <Tree
            showLine
            defaultExpandAll
            treeData={treeData}
            onSelect={(keys) => {
              const selectedKeys = keys.filter(
                (k) => !filteredGroups.includes(k as string)
              ) as string[]
              setSelectedCameras(selectedKeys)
            }}
            selectedKeys={selectedCameras}
            multiple
            style={{ padding: '8px 12px' }}
          />
        </Card>
      </Col>
    </Row>
  )

  const renderRouteTab = () => (
    <Card
      title={
        <Space>
          <DeploymentUnitOutlined />
          巡查路线管理
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoute}>
          新建路线
        </Button>
      }
    >
      <Table
        dataSource={routes}
        columns={routeColumns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Card>
  )

  const renderRecordTab = () => (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          巡查记录
        </Space>
      }
    >
      <Table
        dataSource={patrolRecords}
        columns={recordColumns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  )

  const currentRoute = getCurrentRoute()
  const currentCamera = getCurrentCamera()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <VideoCameraOutlined />
              视频监控
            </span>
          }
          key="monitor"
        >
          {renderMonitorTab()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <DeploymentUnitOutlined />
              巡查路线管理
            </span>
          }
          key="routes"
        >
          {renderRouteTab()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              巡查记录
            </span>
          }
          key="records"
        >
          {renderRecordTab()}
        </TabPane>
      </Tabs>

      <Modal
        title={fullscreenCamera ? cameras.find((c) => c.id === fullscreenCamera)?.name : ''}
        open={!!fullscreenCamera}
        onCancel={() => setFullscreenCamera(null)}
        footer={null}
        width={900}
      >
        <div
          style={{
            height: 500,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <VideoCameraOutlined style={{ fontSize: 64, marginBottom: 16 }} />
            <div>全屏监控画面</div>
          </div>
        </div>
      </Modal>

      <Modal
        title="新建巡查路线"
        open={routeModalVisible}
        onCancel={() => setRouteModalVisible(false)}
        onOk={handleSaveRoute}
        width={600}
      >
        <Form form={routeForm} layout="vertical">
          <Form.Item
            name="name"
            label="路线名称"
            rules={[{ required: true, message: '请输入路线名称' }]}
          >
            <Input placeholder="请输入路线名称" />
          </Form.Item>
          <Form.Item
            name="checkpoints"
            label="选择摄像头"
            rules={[{ required: true, message: '请选择摄像头' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择巡查摄像头"
              style={{ width: '100%' }}
            >
              {cameras.map((camera) => (
                <Option key={camera.id} value={camera.id}>
                  {camera.name} ({camera.location})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="frequency"
            label="巡查频次"
            rules={[{ required: true, message: '请输入巡查频次' }]}
          >
            <Input placeholder="例如：每日2次、每2小时1次" />
          </Form.Item>
          <Form.Item
            name="responsible"
            label="负责人/部门"
            rules={[{ required: true, message: '请输入负责人或部门' }]}
          >
            <Input placeholder="请输入负责人或部门" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`正在巡查：${currentRoute?.name || ''}`}
        open={patrolModalVisible}
        onCancel={() => {
          Modal.confirm({
            title: '确认退出',
            content: '巡查尚未完成，确定要退出吗？',
            onOk: () => setPatrolModalVisible(false),
          })
        }}
        footer={null}
        width={700}
      >
        {currentRoute && currentCamera && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue">
                  进度：{currentCheckpointIndex + 1} / {currentRoute.checkpoints.length}
                </Tag>
              </Space>
            </div>

            <Card
              title={
                <Space>
                  <VideoCameraOutlined />
                  {currentCamera.name}
                  <Tag color={currentCamera.status === 'online' ? 'green' : 'default'}>
                    {currentCamera.status === 'online' ? '在线' : '离线'}
                  </Tag>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <div
                style={{
                  height: 200,
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {currentCamera.status === 'online' ? (
                  <div style={{ textAlign: 'center' }}>
                    <VideoCameraOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                    <div>实时监控中...</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    <VideoCameraOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                    <div>设备离线</div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8, color: '#666' }}>
                位置：{currentCamera.location}
              </div>
            </Card>

            <Divider />

            <Form layout="vertical">
              <Form.Item label="检查结果" required>
                <Radio.Group
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  <Radio.Button value="normal">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      正常
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="abnormal">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      异常
                    </Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="备注">
                <Input.TextArea
                  rows={3}
                  placeholder="请输入备注信息（可选）"
                  value={currentRemark}
                  onChange={(e) => setCurrentRemark(e.target.value)}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={
                    currentCheckpointIndex < currentRoute.checkpoints.length - 1 ? (
                      <RightOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                  onClick={handleNextCheckpoint}
                >
                  {currentCheckpointIndex < currentRoute.checkpoints.length - 1
                    ? '下一个巡查点'
                    : '完成巡查'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VideoPatrol
