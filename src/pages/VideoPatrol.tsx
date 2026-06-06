import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tree,
  Tag,
  List,
  Select,
  Input,
  Badge,
  message,
  Modal,
} from 'antd'
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  FullscreenOutlined,
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import { cameras } from '../mock/data'
import type { Camera } from '../types'

const { Option } = Select

const VideoPatrol = () => {
  const [selectedCameras, setSelectedCameras] = useState<string[]>(['c1', 'c2', 'c3', 'c6'])
  const [searchText, setSearchText] = useState('')
  const [layout, setLayout] = useState('4')
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null)

  const cameraGroups = Array.from(new Set(cameras.map((c) => c.group)))

  const treeData: DataNode[] = cameraGroups.map((group) => ({
    title: group,
    key: group,
    children: cameras
      .filter((c) => c.group === group)
      .map((camera) => ({
        title: (
          <span>
            {camera.name}
            {camera.status === 'offline' && (
              <Tag color="default" style={{ marginLeft: 8 }} size="small">离线</Tag>
            )}
          </span>
        ),
        key: camera.id,
      })),
  }))

  const filteredCameras = cameras.filter(
    (c) => !searchText || c.name.includes(searchText) || c.location.includes(searchText)
  )

  const getCameraGrid = () => {
    const displayCameras = cameras.filter((c) => selectedCameras.includes(c.id))
    const count = parseInt(layout)
    const cols = count === 1 ? 1 : count === 4 ? 2 : count === 9 ? 3 : 4
    const rows = count === 1 ? 1 : count === 4 ? 2 : count === 9 ? 3 : 4

    return displayCameras.slice(0, count).map((camera, index) => (
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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
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
                <Button size="small" icon={<PlusOutlined />}>添加巡点</Button>
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
                在线 {cameras.filter((c) => c.status === 'online').length}/{cameras.length}
              </Tag>
            }
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
              <Input
                size="small"
                placeholder="搜索摄像头"
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
                  (k) => !cameraGroups.includes(k as string)
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

      <Row gutter={16}>
        <Col span={18}>
          <Card
            title="巡查任务"
            size="small"
            extra={
              <Space>
                <Button type="primary" size="small" icon={<PlayCircleOutlined />}>
                  开始巡查
                </Button>
                <Button size="small">巡查记录</Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card type="inner" size="small" title="日班巡查">
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    巡查点：8个
                  </p>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    巡查频率：每日2次
                  </p>
                  <p style={{ fontSize: 12, color: '#52c41a' }}>状态：正常</p>
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" size="small" title="夜班巡查">
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    巡查点：6个
                  </p>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    巡查频率：每2小时
                  </p>
                  <p style={{ fontSize: 12, color: '#faad14' }}>状态：进行中</p>
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" size="small" title="周界巡查">
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    巡查点：12个
                  </p>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    巡查频率：每4小时
                  </p>
                  <p style={{ fontSize: 12, color: '#52c41a' }}>状态：正常</p>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={6}>
          <Card title="异常告警" size="small" bodyStyle={{ padding: 0 }}>
            <List
              size="small"
              dataSource={[
                { time: '14:25', camera: '油罐区摄像头', content: '移动侦测告警' },
                { time: '10:15', camera: '仓库A摄像头', content: '设备离线' },
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 12px' }}>
                  <List.Item.Meta
                    avatar={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                    title={item.camera}
                    description={
                      <span>
                        {item.time} - {item.content}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

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
    </div>
  )
}

export default VideoPatrol
