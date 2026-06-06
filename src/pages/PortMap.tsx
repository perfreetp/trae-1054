import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Checkbox,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
} from 'antd'
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  Tooltip,
} from 'react-leaflet'
import L from 'leaflet'
import {
  EnvironmentOutlined,
  UserOutlined,
  CarOutlined,
  WarningOutlined,
  AlertOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { dangerZones as initialZones, persons, vehicles } from '../mock/data'
import type { DangerZone } from '../types'

const { Option } = Select
const { TextArea } = Input

const personIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div class="person-marker">人</div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const vehicleIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div class="vehicle-marker">车</div>',
  iconSize: [24, 16],
  iconAnchor: [12, 8],
})

const PortMap = () => {
  const [zones, setZones] = useState<DangerZone[]>([...initialZones])
  const [showZones, setShowZones] = useState(true)
  const [showPersons, setShowPersons] = useState(true)
  const [showVehicles, setShowVehicles] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const center: [number, number] = [31.2304, 121.4737]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return 'success'
      case 'warning':
        return 'warning'
      case 'offline':
      case 'stopped':
        return 'default'
      default:
        return 'default'
    }
  }

  const handleAddZone = () => {
    form.validateFields().then((values) => {
      const newZone: DangerZone = {
        id: `z${Date.now()}`,
        name: values.name,
        type: values.type,
        description: values.description,
        lat: values.lat,
        lng: values.lng,
        radius: values.radius,
      }
      setZones((prev) => [...prev, newZone])
      message.success('区域已添加')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="危险区域"
              value={zones.length}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="在线人员"
              value={persons.filter((p) => p.status === 'online').length}
              suffix={`/ ${persons.length}`}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="运行车辆"
              value={vehicles.filter((v) => v.status === 'running').length}
              suffix={`/ ${vehicles.length}`}
              prefix={<CarOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="异常告警"
              value={2}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ flex: 1, display: 'flex', gap: 16 }}>
        <Card
          style={{ flex: 1, padding: 0 }}
          bodyStyle={{ padding: 0, height: '100%' }}
          title={
            <Space>
              <EnvironmentOutlined />
              港区电子地图
            </Space>
          }
          extra={
            <Space size="small">
              <Checkbox checked={showZones} onChange={(e) => setShowZones(e.target.checked)}>
                危险区域
              </Checkbox>
              <Checkbox checked={showPersons} onChange={(e) => setShowPersons(e.target.checked)}>
                人员
              </Checkbox>
              <Checkbox checked={showVehicles} onChange={(e) => setShowVehicles(e.target.checked)}>
                车辆
              </Checkbox>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                新增区域
              </Button>
            </Space>
          }
        >
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showZones &&
              zones.map((zone) => (
                <Circle
                  key={zone.id}
                  center={[zone.lat, zone.lng]}
                  radius={zone.radius}
                  pathOptions={{
                    color: zone.type === 'danger' ? '#ff4d4f' : '#faad14',
                    fillColor: zone.type === 'danger' ? '#ff4d4f' : '#faad14',
                    fillOpacity: 0.3,
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div>
                      <strong>{zone.name}</strong>
                      <br />
                      {zone.description}
                    </div>
                  </Tooltip>
                </Circle>
              ))}

            {showPersons &&
              persons.map((person) => (
                <Marker
                  key={person.id}
                  position={[person.lat, person.lng]}
                  icon={personIcon}
                >
                  <Popup>
                    <div>
                      <strong>{person.name}</strong>
                      <br />
                      部门: {person.department}
                      <br />
                      职位: {person.role}
                      <br />
                      状态:{' '}
                      {person.status === 'online'
                        ? '在线'
                        : person.status === 'warning'
                        ? '异常'
                        : '离线'}
                    </div>
                  </Popup>
                </Marker>
              ))}

            {showVehicles &&
              vehicles.map((vehicle) => (
                <Marker
                  key={vehicle.id}
                  position={[vehicle.lat, vehicle.lng]}
                  icon={vehicleIcon}
                >
                  <Popup>
                    <div>
                      <strong>{vehicle.plate}</strong>
                      <br />
                      类型: {vehicle.type}
                      <br />
                      司机: {vehicle.driver}
                      <br />
                      状态:{' '}
                      {vehicle.status === 'running'
                        ? '行驶中'
                        : vehicle.status === 'stopped'
                        ? '已停止'
                        : '维修中'}
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </Card>

        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card
            title="危险区域列表"
            size="small"
            style={{ flex: 1 }}
            bodyStyle={{ padding: 0 }}
            extra={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                新增
              </Button>
            }
          >
            <List
              dataSource={zones}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 16px' }}>
                  <List.Item.Meta
                    avatar={
                      <Tag color={item.type === 'danger' ? 'red' : 'orange'}>
                        {item.type === 'danger' ? '高危' : '警示'}
                      </Tag>
                    }
                    title={item.name}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="人员与车辆"
            size="small"
            extra={<Button type="link" size="small">更多</Button>}
          >
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>人员 ({persons.length})</div>
              {persons.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}
                >
                  <span>{p.name}</span>
                  <Tag color={getStatusColor(p.status)}>
                    {p.status === 'online' ? '在线' : p.status === 'warning' ? '异常' : '离线'}
                  </Tag>
                </div>
              ))}
              <div style={{ marginTop: 12, fontWeight: 500 }}>车辆 ({vehicles.length})</div>
              {vehicles.slice(0, 3).map((v) => (
                <div
                  key={v.id}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}
                >
                  <span>{v.plate}</span>
                  <Tag color={getStatusColor(v.status)}>
                    {v.status === 'running' ? '行驶' : v.status === 'stopped' ? '停止' : '维修'}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        title="新增危险区域/警示区域"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleAddZone}
        okText="提交"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="区域名称"
            rules={[{ required: true, message: '请输入区域名称' }]}
          >
            <Input placeholder="例如：油罐区A" />
          </Form.Item>
          <Form.Item
            name="type"
            label="区域类型"
            rules={[{ required: true, message: '请选择区域类型' }]}
          >
            <Select placeholder="选择类型">
              <Option value="danger">危险区域（高危）</Option>
              <Option value="warning">警示区域</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="说明">
            <TextArea rows={2} placeholder="区域说明或注意事项" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lat"
                label="纬度"
                rules={[{ required: true, message: '请输入纬度' }]}
                initialValue={31.2304}
              >
                <InputNumber step={0.0001} style={{ width: '100%' }} placeholder="例如：31.2304" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lng"
                label="经度"
                rules={[{ required: true, message: '请输入经度' }]}
                initialValue={121.4737}
              >
                <InputNumber step={0.0001} style={{ width: '100%' }} placeholder="例如：121.4737" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="radius"
            label="半径（米）"
            rules={[{ required: true, message: '请输入半径' }]}
            initialValue={80}
          >
            <InputNumber min={10} step={10} style={{ width: '100%' }} placeholder="例如：80" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PortMap
