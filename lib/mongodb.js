/**
 * MongoDB Persistent Database Layer
 *
 * Replaces the in-memory mock with real MongoDB collections.
 * Falls back to in-memory when MONGODB_URI is not configured.
 *
 * Collections:
 *   - users: Applicant profiles and credentials
 *   - applications: All tracked applications (scholarships, jobs, permits)
 *   - agent_logs: Telemetry and audit trail
 *   - discoveries: Discovered opportunities from the Discovery Engine
 *   - campaigns: Scheduled auto-apply campaigns
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'career_copilot';

let client = null;
let db = null;

// In-memory fallback stores
const memStore = {
  users: [
    {
      _id: 'usr-fiaz-001',
      firstName: 'Fiaz',
      lastName: 'Ahmed',
      email: 'fiaz@careercopilot.ai',
      phone: '+92-300-1234567',
      coreStack: 'React, Next.js, Node.js, Python, Playwright, Automation Scripts',
      bio: 'Highly motivated tech professional focusing on browser automation pipelines, deep learning application workflows, and building unique global product interfaces.',
      gpa: '3.8',
      ielts: '8.0',
      nationality: 'Pakistan',
      createdAt: new Date().toISOString(),
    },
  ],
  applications: [
    {
      _id: 'app-001',
      userId: 'usr-fiaz-001',
      title: 'DAAD Development-Related Postgraduate Scholarship',
      institution: 'DAAD Germany',
      type: 'Scholarship',
      country: 'Germany',
      status: 'In Progress',
      progress: 65,
      matchScore: 94,
      agent: 'Scholarship Scout Agent',
      url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
      date: '2026-07-24',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'app-002',
      userId: 'usr-fiaz-001',
      title: 'Senior Software Engineer (AI Systems)',
      institution: 'ASML Holding',
      type: 'Job',
      country: 'Netherlands',
      status: 'Submitted',
      progress: 100,
      matchScore: 91,
      agent: 'Job Hunter Agent',
      url: 'https://www.asml.com/en/careers',
      date: '2026-07-23',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'app-003',
      userId: 'usr-fiaz-001',
      title: 'High-Skilled Migrant Visa (Fast-track nomination)',
      institution: 'IND Immigratie- en Naturalisatiedienst',
      type: 'Work Permit',
      country: 'Netherlands',
      status: 'Document Check',
      progress: 45,
      matchScore: 100,
      agent: 'Permit Pathfinder Agent',
      url: 'https://ind.nl/en/working/working-in-the-netherlands',
      date: '2026-07-24',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'app-004',
      userId: 'usr-fiaz-001',
      title: 'Fulbright Foreign Student Program 2027',
      institution: 'US Department of State',
      type: 'Scholarship',
      country: 'United States',
      status: 'Queued',
      progress: 10,
      matchScore: 88,
      agent: 'Scholarship Scout Agent',
      url: 'https://foreign.fulbrightonline.org/about/fulbright-foreign-student-program',
      date: '2026-07-24',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'app-005',
      userId: 'usr-fiaz-001',
      title: 'Robotics Research Scientist',
      institution: 'ETH Zurich',
      type: 'Job',
      country: 'Switzerland',
      status: 'Tailoring CV',
      progress: 30,
      matchScore: 96,
      agent: 'Job Hunter Agent',
      url: 'https://ethz.ch/en/the-eth-zodiac/vacancies.html',
      date: '2026-07-24',
      createdAt: new Date().toISOString(),
    },
  ],
  agent_logs: [],
  discoveries: [],
  campaigns: [],
};

/**
 * Connect to MongoDB or fall back to in-memory
 */
async function getDb() {
  if (db) return db;

  if (!MONGODB_URI) {
    console.warn('[MongoDB] No MONGODB_URI set. Using in-memory fallback.');
    return null;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
    console.log(`[MongoDB] Connected to ${MONGODB_DB}`);
    return db;
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    return null;
  }
}

/**
 * Generic collection accessor
 */
async function collection(name) {
  const database = await getDb();
  if (!database) return null;
  return database.collection(name);
}

// ─── USER OPERATIONS ────────────────────────────────

export async function getUserProfile(userId) {
  const col = await collection('users');
  if (!col) return memStore.users.find(u => u._id === userId) || null;
  return await col.findOne({ _id: userId });
}

export async function updateUserProfile(userId, updates) {
  const col = await collection('users');
  if (!col) {
    const idx = memStore.users.findIndex(u => u._id === userId);
    if (idx === -1) throw new Error('User not found');
    memStore.users[idx] = { ...memStore.users[idx], ...updates };
    return memStore.users[idx];
  }
  await col.updateOne({ _id: userId }, { $set: updates }, { upsert: true });
  return await col.findOne({ _id: userId });
}

export async function getAllUsers() {
  const col = await collection('users');
  if (!col) return memStore.users;
  return await col.find({}).toArray();
}

// ─── APPLICATION OPERATIONS ─────────────────────────

export async function getUserApplications(userId) {
  const col = await collection('applications');
  if (!col) return memStore.applications.filter(a => a.userId === userId);
  return await col.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function getAllApplications() {
  const col = await collection('applications');
  if (!col) return memStore.applications;
  return await col.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getApplications(filter = {}) {
  const col = await collection('applications');
  if (!col) {
    return memStore.applications.filter(a => {
      if (filter.status && a.status !== filter.status) return false;
      if (filter.userId && a.userId !== filter.userId) return false;
      if (filter.type && a.type !== filter.type) return false;
      return true;
    });
  }
  const query = {};
  if (filter.status) query.status = filter.status;
  if (filter.userId) query.userId = filter.userId;
  if (filter.type) query.type = filter.type;
  return await col.find(query).sort({ createdAt: -1 }).toArray();
}

export async function insertApplication(app) {
  const doc = {
    ...app,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const col = await collection('applications');
  if (!col) {
    doc._id = `app-${Date.now()}`;
    memStore.applications.unshift(doc);
    return doc;
  }
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function updateApplicationStatus(appId, status, progress) {
  const col = await collection('applications');
  const updates = { status, updatedAt: new Date().toISOString() };
  if (progress !== undefined) updates.progress = progress;

  if (!col) {
    const app = memStore.applications.find(a => a._id === appId || a.id === appId);
    if (app) Object.assign(app, updates);
    return app;
  }
  await col.updateOne({ _id: appId }, { $set: updates });
  return await col.findOne({ _id: appId });
}

// ─── AGENT LOG OPERATIONS ───────────────────────────

export async function insertAgentLog(log) {
  const entry = {
    _id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  const col = await collection('agent_logs');
  if (!col) {
    memStore.agent_logs.unshift(entry);
    if (memStore.agent_logs.length > 500) memStore.agent_logs.length = 500;
    return entry;
  }
  await col.insertOne(entry);
  return entry;
}

export async function getRecentAgentLogs(limit = 50) {
  const col = await collection('agent_logs');
  if (!col) return memStore.agent_logs.slice(0, limit);
  return await col.find({}).sort({ timestamp: -1 }).limit(limit).toArray();
}

// ─── DISCOVERY OPERATIONS ───────────────────────────

export async function insertDiscovery(discovery) {
  const doc = {
    ...discovery,
    _id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    discoveredAt: new Date().toISOString(),
    status: 'new',
  };
  const col = await collection('discoveries');
  if (!col) {
    memStore.discoveries.unshift(doc);
    return doc;
  }
  await col.insertOne(doc);
  return doc;
}

export async function getDiscoveries(userId, limit = 50) {
  const col = await collection('discoveries');
  if (!col) return memStore.discoveries.filter(d => d.userId === userId).slice(0, limit);
  return await col.find({ userId }).sort({ discoveredAt: -1 }).limit(limit).toArray();
}

export async function updateDiscoveryStatus(discId, status) {
  const col = await collection('discoveries');
  if (!col) {
    const d = memStore.discoveries.find(x => x._id === discId);
    if (d) d.status = status;
    return d;
  }
  await col.updateOne({ _id: discId }, { $set: { status } });
  return await col.findOne({ _id: discId });
}

// ─── CAMPAIGN OPERATIONS ────────────────────────────

export async function insertCampaign(campaign) {
  const doc = {
    ...campaign,
    _id: `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'active',
    runCount: 0,
  };
  const col = await collection('campaigns');
  if (!col) {
    memStore.campaigns.unshift(doc);
    return doc;
  }
  await col.insertOne(doc);
  return doc;
}

export async function getCampaigns(userId) {
  const col = await collection('campaigns');
  if (!col) return memStore.campaigns.filter(c => c.userId === userId);
  return await col.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function updateCampaignRunCount(campaignId) {
  const col = await collection('campaigns');
  if (!col) {
    const c = memStore.campaigns.find(x => x._id === campaignId);
    if (c) c.runCount = (c.runCount || 0) + 1;
    return c;
  }
  await col.updateOne({ _id: campaignId }, { $inc: { runCount: 1 }, $set: { lastRunAt: new Date().toISOString() } });
  return await col.findOne({ _id: campaignId });
}

export async function getActiveCampaigns() {
  const col = await collection('campaigns');
  if (!col) return memStore.campaigns.filter(c => c.status === 'active');
  return await col.find({ status: 'active' }).toArray();
}

// ─── ANALYTICS OPERATIONS ───────────────────────────

export async function getApplicationStats(userId) {
  const apps = await getUserApplications(userId);
  const total = apps.length;
  const submitted = apps.filter(a => a.status === 'Submitted').length;
  const inProgress = apps.filter(a => a.status !== 'Submitted' && a.status !== 'Failed').length;
  const failed = apps.filter(a => a.status === 'Failed').length;

  const byType = {};
  apps.forEach(a => {
    byType[a.type] = (byType[a.type] || 0) + 1;
  });

  const byCountry = {};
  apps.forEach(a => {
    byCountry[a.country] = (byCountry[a.country] || 0) + 1;
  });

  const avgMatch = total > 0 ? Math.round(apps.reduce((s, a) => s + (a.matchScore || 0), 0) / total) : 0;

  const timeline = apps.reduce((acc, a) => {
    const date = a.date || a.createdAt?.split('T')[0];
    if (date) {
      const existing = acc.find(t => t.date === date);
      if (existing) existing.count++;
      else acc.push({ date, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  return {
    total,
    submitted,
    inProgress,
    failed,
    avgMatch,
    byType,
    byCountry,
    timeline,
    successRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
  };
}

// ─── CLEANUP ────────────────────────────────────────

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserApplications,
  getAllApplications,
  getApplications,
  insertApplication,
  updateApplicationStatus,
  insertAgentLog,
  getRecentAgentLogs,
  insertDiscovery,
  getDiscoveries,
  updateDiscoveryStatus,
  insertCampaign,
  getCampaigns,
  updateCampaignRunCount,
  getActiveCampaigns,
  getApplicationStats,
  closeConnection,
};
