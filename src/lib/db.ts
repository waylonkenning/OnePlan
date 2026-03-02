import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Asset, Initiative, Milestone, Programme } from '../types';

interface ITMapDB extends DBSchema {
  assets: {
    key: string;
    value: Asset;
  };
  initiatives: {
    key: string;
    value: Initiative;
  };
  milestones: {
    key: string;
    value: Milestone;
  };
  programmes: {
    key: string;
    value: Programme;
  };
}

const DB_NAME = 'it-initiative-visualiser';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ITMapDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ITMapDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('initiatives')) {
          db.createObjectStore('initiatives', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('milestones')) {
          db.createObjectStore('milestones', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('programmes')) {
          db.createObjectStore('programmes', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const getAppData = async () => {
  const db = await initDB();
  const assets = await db.getAll('assets');
  const initiatives = await db.getAll('initiatives');
  const milestones = await db.getAll('milestones');
  const programmes = await db.getAll('programmes');

  return {
    assets,
    initiatives,
    milestones,
    programmes,
  };
};

export const saveAppData = async (data: {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
}) => {
  const db = await initDB();
  const tx = db.transaction(['assets', 'initiatives', 'milestones', 'programmes'], 'readwrite');

  // Clear existing data to ensure sync (simple approach for now)
  // In a real app with huge data, we might want to diff, but for this size, clearing is fine and safer
  await Promise.all([
    tx.objectStore('assets').clear(),
    tx.objectStore('initiatives').clear(),
    tx.objectStore('milestones').clear(),
    tx.objectStore('programmes').clear(),
  ]);

  // Add new data
  await Promise.all([
    ...data.assets.map(item => tx.objectStore('assets').add(item)),
    ...data.initiatives.map(item => tx.objectStore('initiatives').add(item)),
    ...data.milestones.map(item => tx.objectStore('milestones').add(item)),
    ...data.programmes.map(item => tx.objectStore('programmes').add(item)),
  ]);

  await tx.done;
};
