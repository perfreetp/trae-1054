import { useState } from 'react'
import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd'
import {
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  BarChartOutlined,
  AlertOutlined,
  FileSearchOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons'
import PortMap from './pages/PortMap'
import RiskPoints from './pages/RiskPoints'
import WorkPermits from './pages/WorkPermits'
import VideoPatrol from './pages/VideoPatrol'
import EnvMonitor from './pages/EnvMonitor'
import EventHandling from './pages/EventHandling'
import Reports from './pages/Reports'
import {
  workPermits as initialPermits,
  hiddenDangers as initialDangers,
  emergencyEvents as initialEvents,
  sewageRecords as initialEnvRecords,
  patrolRoutes as initialRoutes,
  patrolRecords as initialPatrolRecords,
} from './mock/data'
import type {
  WorkPermit,
  HiddenDanger,
  EmergencyEvent,
  SewageRecord,
  PatrolRoute,
  PatrolRecord,
} from './types'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: 'map', icon: <EnvironmentOutlined />, label: '港区地图' },
  { key: 'risk', icon: <ExclamationCircleOutlined />, label: '风险点清单' },
  { key: 'permit', icon: <FileTextOutlined />, label: '作业许可' },
  { key: 'video', icon: <VideoCameraOutlined />, label: '视频巡查' },
  { key: 'env', icon: <BarChartOutlined />, label: '环境监测' },
  { key: 'event', icon: <AlertOutlined />, label: '事件处置' },
  { key: 'report', icon: <FileSearchOutlined />, label: '复盘报表' },
]

const userMenuItems = [
  { key: '1', label: '个人中心' },
  { key: '2', label: '系统设置' },
  { key: '3', label: '退出登录', danger: true },
]

function App() {
  const [selectedKey, setSelectedKey] = useState('map')
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([...initialPermits])
  const [dangers, setDangers] = useState<HiddenDanger[]>([...initialDangers])
  const [events, setEvents] = useState<EmergencyEvent[]>([...initialEvents])
  const [envRecords, setEnvRecords] = useState<SewageRecord[]>([...initialEnvRecords])
  const [patrolRoutes, setPatrolRoutes] = useState<PatrolRoute[]>([...initialRoutes])
  const [patrolRecords, setPatrolRecords] = useState<PatrolRecord[]>([...initialPatrolRecords])

  const renderContent = () => {
    switch (selectedKey) {
      case 'map':
        return <PortMap />
      case 'risk':
        return <RiskPoints dangers={dangers} setDangers={setDangers} />
      case 'permit':
        return <WorkPermits permits={workPermits} setPermits={setWorkPermits} />
      case 'video':
        return (
          <VideoPatrol
            routes={patrolRoutes}
            setRoutes={setPatrolRoutes}
            patrolRecords={patrolRecords}
            setPatrolRecords={setPatrolRecords}
          />
        )
      case 'env':
        return <EnvMonitor records={envRecords} setRecords={setEnvRecords} />
      case 'event':
        return <EventHandling events={events} setEvents={setEvents} />
      case 'report':
        return (
          <Reports
            workPermits={workPermits}
            dangers={dangers}
            events={events}
            envRecords={envRecords}
            patrolRecords={patrolRecords}
          />
        )
      default:
        return <PortMap />
    }
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? '港口' : '智慧港口监控'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            {menuItems.find((item) => item.key === selectedKey)?.label}
          </div>
          <Space size="large">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
