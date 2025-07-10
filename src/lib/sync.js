import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import { 
  getItemsToSync, 
  markItemsAsSynced, 
  updateSyncInfo,
  getLastSyncInfo
} from './database';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const SYNC_ENABLED_KEY = 'sync_enabled';
const LAST_SYNC_ATTEMPT_KEY = 'last_sync_attempt';

// Check if sync is enabled
export const isSyncEnabled = async (userId) => {
  try {
    const { value } = await Preferences.get({ key: `${SYNC_ENABLED_KEY}_${userId}` });
    return value === 'true';
  } catch (error) {
    console.error('Failed to check if sync is enabled:', error);
    return false;
  }
};

// Enable or disable sync
export const setSyncEnabled = async (userId, enabled) => {
  try {
    await Preferences.set({
      key: `${SYNC_ENABLED_KEY}_${userId}`,
      value: enabled ? 'true' : 'false'
    });
    return true;
  } catch (error) {
    console.error('Failed to set sync enabled:', error);
    return false;
  }
};

// Get device info for sync
export const getDeviceInfo = async () => {
  try {
    const info = await Device.getInfo();
    const id = await Device.getId();
    
    return {
      deviceId: id.uuid,
      deviceName: info.name || 'Unknown Device',
      platform: info.platform,
      operatingSystem: info.operatingSystem,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      model: info.model,
      webViewVersion: info.webViewVersion
    };
  } catch (error) {
    console.error('Failed to get device info:', error);
    return {
      deviceId: 'unknown',
      deviceName: 'Unknown Device',
      platform: 'unknown'
    };
  }
};

// Get timestamp of last sync attempt
export const getLastSyncAttempt = async (userId) => {
  try {
    const { value } = await Preferences.get({ key: `${LAST_SYNC_ATTEMPT_KEY}_${userId}` });
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Failed to get last sync attempt:', error);
    return 0;
  }
};

// Update timestamp of last sync attempt
export const updateLastSyncAttempt = async (userId, timestamp = Date.now()) => {
  try {
    await Preferences.set({
      key: `${LAST_SYNC_ATTEMPT_KEY}_${userId}`,
      value: timestamp.toString()
    });
    return true;
  } catch (error) {
    console.error('Failed to update last sync attempt:', error);
    return false;
  }
};

// Check if sync is due
export const isSyncDue = async (userId) => {
  const syncEnabled = await isSyncEnabled(userId);
  if (!syncEnabled) return false;
  
  const lastAttempt = await getLastSyncAttempt(userId);
  const now = Date.now();
  
  return now - lastAttempt >= SYNC_INTERVAL;
};

// Simulated sync with server (for demo purposes)
export const syncWithServer = async (userId) => {
  if (!userId) return { success: false, error: 'User ID is required' };
  
  try {
    // Get device info
    const deviceInfo = await getDeviceInfo();
    
    // Get last sync info
    const lastSyncInfo = getLastSyncInfo(userId);
    const syncToken = lastSyncInfo?.sync_token || null;
    
    // Get items to sync
    const itemsToSync = getItemsToSync(userId);
    
    console.log('Syncing with server...', {
      userId,
      deviceInfo,
      syncToken,
      itemsCount: {
        tasks: itemsToSync.tasks.length,
        media: itemsToSync.media.length,
        notes: itemsToSync.notes.length
      }
    });
    
    // In a real app, here you would send the items to the server
    // and get back any updated items from other devices
    
    // Simulate server response
    const newSyncToken = Date.now().toString();
    
    // Mark items as synced
    if (itemsToSync.tasks.length > 0) {
      await markItemsAsSynced(userId, 'tasks', itemsToSync.tasks.map(item => item.id));
    }
    
    if (itemsToSync.media.length > 0) {
      await markItemsAsSynced(userId, 'media', itemsToSync.media.map(item => item.id));
    }
    
    if (itemsToSync.notes.length > 0) {
      await markItemsAsSynced(userId, 'notes', itemsToSync.notes.map(item => item.id));
    }
    
    // Update sync info
    await updateSyncInfo(userId, newSyncToken);
    
    // Update last sync attempt
    await updateLastSyncAttempt(userId);
    
    return {
      success: true,
      syncedItems: {
        tasks: itemsToSync.tasks.length,
        media: itemsToSync.media.length,
        notes: itemsToSync.notes.length
      },
      syncToken: newSyncToken,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to sync with server:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};