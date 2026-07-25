/**
 * AI Career Copilot — Database Abstraction Layer (Legacy Bridge)
 *
 * This file now re-exports all functions from the MongoDB persistent layer.
 * All data is stored in MongoDB when MONGODB_URI is configured,
 * or falls back to in-memory storage.
 *
 * For production, set MONGODB_URI in your .env file.
 */

export {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserApplications,
  getAllApplications,
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
} from './mongodb.js';

export default {
  getUserProfile: async (userId) => (await import('./mongodb.js')).getUserProfile(userId),
  updateUserProfile: async (userId, updates) => (await import('./mongodb.js')).updateUserProfile(userId, updates),
  getAllUsers: async () => (await import('./mongodb.js')).getAllUsers(),
  getUserApplications: async (userId) => (await import('./mongodb.js')).getUserApplications(userId),
  getAllApplications: async () => (await import('./mongodb.js')).getAllApplications(),
  insertApplication: async (app) => (await import('./mongodb.js')).insertApplication(app),
  updateApplicationStatus: async (appId, status, progress) => (await import('./mongodb.js')).updateApplicationStatus(appId, status, progress),
  insertAgentLog: async (log) => (await import('./mongodb.js')).insertAgentLog(log),
  getRecentAgentLogs: async (limit) => (await import('./mongodb.js')).getRecentAgentLogs(limit),
  insertDiscovery: async (disc) => (await import('./mongodb.js')).insertDiscovery(disc),
  getDiscoveries: async (userId, limit) => (await import('./mongodb.js')).getDiscoveries(userId, limit),
  updateDiscoveryStatus: async (discId, status) => (await import('./mongodb.js')).updateDiscoveryStatus(discId, status),
  insertCampaign: async (camp) => (await import('./mongodb.js')).insertCampaign(camp),
  getCampaigns: async (userId) => (await import('./mongodb.js')).getCampaigns(userId),
  updateCampaignRunCount: async (campId) => (await import('./mongodb.js')).updateCampaignRunCount(campId),
  getActiveCampaigns: async () => (await import('./mongodb.js')).getActiveCampaigns(),
  getApplicationStats: async (userId) => (await import('./mongodb.js')).getApplicationStats(userId),
};
