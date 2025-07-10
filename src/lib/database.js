import initSqlJs from 'sql.js';
import { Preferences } from '@capacitor/preferences';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Initialize SQL.js
let SQL;
let db;
let isInitialized = false;
const DB_NAME = 'origin_app_db';
const ENCRYPTION_KEY = 'OriginApp2023!';

// Function to initialize the database
export const initDatabase = async () => {
  if (isInitialized) return;
  
  try {
    SQL = await initSqlJs({
      // Locate the wasm file
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    // Try to load existing database from storage
    const { value } = await Preferences.get({ key: DB_NAME });
    
    if (value) {
      // Convert Base64 to ArrayBuffer
      const binaryString = window.atob(value);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      db = new SQL.Database(bytes);
    } else {
      // Create a new database
      db = new SQL.Database();
      
      // Create tables
      createTables();
      
      // Insert default users
      insertDefaultUsers();
    }
    
    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Create database tables
const createTables = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT,
      avatar TEXT,
      theme TEXT DEFAULT 'dark-gold',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT,
      sync_id TEXT UNIQUE
    )
  `);
  
  // Tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      time TEXT,
      priority TEXT DEFAULT 'medium',
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_id TEXT UNIQUE,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Media table
  db.run(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER,
      source TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_id TEXT UNIQUE,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_id TEXT UNIQUE,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, key)
    )
  `);
  
  // Sync table to track last sync
  db.run(`
    CREATE TABLE IF NOT EXISTS sync_info (
      user_id TEXT PRIMARY KEY,
      last_sync TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_token TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Create indexes for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_id, key)`);
};

// Insert default users
const insertDefaultUsers = () => {
  const users = [
    {
      id: uuidv4(),
      username: 'KARTHIK',
      // Password: 7013178749
      password: hashPassword('7013178749'),
      name: 'Karthik',
      email: 'karthik@example.com',
      theme: 'dark-gold',
      sync_id: uuidv4()
    },
    {
      id: uuidv4(),
      username: 'USER',
      // Password: 7013178749
      password: hashPassword('7013178749'),
      name: 'Default User',
      email: 'user@example.com',
      theme: 'dark-gold',
      sync_id: uuidv4()
    }
  ];
  
  users.forEach(user => {
    try {
      db.run(
        `INSERT INTO users (id, username, password, name, email, theme, sync_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [user.id, user.username, user.password, user.name, user.email, user.theme, user.sync_id]
      );
    } catch (error) {
      console.error(`Failed to insert user ${user.username}:`, error);
    }
  });
};

// Hash password
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Save database to storage
export const saveDatabase = async () => {
  if (!db) return;
  
  try {
    // Export the database to a Uint8Array
    const data = db.export();
    
    // Convert Uint8Array to Base64
    let binary = '';
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    
    // Save to storage
    await Preferences.set({
      key: DB_NAME,
      value: base64
    });
  } catch (error) {
    console.error('Failed to save database:', error);
    throw error;
  }
};

// User authentication functions
export const authenticateUser = (username, password) => {
  if (!db) throw new Error('Database not initialized');
  
  const hashedPassword = hashPassword(password);
  const stmt = db.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  );
  stmt.bind([username, hashedPassword]);
  
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  
  if (result) {
    // Update last login
    db.run(
      "UPDATE users SET last_login = datetime('now') WHERE id = ?",
      [result.id]
    );
    saveDatabase();
    
    // Remove password from result
    delete result.password;
    return result;
  }
  
  return null;
};

// Get user by ID
export const getUserById = (userId) => {
  if (!db) throw new Error('Database not initialized');
  
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  stmt.bind([userId]);
  
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  
  if (result) {
    // Remove password from result
    delete result.password;
    return result;
  }
  
  return null;
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  if (!db) throw new Error('Database not initialized');
  
  // Create SET clause and values array
  const setClauses = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'username' && key !== 'password') {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updates.password) {
    setClauses.push('password = ?');
    values.push(hashPassword(updates.password));
  }
  
  if (setClauses.length === 0) return false;
  
  // Add userId to values array
  values.push(userId);
  
  try {
    db.run(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      values
    );
    
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return false;
  }
};

// Tasks CRUD operations
export const getTasks = (userId, date = null) => {
  if (!db) throw new Error('Database not initialized');
  
  let query = "SELECT * FROM tasks WHERE user_id = ?";
  const params = [userId];
  
  if (date) {
    query += " AND date = ?";
    params.push(date);
  }
  
  query += " ORDER BY time ASC";
  
  const stmt = db.prepare(query);
  stmt.bind(params);
  
  const tasks = [];
  while (stmt.step()) {
    tasks.push(stmt.getAsObject());
  }
  stmt.free();
  
  return tasks;
};

export const createTask = async (userId, task) => {
  if (!db) throw new Error('Database not initialized');
  
  const taskId = task.id || uuidv4();
  const syncId = task.sync_id || uuidv4();
  
  try {
    db.run(
      `INSERT INTO tasks (id, user_id, title, time, priority, date, completed, created_at, updated_at, sync_id, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        taskId,
        userId,
        task.title,
        task.time || null,
        task.priority || 'medium',
        task.date,
        task.completed ? 1 : 0,
        syncId,
        'local'
      ]
    );
    
    await saveDatabase();
    return { ...task, id: taskId, sync_id: syncId, user_id: userId };
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
};

export const updateTask = async (taskId, updates) => {
  if (!db) throw new Error('Database not initialized');
  
  // Create SET clause and values array
  const setClauses = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'user_id' && key !== 'sync_id') {
      if (key === 'completed') {
        setClauses.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }
  }
  
  setClauses.push('updated_at = datetime(\'now\')');
  setClauses.push('sync_status = ?');
  values.push('local');
  
  // Add taskId to values array
  values.push(taskId);
  
  try {
    db.run(
      `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to update task:', error);
    return false;
  }
};

export const deleteTask = async (taskId) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    db.run("DELETE FROM tasks WHERE id = ?", [taskId]);
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
};

// Media CRUD operations
export const getMedia = (userId, type = null) => {
  if (!db) throw new Error('Database not initialized');
  
  let query = "SELECT * FROM media WHERE user_id = ?";
  const params = [userId];
  
  if (type && type !== 'all') {
    query += " AND type = ?";
    params.push(type);
  }
  
  query += " ORDER BY created_at DESC";
  
  const stmt = db.prepare(query);
  stmt.bind(params);
  
  const media = [];
  while (stmt.step()) {
    media.push(stmt.getAsObject());
  }
  stmt.free();
  
  return media;
};

export const saveMedia = async (userId, media) => {
  if (!db) throw new Error('Database not initialized');
  
  const mediaId = media.id || uuidv4();
  const syncId = media.sync_id || uuidv4();
  
  try {
    db.run(
      `INSERT INTO media (id, user_id, name, url, type, size, source, created_at, sync_id, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      [
        mediaId,
        userId,
        media.name,
        media.url,
        media.type,
        media.size || 0,
        media.source || 'camera',
        syncId,
        'local'
      ]
    );
    
    await saveDatabase();
    return { ...media, id: mediaId, sync_id: syncId, user_id: userId };
  } catch (error) {
    console.error('Failed to save media:', error);
    throw error;
  }
};

export const deleteMedia = async (mediaId) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    db.run("DELETE FROM media WHERE id = ?", [mediaId]);
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to delete media:', error);
    return false;
  }
};

// Notes CRUD operations
export const getNotes = (userId) => {
  if (!db) throw new Error('Database not initialized');
  
  const stmt = db.prepare(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC"
  );
  stmt.bind([userId]);
  
  const notes = [];
  while (stmt.step()) {
    notes.push(stmt.getAsObject());
  }
  stmt.free();
  
  return notes;
};

export const createNote = async (userId, note) => {
  if (!db) throw new Error('Database not initialized');
  
  const noteId = note.id || uuidv4();
  const syncId = note.sync_id || uuidv4();
  
  try {
    db.run(
      `INSERT INTO notes (id, user_id, title, content, created_at, updated_at, sync_id, sync_status)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        noteId,
        userId,
        note.title,
        note.content || '',
        syncId,
        'local'
      ]
    );
    
    await saveDatabase();
    return { ...note, id: noteId, sync_id: syncId, user_id: userId };
  } catch (error) {
    console.error('Failed to create note:', error);
    throw error;
  }
};

export const updateNote = async (noteId, updates) => {
  if (!db) throw new Error('Database not initialized');
  
  // Create SET clause and values array
  const setClauses = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'user_id' && key !== 'sync_id') {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  setClauses.push('updated_at = datetime(\'now\')');
  setClauses.push('sync_status = ?');
  values.push('local');
  
  // Add noteId to values array
  values.push(noteId);
  
  try {
    db.run(
      `UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to update note:', error);
    return false;
  }
};

export const deleteNote = async (noteId) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    db.run("DELETE FROM notes WHERE id = ?", [noteId]);
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to delete note:', error);
    return false;
  }
};

// Settings operations
export const getSetting = (userId, key) => {
  if (!db) throw new Error('Database not initialized');
  
  const stmt = db.prepare(
    "SELECT value FROM settings WHERE user_id = ? AND key = ?"
  );
  stmt.bind([userId, key]);
  
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  
  return result ? result.value : null;
};

export const setSetting = async (userId, key, value) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    // Check if setting exists
    const existingValue = getSetting(userId, key);
    
    if (existingValue !== null) {
      // Update existing setting
      db.run(
        "UPDATE settings SET value = ?, updated_at = datetime('now') WHERE user_id = ? AND key = ?",
        [value, userId, key]
      );
    } else {
      // Insert new setting
      db.run(
        "INSERT INTO settings (id, user_id, key, value) VALUES (?, ?, ?, ?)",
        [uuidv4(), userId, key, value]
      );
    }
    
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to set setting:', error);
    return false;
  }
};

// Sync operations
export const getLastSyncInfo = (userId) => {
  if (!db) throw new Error('Database not initialized');
  
  const stmt = db.prepare(
    "SELECT * FROM sync_info WHERE user_id = ?"
  );
  stmt.bind([userId]);
  
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  
  return result;
};

export const updateSyncInfo = async (userId, syncToken) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    // Check if sync info exists
    const existingInfo = getLastSyncInfo(userId);
    
    if (existingInfo) {
      // Update existing sync info
      db.run(
        "UPDATE sync_info SET last_sync = datetime('now'), sync_token = ? WHERE user_id = ?",
        [syncToken, userId]
      );
    } else {
      // Insert new sync info
      db.run(
        "INSERT INTO sync_info (user_id, last_sync, sync_token) VALUES (?, datetime('now'), ?)",
        [userId, syncToken]
      );
    }
    
    await saveDatabase();
    return true;
  } catch (error) {
    console.error('Failed to update sync info:', error);
    return false;
  }
};

// Get items to sync with the server
export const getItemsToSync = (userId) => {
  if (!db) throw new Error('Database not initialized');
  
  const items = {
    tasks: [],
    media: [],
    notes: []
  };
  
  // Get tasks to sync
  let stmt = db.prepare(
    "SELECT * FROM tasks WHERE user_id = ? AND sync_status = 'local'"
  );
  stmt.bind([userId]);
  
  while (stmt.step()) {
    items.tasks.push(stmt.getAsObject());
  }
  stmt.free();
  
  // Get media to sync
  stmt = db.prepare(
    "SELECT * FROM media WHERE user_id = ? AND sync_status = 'local'"
  );
  stmt.bind([userId]);
  
  while (stmt.step()) {
    items.media.push(stmt.getAsObject());
  }
  stmt.free();
  
  // Get notes to sync
  stmt = db.prepare(
    "SELECT * FROM notes WHERE user_id = ? AND sync_status = 'local'"
  );
  stmt.bind([userId]);
  
  while (stmt.step()) {
    items.notes.push(stmt.getAsObject());
  }
  stmt.free();
  
  return items;
};

// Mark items as synced
export const markItemsAsSynced = async (userId, itemType, itemIds) => {
  if (!db) throw new Error('Database not initialized');
  
  if (itemIds.length === 0) return true;
  
  const placeholders = itemIds.map(() => '?').join(',');
  
  try {
    db.run(
      `UPDATE ${itemType} SET sync_status = 'synced' WHERE user_id = ? AND id IN (${placeholders})`,
      [userId, ...itemIds]
    );
    
    await saveDatabase();
    return true;
  } catch (error) {
    console.error(`Failed to mark ${itemType} as synced:`, error);
    return false;
  }
};

// Initialize database on module import
initDatabase().catch(console.error);