import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory } from '../types';

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
  strategies: {
    key: string;
    value: Strategy;
  };
  dependencies: {
    key: string;
    value: Dependency;
  };
  assetCategories: {
    key: string;
    value: AssetCategory;
  };
}

const DB_NAME = 'it-initiative-visualiser';
const DB_VERSION = 4;

let dbPromise: Promise<IDBPDatabase<ITMapDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ITMapDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
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
        if (!db.objectStoreNames.contains('strategies')) {
          db.createObjectStore('strategies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('dependencies')) {
          db.createObjectStore('dependencies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('assetCategories')) {
          db.createObjectStore('assetCategories', { keyPath: 'id' });
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
  const strategies = await db.getAll('strategies');
  const dependencies = await db.getAll('dependencies');
  const assetCategories = await db.getAll('assetCategories');

  return {
    assets,
    initiatives,
    milestones,
    programmes,
    strategies,
    dependencies,
    assetCategories,
  };
};

export const saveAppData = async (data: {
  assets: Asset[];
  initiatives: Initiative[];
  milestones: Milestone[];
  programmes: Programme[];
  strategies: Strategy[];
  dependencies: Dependency[];
  assetCategories: AssetCategory[];
}) => {
  const db = await initDB();
  const tx = db.transaction(['assets', 'initiatives', 'milestones', 'programmes', 'strategies', 'dependencies', 'assetCategories'], 'readwrite');

  await Promise.all([
    tx.objectStore('assets').clear(),
    tx.objectStore('initiatives').clear(),
    tx.objectStore('milestones').clear(),
    tx.objectStore('programmes').clear(),
    tx.objectStore('strategies').clear(),
    tx.objectStore('dependencies').clear(),
    tx.objectStore('assetCategories').clear(),
  ]);

  await Promise.all([
    ...data.assets.map(item => tx.objectStore('assets').add(item)),
    ...data.initiatives.map(item => tx.objectStore('initiatives').add(item)),
    ...data.milestones.map(item => tx.objectStore('milestones').add(item)),
    ...data.programmes.map(item => tx.objectStore('programmes').add(item)),
    ...data.strategies.map(item => tx.objectStore('strategies').add(item)),
    ...data.dependencies.map(item => tx.objectStore('dependencies').add(item)),
    ...data.assetCategories.map(item => tx.objectStore('assetCategories').add(item)),
  ]);

  await tx.done;
};
