import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ChatbotWidget from './ChatbotWidget';
import BedrockAgentChat from './BedrockAgentChat';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const assistantRole = {
    'Support Agent': 'support_agent',
    'Team Manager': 'team_manager',
    'Business Executive': 'business_executive',
    'System Admin': 'system_admin',
    'Customer Portal User': 'customer',
  }[user?.role] || 'support_agent';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0d1a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <BedrockAgentChat role={assistantRole} mode="card" />
          </div>
          {children}
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
