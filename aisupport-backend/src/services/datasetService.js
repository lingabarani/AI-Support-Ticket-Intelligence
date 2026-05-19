const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DATASET_DIR_NAMES = ['data', 'dataset', 'uploads', 'sample', 'public'];
const DATASET_FILE_EXTENSIONS = new Set(['.csv', '.json']);
const MAX_FILES = 25;
const MAX_RECORDS_PER_FILE = 1000;
const MAX_CONTEXT_RECORDS = 8;

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const backendRoot = path.resolve(__dirname, '..', '..');
const quickSightDatasetDir = path.join(backendRoot, 'data', 'quicksight-datasets');

const quickSightDatasetFiles = {
  support_agent: 'support_agent_tickets_200.csv',
  team_manager: 'team_manager_performance_200.csv',
  business_executive: 'business_executive_insights_200.csv',
  system_admin: 'system_admin_activity_200.csv',
  customer: 'customer_portal_activity_200.csv',
};

const candidateDirs = [
  path.join(backendRoot, 'data'),
  ...DATASET_DIR_NAMES.map((dir) => path.join(repoRoot, dir)),
  ...DATASET_DIR_NAMES.map((dir) => path.join(backendRoot, dir)),
  path.join(repoRoot, 'src', 'data'),
  path.join(backendRoot, 'src', 'data'),
  path.join(repoRoot, 'aisupport-frontend', 'src', 'data'),
  path.join(repoRoot, 'aisupport-backend', 'src', 'data'),
];

const supportedFields = [
  'ticket_id',
  'customer_name',
  'issue_category',
  'category',
  'ticket_description',
  'issue_description',
  'priority',
  'sentiment',
  'status',
  'assigned_team',
  'created_date',
  'ticket_created_date',
  'resolution_time_hours',
  'ai_summary',
  'ai_root_cause',
  'ai_suggested_resolution',
  'resolution_notes',
  'product',
  'channel',
  'region',
  'sla_breached',
];

let cachedRecords;
let cachedQuickSightDatasets;

const listDatasetFiles = () => {
  const files = [];
  const visited = new Set();

  const visit = (dir) => {
    if (!fs.existsSync(dir) || visited.has(dir) || files.length >= MAX_FILES) return;
    visited.add(dir);

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (DATASET_FILE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }

      if (files.length >= MAX_FILES) break;
    }
  };

  candidateDirs.forEach(visit);
  return files;
};

const normalizeJsonRecords = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    for (const key of ['tickets', 'data', 'records', 'items']) {
      if (Array.isArray(value[key])) return value[key];
    }
    return [value];
  }
  return [];
};

const loadFileRecords = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return normalizeJsonRecords(JSON.parse(raw));
  }

  if (ext === '.csv') {
    return parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  return [];
};

const normalizeRecord = (record, sourceFile) => {
  const normalized = { source_file: path.relative(repoRoot, sourceFile) };
  for (const field of supportedFields) {
    if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
      normalized[field] = String(record[field]);
    }
  }

  if (!normalized.issue_category && normalized.category) normalized.issue_category = normalized.category;
  if (!normalized.ticket_description && normalized.issue_description) normalized.ticket_description = normalized.issue_description;
  if (!normalized.created_date && normalized.ticket_created_date) normalized.created_date = normalized.ticket_created_date;
  if (!normalized.ai_summary && normalized.issue_description) normalized.ai_summary = normalized.issue_description;
  if (!normalized.ai_suggested_resolution && normalized.resolution_notes) normalized.ai_suggested_resolution = normalized.resolution_notes;

  return normalized;
};

const loadDatasetRecords = () => {
  if (cachedRecords) return cachedRecords;

  const records = [];
  for (const file of listDatasetFiles()) {
    try {
      const fileRecords = loadFileRecords(file)
        .slice(0, MAX_RECORDS_PER_FILE)
        .filter((record) => record && typeof record === 'object')
        .map((record) => normalizeRecord(record, file));
      records.push(...fileRecords);
    } catch {
      // Skip malformed local datasets without exposing file contents in logs.
    }
  }

  cachedRecords = records;
  return cachedRecords;
};

const readDemoJson = (fileName, fallback) => {
  try {
    const filePath = path.join(backendRoot, 'data', fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, ''));
  } catch {
    return fallback;
  }
};

const getDemoTickets = () => readDemoJson('demoTickets.json', loadDatasetRecords());
const getDemoUsers = () => readDemoJson('demoUsers.json', []);
const getDemoAnalytics = () => readDemoJson('demoAnalytics.json', {});
const getDemoKnowledgeBase = () => readDemoJson('demoKnowledgeBase.json', []);
const getDemoNotifications = () => readDemoJson('demoNotifications.json', []);
const getDemoReports = () => readDemoJson('demoReports.json', []);

const getQuickSightDatasets = () => {
  if (cachedQuickSightDatasets) return cachedQuickSightDatasets;

  cachedQuickSightDatasets = Object.entries(quickSightDatasetFiles).reduce((acc, [role, fileName]) => {
    try {
      const filePath = path.join(quickSightDatasetDir, fileName);
      acc[role] = loadFileRecords(filePath).slice(0, 200);
    } catch {
      acc[role] = [];
    }
    return acc;
  }, {});

  return cachedQuickSightDatasets;
};

const getQuickSightDataset = (role = 'support_agent') => getQuickSightDatasets()[role] || [];

const getMongoTickets = async () => {
  try {
    const Ticket = require('../models/Ticket');
    return await Ticket.find({})
      .sort({ ticket_created_date: -1, createdAt: -1 })
      .limit(1000)
      .maxTimeMS(8000)
      .lean();
  } catch {
    return [];
  }
};

const normalizeTicketForDataset = (ticket) => ({
  ...ticket,
  ticket_id: ticket.ticket_id || ticket.ticketId,
  customer_name: ticket.customer_name || ticket.customer?.name || 'Customer',
  customer_email: ticket.customer_email || ticket.customer?.email || '',
  issue_category: ticket.issue_category || ticket.category || 'Bug Report',
  ticket_description: ticket.ticket_description || ticket.description || ticket.subject || '',
  ai_summary: ticket.ai_summary || ticket.aiSummary || ticket.ticket_description || ticket.description || ticket.subject || '',
  ai_root_cause: ticket.ai_root_cause || ticket.aiRootCause || '',
  ai_suggested_resolution: ticket.ai_suggested_resolution || ticket.aiSuggestedReply || ticket.resolution_summary || '',
  ai_sentiment: ticket.ai_sentiment || ticket.sentiment || 'Neutral',
  tags: Array.isArray(ticket.tags) ? ticket.tags : [],
});

const getPrimaryTickets = async () => {
  const mongoTickets = await getMongoTickets();
  if (mongoTickets.length) return mongoTickets.map(normalizeTicketForDataset);
  return getDemoTickets();
};

const tokenize = (text) => String(text || '')
  .toLowerCase()
  .split(/[^a-z0-9]+/)
  .filter((token) => token.length >= 3);

const scoreRecord = (record, queryTokens) => {
  const searchable = supportedFields
    .map((field) => record[field])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return queryTokens.reduce((score, token) => (
    searchable.includes(token) ? score + 1 : score
  ), 0);
};

const formatRecord = (record) => {
  const lines = supportedFields
    .filter((field) => record[field])
    .map((field) => `${field}: ${record[field]}`);
  return `- ${lines.join('; ')}`;
};

const getRelevantTicketContext = (message) => {
  const records = loadDatasetRecords();
  if (!records.length) return '';

  const queryTokens = tokenize(message);
  const ranked = records
    .map((record) => ({ record, score: scoreRecord(record, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_RECORDS)
    .map(({ record }) => record);

  const matches = ranked.length ? ranked : records.slice(0, Math.min(3, records.length));
  return [
    'Relevant local ticket dataset context:',
    ...matches.map(formatRecord),
  ].join('\n');
};

const getRelevantTicketContextAsync = async (message) => {
  const records = await getPrimaryTickets();
  if (!records.length) return '';

  const queryTokens = tokenize(message);
  const ranked = records
    .map((record) => ({ record, score: scoreRecord(record, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_RECORDS)
    .map(({ record }) => record);

  const matches = ranked.length ? ranked : records.slice(0, Math.min(3, records.length));
  return [
    'Relevant support ticket context:',
    ...matches.map(formatRecord),
  ].join('\n');
};

module.exports = {
  getDemoAnalytics,
  getDemoKnowledgeBase,
  getDemoNotifications,
  getDemoReports,
  getDemoTickets,
  getDemoUsers,
  getMongoTickets,
  getPrimaryTickets,
  getQuickSightDataset,
  getQuickSightDatasets,
  getRelevantTicketContext,
  getRelevantTicketContextAsync,
  loadDatasetRecords,
};
