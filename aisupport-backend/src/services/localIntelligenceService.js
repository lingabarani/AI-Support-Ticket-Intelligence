const {
  getDemoAnalytics,
  getDemoKnowledgeBase,
  getDemoTickets,
  getDemoUsers,
  getQuickSightDataset,
} = require('./datasetService');

const FALLBACK_NOTICE = 'AI assistant is temporarily unavailable. Showing the best available support response.';

const roleAliases = {
  'Customer Portal User': 'customer',
  'Support Agent': 'support_agent',
  'Team Manager': 'team_manager',
  'Business Executive': 'business_executive',
  'System Admin': 'system_admin',
};

const normalizeRole = (role = 'support_agent') => roleAliases[role] || role;

const extractTicketId = (message = '') => {
  const text = String(message);
  const direct = text.match(/\bTKT[-\s]?0*(\d{1,4})\b/i);
  if (direct) return `TKT-${String(Number(direct[1])).padStart(4, '0')}`;

  const loose = text.match(/\bticket(?:\s+id)?\s*#?\s*(\d{1,4})\b/i);
  if (loose) return `TKT-${String(Number(loose[1])).padStart(4, '0')}`;

  return '';
};

const detectIntent = (message = '') => {
  const text = String(message).toLowerCase();
  const checks = [
    ['ticket_summary', /summari[sz]e|summary|analysis|analyze/],
    ['ticket_status', /status|where is|still open|progress/],
    ['ticket_priority', /priority|urgent|severity/],
    ['ticket_sentiment', /sentiment|angry|happy|frustrated/],
    ['suggested_reply', /reply|response|draft|write back/],
    ['recommended_action', /next action|recommend|what should|next step/],
    ['similar_tickets', /similar|related|same issue/],
    ['open_tickets', /open tickets|show open|my open/],
    ['high_priority_tickets', /high priority|urgent tickets|critical/],
    ['sla_breaches', /sla|breach|breached|overdue/],
    ['team_performance', /team performance|team summary|recurring issues/],
    ['agent_workload', /workload|most open|overloaded|agent/],
    ['executive_summary', /executive summary|business summary|overview/],
    ['revenue_risk', /revenue|money|financial impact/],
    ['churn_risk', /churn|retention|at risk/],
    ['sentiment_trend', /sentiment trend|customer sentiment/],
    ['system_health', /system health|api status|connectivity|health/],
    ['user_management', /users|active users|inactive users|user management/],
    ['role_permissions', /permissions|roles|role permissions/],
    ['knowledge_base', /knowledge|kb|faq|password|refund|billing|reset/],
    ['dashboard_explanation', /dashboard|chart|analytics/],
    ['export_report', /export|download|report/],
  ];

  return checks.find(([, pattern]) => pattern.test(text))?.[0] || 'general_help';
};

const findTicket = (ticketId, tickets) => {
  if (!ticketId) return null;
  return tickets.find((ticket) => ticket.ticket_id.toLowerCase() === ticketId.toLowerCase()) || null;
};

const searchTickets = (message, tickets) => {
  const query = String(message).toLowerCase();
  return tickets
    .filter((ticket) => [
      ticket.ticket_id,
      ticket.customer_name,
      ticket.issue_category,
      ticket.priority,
      ticket.status,
      ticket.ticket_description,
      ticket.ai_summary,
      ticket.tags?.join(' '),
    ].filter(Boolean).join(' ').toLowerCase().includes(query) || ticket.issue_category.toLowerCase().split(' ').some((word) => query.includes(word)))
    .slice(0, 5);
};

const top = (items, key, limit = 4) => Object.entries(items.reduce((acc, item) => {
  acc[item[key]] = (acc[item[key]] || 0) + 1;
  return acc;
}, {})).sort((a, b) => b[1] - a[1]).slice(0, limit);

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const isTrue = (value) => String(value).toLowerCase() === 'true';

const average = (items, key) => {
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + toNumber(item[key]), 0) / items.length;
};

const sum = (items, key) => items.reduce((total, item) => total + toNumber(item[key]), 0);

const formatTicketLine = (ticket) => `${ticket.ticket_id} (${ticket.priority}, ${ticket.status}) - ${ticket.issue_category} for ${ticket.customer_name}`;

const customerResponse = ({ ticket, tickets, intent, kb, roleDataset }) => {
  if (roleDataset.length && ['general_help', 'dashboard_explanation', 'ticket_status', 'ticket_summary'].includes(intent)) {
    const chatbotEvents = roleDataset.filter((item) => isTrue(item.chatbot_used)).length;
    const portalResolved = roleDataset.filter((item) => isTrue(item.resolved_via_portal)).length;
    const escalations = roleDataset.filter((item) => isTrue(item.escalation_requested)).length;
    const topActions = top(roleDataset, 'portal_action', 3).map(([name, count]) => `${name} (${count})`).join(', ');

    return `Customer Portal Dataset Answer:
- Dataset Rows: ${roleDataset.length}
- Chatbot Used: ${chatbotEvents} portal events
- Resolved via Portal: ${portalResolved} events
- Escalation Requests: ${escalations}
- Average Customer Rating: ${average(roleDataset, 'customer_rating').toFixed(1)} / 5
- Top Portal Actions: ${topActions}
- Best Action: Promote the most-viewed FAQ and chatbot flows for repeat customer questions.`;
  }

  const selected = ticket || tickets.find((item) => !['Resolved', 'Closed'].includes(item.status)) || tickets[0];
  const article = kb.find((item) => String(item.title).toLowerCase().includes('password')) || kb[0];

  if (intent === 'knowledge_base') {
    return `Support Response:
- Status: Help article found
- Explanation: ${article.answer}
- Next Step: Try the suggested steps and keep your ticket open if the issue continues.
- Estimated Resolution: Most requests are resolved within 24 to 48 hours.`;
  }

  return `Support Response:
- Status: ${selected.status} (${selected.ticket_id})
- Explanation: ${selected.ai_summary}
- Next Step: ${selected.ai_suggested_resolution}
- Estimated Resolution: ${selected.resolution_time_hours <= 24 ? 'Within 24 hours' : 'Within 2 to 4 business days'}.`;
};

const supportAgentResponse = ({ ticket, tickets, roleDataset }) => {
  if (roleDataset.length && !ticket) {
    const openTickets = roleDataset.filter((item) => item.status === 'Open').length;
    const slaBreaches = roleDataset.filter((item) => isTrue(item.sla_breached)).length;
    const escalations = roleDataset.filter((item) => isTrue(item.escalation_required)).length;
    const urgentTickets = roleDataset.filter((item) => item.priority === 'Urgent').slice(0, 3);

    return `Support Agent Dataset Answer:
- Dataset Rows: ${roleDataset.length}
- Open Tickets: ${openTickets}
- SLA Breached Tickets: ${slaBreaches}
- Escalation Required: ${escalations}
- Average Resolution Time: ${average(roleDataset, 'resolution_time_hours').toFixed(1)} hours
- Average Customer Satisfaction: ${average(roleDataset, 'customer_satisfaction').toFixed(1)} / 5
- Top Issues: ${top(roleDataset, 'issue_category', 4).map(([name, count]) => `${name} (${count})`).join(', ')}
- Urgent Samples: ${urgentTickets.map(formatTicketLine).join('; ') || 'No urgent tickets found'}`;
  }

  const selected = ticket || tickets.find((item) => item.priority === 'Urgent') || tickets[0];
  return `Ticket Analysis:
- Ticket ID: ${selected.ticket_id}
- Customer: ${selected.customer_name}
- Issue: ${selected.issue_category}
- Summary: ${selected.ai_summary}
- Sentiment: ${selected.ai_sentiment}
- Priority: ${selected.priority}
- Root Cause: ${selected.ai_root_cause}
- Recommended Action: ${selected.ai_suggested_resolution}
- Suggested Customer Reply: Hi ${selected.customer_name}, we reviewed your ${selected.issue_category.toLowerCase()} request and are taking the next action now: ${selected.ai_suggested_resolution}`;
};

const managerResponse = ({ tickets, analytics, roleDataset }) => {
  if (roleDataset.length) {
    const overloaded = roleDataset.filter((item) => toNumber(item.open_tickets) > 22 || item.coaching_flag === 'Needs Review');
    return `Team Manager Dataset Answer:
- Dataset Rows: ${roleDataset.length}
- Open Tickets: ${sum(roleDataset, 'open_tickets')}
- In Progress Tickets: ${sum(roleDataset, 'in_progress_tickets')}
- Resolved Tickets: ${sum(roleDataset, 'resolved_tickets')}
- SLA Breached Tickets: ${sum(roleDataset, 'sla_breached_tickets')}
- Average Team Utilization: ${average(roleDataset, 'team_utilization_pct').toFixed(1)}%
- Average Resolution Time: ${average(roleDataset, 'avg_resolution_hours').toFixed(1)} hours
- Coaching Flags: ${overloaded.length}
- Most Loaded Agents: ${top(overloaded, 'agent_name', 4).map(([name, count]) => `${name} (${count})`).join(', ') || 'No overloaded agents'}`;
  }

  const data = analytics.teamManagerAnalytics || {};
  const overloaded = (data.agentWorkload || []).filter((item) => item.open >= 20).map((item) => item.agent);
  return `Management Insight:
- Total Tickets: ${data.totalTickets || tickets.length}
- SLA Breaches: ${(data.slaBreaches || []).length || tickets.filter((ticket) => ticket.sla_breached).length}
- Overloaded Agents: ${overloaded.length ? overloaded.join(', ') : 'No critical overload; monitor Anita Verma and Rahul Kumar'}
- Top Issue Categories: ${top(tickets, 'issue_category').map(([name, count]) => `${name} (${count})`).join(', ')}
- Escalation Risks: ${tickets.filter((ticket) => ticket.escalation_required).slice(0, 3).map(formatTicketLine).join('; ')}
- Recommended Actions: Rebalance urgent tickets, prioritize breached SLAs, and publish KB guidance for recurring payment and login issues.`;
};

const executiveResponse = ({ tickets, analytics, roleDataset }) => {
  if (roleDataset.length) {
    const criticalRows = roleDataset.filter((item) => item.executive_priority === 'Critical');
    return `Business Executive Dataset Answer:
- Dataset Rows: ${roleDataset.length}
- Ticket Volume: ${sum(roleDataset, 'ticket_volume')}
- Revenue Risk: Rs ${sum(roleDataset, 'revenue_risk_usd').toLocaleString('en-IN')}
- Churn Risk Customers: ${sum(roleDataset, 'churn_risk_customers')}
- Average SLA Compliance: ${average(roleDataset, 'sla_compliance_pct').toFixed(1)}%
- Average CSAT: ${average(roleDataset, 'avg_csat').toFixed(1)} / 5
- Critical Priority Segments: ${criticalRows.length}
- Top Products: ${top(roleDataset, 'product', 4).map(([name, count]) => `${name} (${count})`).join(', ')}
- Recommended Focus: ${top(criticalRows.length ? criticalRows : roleDataset, 'action_recommendation', 2).map(([name]) => name).join('; ')}`;
  }

  const data = analytics.businessExecutiveAnalytics || {};
  return `Executive Insight:
- Customer Sentiment: ${tickets.filter((ticket) => ticket.ai_sentiment === 'Negative').length} negative tickets require proactive outreach.
- Revenue Risk: Rs ${Number(data.revenueRisk || 0).toLocaleString('en-IN')} estimated across active tickets.
- Churn Risk: ${data.churnRiskCustomers || tickets.filter((ticket) => ticket.ai_customer_churn_risk === 'High').length} high-risk customers.
- Top Business Issues: ${(data.topRevenueImpactingIssues || []).slice(0, 4).map((item) => `${item.issue} (Rs ${Number(item.revenueRisk).toLocaleString('en-IN')})`).join(', ')}
- Strategic Recommendations: ${(data.strategicRecommendations || []).slice(0, 3).join(' ')}`;
};

const adminResponse = ({ analytics, users, roleDataset }) => {
  if (roleDataset.length) {
    const failed = roleDataset.filter((item) => item.status === 'Failed');
    const highRisk = roleDataset.filter((item) => item.risk_level === 'High');
    const mfaDisabled = roleDataset.filter((item) => !isTrue(item.mfa_enabled));
    return `System Admin Dataset Answer:
- Dataset Rows: ${roleDataset.length}
- Failed Events: ${failed.length}
- High Risk Events: ${highRisk.length}
- MFA Disabled Users/Events: ${mfaDisabled.length}
- Audit Actions Required: ${roleDataset.filter((item) => isTrue(item.audit_action_required)).length}
- Top Event Types: ${top(roleDataset, 'event_type', 4).map(([name, count]) => `${name} (${count})`).join(', ')}
- Most Used API Services: ${top(roleDataset, 'api_service', 3).map(([name, count]) => `${name} (${count})`).join(', ')}
- Recommended Fix: Review high-risk failed access events and enforce MFA for disabled accounts.`;
  }

  const data = analytics.systemAdminAnalytics || {};
  return `System Admin Insight:
- System Health: API ${data.systemHealth?.api || 99.9}%, database ${data.systemHealth?.database || 98.7}%.
- Active Users: ${data.activeUsers || users.filter((user) => user.status === 'Active').length} of ${data.totalUsers || users.length}.
- API Status: ${data.apiHealth || 'Operational'}.
- AI Service Status: ${data.aiServiceStatus || 'Support intelligence ready'}.
- Security Alerts: ${(data.securityAlerts || []).map((item) => `${item.severity}: ${item.message}`).join(' ')}
- Recommended Fixes: Review inactive users, keep role permissions least-privilege, and retain support fallback responses.`;
};

const buildCards = (intent, tickets) => {
  if (['open_tickets', 'high_priority_tickets', 'sla_breaches', 'similar_tickets'].includes(intent)) {
    return tickets.slice(0, 5).map((ticket) => ({
      title: ticket.ticket_id,
      subtitle: ticket.issue_category,
      status: ticket.status,
      priority: ticket.priority,
      description: ticket.ai_summary,
    }));
  }
  return [];
};

const buildSuggestedActions = (role, intent) => {
  const base = {
    customer: ['Show my open tickets', 'How do I reset my password?', 'Where is my refund?'],
    support_agent: ['Show high priority open tickets', 'Suggest reply for payment failure', 'Find similar login issues'],
    team_manager: ['Show SLA breached tickets', 'Which agent has most open tickets?', 'What are recurring issues?'],
    business_executive: ['Show revenue risk', 'What is causing churn?', 'Recommend business actions'],
    system_admin: ['Show system health', 'Show role permissions', 'Show security alerts'],
  };
  return base[role] || base.support_agent;
};

const generateLocalResponse = ({ role = 'support_agent', message = '', includeNotice = false }) => {
  const normalizedRole = normalizeRole(role);
  const tickets = getDemoTickets();
  const analytics = getDemoAnalytics();
  const users = getDemoUsers();
  const kb = getDemoKnowledgeBase();
  const intent = detectIntent(message);
  const ticket = findTicket(extractTicketId(message), tickets);
  const matches = ticket ? [ticket] : searchTickets(message, tickets);
  const scopedTickets = matches.length ? matches : tickets;
  const roleDataset = getQuickSightDataset(normalizedRole);

  const replyByRole = {
    customer: () => customerResponse({ ticket, tickets: scopedTickets, intent, kb, roleDataset }),
    support_agent: () => supportAgentResponse({ ticket, tickets: scopedTickets, roleDataset }),
    team_manager: () => managerResponse({ tickets, analytics, roleDataset }),
    business_executive: () => executiveResponse({ tickets, analytics, roleDataset }),
    system_admin: () => adminResponse({ analytics, users, roleDataset }),
  };

  const body = (replyByRole[normalizedRole] || replyByRole.support_agent)();
  return {
    reply: includeNotice ? `${FALLBACK_NOTICE}\n\n${body}` : body,
    role: normalizedRole,
    source: 'support_fallback',
    intent,
    cards: buildCards(intent, scopedTickets),
    suggestedActions: buildSuggestedActions(normalizedRole, intent),
  };
};

module.exports = {
  FALLBACK_NOTICE,
  detectIntent,
  extractTicketId,
  generateLocalResponse,
  normalizeRole,
};
