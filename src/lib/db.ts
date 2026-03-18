import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Asset, Initiative, Milestone, Programme, Strategy, Dependency, AssetCategory, TimelineSettings, Version, Resource } from '../types';

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
  settings: {
    key: string;
    value: TimelineSettings;
  };
  versions: {
    key: string;
    value: Version;
  };
  resources: {
    key: string;
    value: Resource;
  };
}

const DB_NAME = 'it-initiative-visualiser';
const DB_VERSION = 7;

let dbPromise: Promise<IDBPDatabase<ITMapDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ITMapDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        if (oldVersion < 2 && !db.objectStoreNames.contains('initiatives')) {
          db.createObjectStore('initiatives', { keyPath: 'id' });
        }
        if (oldVersion < 3 && !db.objectStoreNames.contains('milestones')) {
          db.createObjectStore('milestones', { keyPath: 'id' });
        }
        if (oldVersion < 4 && !db.objectStoreNames.contains('programmes')) {
          db.createObjectStore('programmes', { keyPath: 'id' });
          db.createObjectStore('strategies', { keyPath: 'id' });
          db.createObjectStore('dependencies', { keyPath: 'id' });
          db.createObjectStore('assetCategories', { keyPath: 'id' });
        }
        if (oldVersion < 5 && !db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (oldVersion < 6 && !db.objectStoreNames.contains('versions')) {
          db.createObjectStore('versions', { keyPath: 'id' });
        }
        if (oldVersion < 7 && !db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' });
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
  const resources = db.objectStoreNames.contains('resources') ? await db.getAll('resources') : [];

  // Settings is not a standard list of entities, it's just one config object
  let settingsFromDb = null;
  if (db.objectStoreNames.contains('settings')) {
    settingsFromDb = await db.get('settings', 'timelineSettings');
  }
  const timelineSettings = settingsFromDb || { startYear: 2026, monthsToShow: 36 };

  return {
    assets,
    initiatives,
    milestones,
    programmes,
    strategies,
    dependencies,
    assetCategories,
    timelineSettings,
    resources,
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
  timelineSettings: TimelineSettings;
  resources: Resource[];
}) => {
  const db = await initDB();
  const stores: ("assets" | "initiatives" | "milestones" | "programmes" | "strategies" | "dependencies" | "assetCategories" | "settings" | "resources")[] = [
    'assets', 'initiatives', 'milestones', 'programmes', 'strategies', 'dependencies', 'assetCategories'
  ];
  if (db.objectStoreNames.contains('settings')) {
    stores.push('settings');
  }
  if (db.objectStoreNames.contains('resources')) {
    stores.push('resources');
  }
  const tx = db.transaction(stores, 'readwrite');

  // Queue all clears and adds in a single batch without intermediate awaits.
  // Awaiting between operations risks the transaction auto-committing before
  // all adds are queued, which would leave the stores empty.
  const allPromises = [
    tx.objectStore('assets').clear(),
    tx.objectStore('initiatives').clear(),
    tx.objectStore('milestones').clear(),
    tx.objectStore('programmes').clear(),
    tx.objectStore('strategies').clear(),
    tx.objectStore('dependencies').clear(),
    tx.objectStore('assetCategories').clear(),
    ...data.assets.map(item => tx.objectStore('assets').add(item)),
    ...data.initiatives.map(item => tx.objectStore('initiatives').add(item)),
    ...data.milestones.map(item => tx.objectStore('milestones').add(item)),
    ...data.programmes.map(item => tx.objectStore('programmes').add(item)),
    ...data.strategies.map(item => tx.objectStore('strategies').add(item)),
    ...data.dependencies.map(item => tx.objectStore('dependencies').add(item)),
    ...data.assetCategories.map(item => tx.objectStore('assetCategories').add(item)),
  ];
  if (db.objectStoreNames.contains('settings')) {
    allPromises.push(tx.objectStore('settings').clear());
    allPromises.push(tx.objectStore('settings').put(data.timelineSettings, 'timelineSettings'));
  }
  if (db.objectStoreNames.contains('resources')) {
    allPromises.push(tx.objectStore('resources').clear());
    (data.resources || []).forEach(item => allPromises.push(tx.objectStore('resources').add(item)));
  }
  await Promise.all(allPromises);

  await tx.done;
};

// Versions helper functions
export const saveVersion = async (version: Version) => {
  const db = await initDB();
  await db.put('versions', version);
};

export const getAllVersions = async () => {
  const db = await initDB();
  return db.getAll('versions');
};

export const deleteVersion = async (id: string) => {
  const db = await initDB();
  await db.delete('versions', id);
};
