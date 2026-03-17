import { Version } from '../types';

export type DiffResult = {
  initiatives: EntityDiff;
  dependencies: EntityDiff;
  milestones: EntityDiff;
  hasChanges: boolean;
};

type EntityDiff = {
  added: string[];
  removed: string[];
  modified: { name: string; changes: string[] }[];
};

function compareEntities<T extends { id: string }>(
  base: T[],
  curr: T[],
  getDisplayName: (item: T) => string,
  getChanges: (b: T, c: T) => string[]
): EntityDiff {
  const added = curr.filter(ci => !base.some(bi => bi.id === ci.id)).map(i => getDisplayName(i));
  const removed = base.filter(bi => !curr.some(ci => ci.id === bi.id)).map(i => getDisplayName(i));
  const modified: { name: string; changes: string[] }[] = [];

  curr.forEach(ci => {
    const bi = base.find(b => b.id === ci.id);
    if (bi) {
      const changes = getChanges(bi, ci);
      if (changes.length > 0) modified.push({ name: getDisplayName(ci), changes });
    }
  });

  return { added, removed, modified };
}

export function computeDiff(baseVersion: Version, currentData: Version['data']): DiffResult {
  const initiatives = compareEntities(
    baseVersion.data.initiatives,
    currentData.initiatives,
    (i) => i.name,
    (b, c) => {
      const changes: string[] = [];
      if (b.name !== c.name) changes.push(`Renamed from "${b.name}" to "${c.name}"`);
      if (b.startDate !== c.startDate) changes.push(`Start date: ${b.startDate} → ${c.startDate}`);
      if (b.endDate !== c.endDate) changes.push(`End date: ${b.endDate} → ${c.endDate}`);
      if (b.budget !== c.budget) changes.push(`Budget: $${b.budget.toLocaleString()} → $${c.budget.toLocaleString()}`);
      if (b.assetId !== c.assetId) {
        const oldAsset = baseVersion.data.assets.find(a => a.id === b.assetId)?.name || 'Unknown';
        const newAsset = currentData.assets.find(a => a.id === c.assetId)?.name || 'Unknown';
        changes.push(`Moved from Asset "${oldAsset}" to "${newAsset}"`);
      }
      return changes;
    }
  );

  const dependencies = compareEntities(
    baseVersion.data.dependencies,
    currentData.dependencies,
    (d) => {
      const s = currentData.initiatives.find(i => i.id === d.sourceId)?.name
        || baseVersion.data.initiatives.find(i => i.id === d.sourceId)?.name
        || 'Unknown';
      const t = currentData.initiatives.find(i => i.id === d.targetId)?.name
        || baseVersion.data.initiatives.find(i => i.id === d.targetId)?.name
        || 'Unknown';
      return `${s} → ${t}`;
    },
    (b, c) => {
      const changes: string[] = [];
      if (b.type !== c.type) changes.push(`Type: ${b.type} → ${c.type}`);
      if (b.sourceId !== c.sourceId || b.targetId !== c.targetId) changes.push('Endpoints reconnected');
      return changes;
    }
  );

  const milestones = compareEntities(
    baseVersion.data.milestones,
    currentData.milestones,
    (m) => m.name,
    (b, c) => {
      const changes: string[] = [];
      if (b.name !== c.name) changes.push(`Renamed to "${c.name}"`);
      if (b.date !== c.date) changes.push(`Date: ${b.date} → ${c.date}`);
      if (b.type !== c.type) changes.push(`Type: ${b.type} → ${c.type}`);
      return changes;
    }
  );

  const hasChanges =
    initiatives.added.length > 0 || initiatives.removed.length > 0 || initiatives.modified.length > 0 ||
    dependencies.added.length > 0 || dependencies.removed.length > 0 || dependencies.modified.length > 0 ||
    milestones.added.length > 0 || milestones.removed.length > 0 || milestones.modified.length > 0;

  return { initiatives, dependencies, milestones, hasChanges };
}
