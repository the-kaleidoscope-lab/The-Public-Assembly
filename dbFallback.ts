import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(path.join(__dirname, 'public_assembly.db'));
    dbInstance.pragma('journal_mode = WAL');
  }
  return dbInstance;
}

const generateObjectId = () => crypto.randomBytes(12).toString('hex');

const POPULATE_MAP: Record<string, string> = {
  createdBy: 'users',
  userId: 'users',
  assignedTo: 'users',
  initiativeId: 'initiatives',
  taskId: 'tasks',
};

function normalizeId(val: any): string {
  if (val == null) return '';
  if (typeof val === 'object') {
    return String(val._id || val.id || val);
  }
  return String(val);
}

function matchesFilter(doc: any, filter: Record<string, any> = {}): boolean {
  for (const [key, condition] of Object.entries(filter)) {
    const docVal = doc[key];
    if (condition && typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
      if ('$lt' in condition) {
        const docTime = docVal ? new Date(docVal).getTime() : 0;
        const targetTime = new Date(condition.$lt).getTime();
        if (!(docTime < targetTime)) return false;
      } else if ('$gt' in condition) {
        const docTime = docVal ? new Date(docVal).getTime() : 0;
        const targetTime = new Date(condition.$gt).getTime();
        if (!(docTime > targetTime)) return false;
      } else {
        if (normalizeId(docVal) !== normalizeId(condition)) return false;
      }
    } else {
      if (key === '_id' || key === 'id' || key.endsWith('Id') || key === 'createdBy' || key === 'assignedTo') {
        if (normalizeId(docVal) !== normalizeId(condition)) return false;
      } else if (docVal !== condition) {
        return false;
      }
    }
  }
  return true;
}

function projectFields(obj: any, selectStr?: string): any {
  if (!selectStr || !obj) return obj;
  const fields = selectStr.split(/\s+/).filter(Boolean);
  if (fields.length === 0) return obj;
  const result: any = { _id: obj._id, id: obj.id };
  for (const f of fields) {
    if (f in obj) result[f] = obj[f];
  }
  return result;
}

export class SqliteDocument {
  [key: string]: any;
  private _table: string;

  constructor(table: string, data: Record<string, any>) {
    this._table = table;
    Object.assign(this, data);
    if (!this._id) {
      this._id = data.id || generateObjectId();
    }
    this.id = this._id;
  }

  toObject() {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(this)) {
      if (k === '_table') continue;
      out[k] = v;
    }
    out.id = this._id;
    return out;
  }

  toJSON() {
    return this.toObject();
  }

  async save() {
    const db = getDb();
    const obj = this.toObject();
    db.prepare(`INSERT OR REPLACE INTO "${this._table}" (id, data) VALUES (?, ?)`).run(
      this._id,
      JSON.stringify(obj)
    );
    return this;
  }

  async populate(field: string, selectStr?: string) {
    const targetTable = POPULATE_MAP[field];
    if (targetTable && this[field]) {
      const refId = normalizeId(this[field]);
      const db = getDb();
      const row = db.prepare(`SELECT data FROM "${targetTable}" WHERE id = ?`).get(refId) as { data: string } | undefined;
      if (row) {
        const parsed = JSON.parse(row.data);
        this[field] = projectFields(parsed, selectStr);
      }
    }
    return this;
  }
}

class SqliteQuery {
  private _table: string;
  private _filter: Record<string, any>;
  private _single: boolean;
  private _populates: Array<{ field: string; select?: string }> = [];
  private _sortObj: Record<string, number> | null = null;
  private _limitNum: number | null = null;
  private _selectStr?: string;
  private _preloaded?: SqliteDocument | null;

  constructor(
    table: string,
    filter: Record<string, any> = {},
    single = false,
    preloaded?: SqliteDocument | null
  ) {
    this._table = table;
    this._filter = filter;
    this._single = single;
    this._preloaded = preloaded;
  }

  populate(field: string, select?: string) {
    this._populates.push({ field, select });
    return this;
  }

  sort(sortObj: Record<string, number>) {
    this._sortObj = sortObj;
    return this;
  }

  limit(n: number) {
    this._limitNum = n;
    return this;
  }

  select(fields: string) {
    this._selectStr = fields;
    return this;
  }

  private async _exec(): Promise<any> {
    const db = getDb();
    let docs: SqliteDocument[];

    if (this._preloaded !== undefined) {
      docs = this._preloaded ? [this._preloaded] : [];
    } else {
      const rows = db.prepare(`SELECT data FROM "${this._table}"`).all() as Array<{ data: string }>;
      docs = rows
        .map((r) => new SqliteDocument(this._table, JSON.parse(r.data)))
        .filter((d) => matchesFilter(d, this._filter));
    }

    if (this._sortObj) {
      const entries = Object.entries(this._sortObj);
      docs.sort((a, b) => {
        for (const [k, dir] of entries) {
          const av = a[k] ? new Date(a[k]).getTime() || a[k] : 0;
          const bv = b[k] ? new Date(b[k]).getTime() || b[k] : 0;
          if (av < bv) return dir < 0 ? 1 : -1;
          if (av > bv) return dir < 0 ? -1 : 1;
        }
        return 0;
      });
    }

    if (this._limitNum !== null) {
      docs = docs.slice(0, this._limitNum);
    }

    for (const doc of docs) {
      for (const p of this._populates) {
        await doc.populate(p.field, p.select);
      }
      if (this._selectStr) {
        const projected = projectFields(doc.toObject(), this._selectStr);
        for (const key of Object.keys(doc)) {
          if (key !== '_table' && !(key in projected)) {
            delete doc[key];
          }
        }
        Object.assign(doc, projected);
      }
    }

    return this._single ? docs[0] || null : docs;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._exec().then(onfulfilled, onrejected);
  }
}

export function createSqliteModel(
  table: string,
  defaults: Record<string, any> = {}
) {
  const db = getDb();
  db.exec(`CREATE TABLE IF NOT EXISTS "${table}" (id TEXT PRIMARY KEY, data TEXT NOT NULL)`);

  const buildDoc = (input: Record<string, any>) => {
    const merged: Record<string, any> = {
      ...defaults,
      ...input,
    };
    if (!merged.createdAt && table !== 'certificates') {
      merged.createdAt = new Date().toISOString();
    }
    if (table === 'certificates' && !merged.issuedAt) {
      merged.issuedAt = new Date().toISOString();
    }
    if (table === 'volunteers' && !merged.joinedAt) {
      merged.joinedAt = new Date().toISOString();
    }
    // Serialize Date fields to ISO strings for consistent storage
    for (const [k, v] of Object.entries(merged)) {
      if (v instanceof Date) {
        merged[k] = v.toISOString();
      }
    }
    return new SqliteDocument(table, merged);
  };

  return {
    find(filter: Record<string, any> = {}) {
      return new SqliteQuery(table, filter, false);
    },

    findOne(filter: Record<string, any> = {}) {
      return new SqliteQuery(table, filter, true);
    },

    findById(id: any) {
      const normalized = normalizeId(id);
      const row = db.prepare(`SELECT data FROM "${table}" WHERE id = ?`).get(normalized) as
        | { data: string }
        | undefined;
      const doc = row ? new SqliteDocument(table, JSON.parse(row.data)) : null;
      return new SqliteQuery(table, {}, true, doc);
    },

    async create(input: Record<string, any>) {
      const doc = buildDoc(input);
      await doc.save();
      return doc;
    },

    async insertMany(inputs: Array<Record<string, any>>) {
      const docs: SqliteDocument[] = [];
      const insert = db.prepare(`INSERT OR REPLACE INTO "${table}" (id, data) VALUES (?, ?)`);
      const tx = db.transaction((items: Array<Record<string, any>>) => {
        for (const item of items) {
          const doc = buildDoc(item);
          insert.run(doc._id, JSON.stringify(doc.toObject()));
          docs.push(doc);
        }
      });
      tx(inputs);
      return docs;
    },

    async countDocuments(filter: Record<string, any> = {}) {
      const rows = db.prepare(`SELECT data FROM "${table}"`).all() as Array<{ data: string }>;
      if (Object.keys(filter).length === 0) return rows.length;
      return rows.filter((r) => matchesFilter(JSON.parse(r.data), filter)).length;
    },

    async distinct(field: string) {
      const rows = db.prepare(`SELECT data FROM "${table}"`).all() as Array<{ data: string }>;
      const set = new Set<any>();
      for (const r of rows) {
        const parsed = JSON.parse(r.data);
        if (parsed[field] !== undefined && parsed[field] !== null && parsed[field] !== '') {
          set.add(parsed[field]);
        }
      }
      return Array.from(set);
    },

    findByIdAndUpdate(id: any, update: Record<string, any>, _options?: any) {
      const normalized = normalizeId(id);
      const row = db.prepare(`SELECT data FROM "${table}" WHERE id = ?`).get(normalized) as
        | { data: string }
        | undefined;
      if (!row) {
        return new SqliteQuery(table, {}, true, null);
      }
      const parsed = JSON.parse(row.data);
      const updatedData = { ...parsed, ...update };
      const doc = new SqliteDocument(table, updatedData);
      db.prepare(`INSERT OR REPLACE INTO "${table}" (id, data) VALUES (?, ?)`).run(
        doc._id,
        JSON.stringify(doc.toObject())
      );
      return new SqliteQuery(table, {}, true, doc);
    },
  };
}
