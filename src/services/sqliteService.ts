import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export class SqliteService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(customPath?: string) {
    this.dbPath = customPath || process.env.SQLITE_DB_PATH || "./database.sqlite";
    this.init();
  }

  private init() {
    try {
      const fullPath = path.resolve(process.cwd(), this.dbPath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(fullPath);
      this.db.pragma("journal_mode = WAL");

      // Initialize Core Marketplace Tables
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT,
          subcategory TEXT,
          material TEXT,
          price REAL,
          b2b_price REAL,
          artisan_id TEXT,
          artisan_name TEXT,
          image_url TEXT,
          description TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS inquiries (
          id TEXT PRIMARY KEY,
          inquiry_number TEXT,
          buyer_id TEXT,
          buyer_name TEXT,
          business_name TEXT,
          artisan_id TEXT,
          artisan_name TEXT,
          quantity INTEGER,
          target_price REAL,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS quotes (
          id TEXT PRIMARY KEY,
          inquiry_id TEXT,
          artisan_id TEXT,
          artisan_name TEXT,
          buyer_id TEXT,
          quantity INTEGER,
          unit_price REAL,
          total_amount REAL,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS analytics_events (
          id TEXT PRIMARY KEY,
          product_id TEXT,
          user_id TEXT,
          event_type TEXT NOT NULL,
          timestamp TEXT,
          metadata TEXT
        );
      `);

      console.log(`[SQLite] Local database initialized successfully at: ${fullPath}`);
    } catch (err: any) {
      console.error("[SQLite] Database initialization error:", err?.message || err);
    }
  }

  public getDb(): Database.Database | null {
    return this.db;
  }

  public insertProduct(product: any) {
    if (!this.db) return false;
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO products (
          id, title, category, subcategory, material, price, b2b_price, 
          artisan_id, artisan_name, image_url, description, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        product.id,
        product.title || product.product_name,
        product.category,
        product.subcategory,
        Array.isArray(product.material) ? product.material.join(", ") : product.material,
        product.price || product.retail_price,
        product.b2b_price,
        product.artisan_id,
        product.artisan_name,
        product.image_url || product.imageUrl,
        product.description,
        Array.isArray(product.tags) ? product.tags.join(",") : product.tags
      );
      return true;
    } catch (e: any) {
      console.error("[SQLite] Insert product failed:", e?.message);
      return false;
    }
  }

  public getProducts(limit = 50) {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare("SELECT * FROM products ORDER BY created_at DESC LIMIT ?");
      return stmt.all(limit);
    } catch (e: any) {
      console.error("[SQLite] Get products failed:", e?.message);
      return [];
    }
  }

  public logEvent(event: { id: string; product_id?: string; user_id?: string; event_type: string; timestamp: string; metadata?: any }) {
    if (!this.db) return false;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO analytics_events (id, product_id, user_id, event_type, timestamp, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        event.id,
        event.product_id || null,
        event.user_id || null,
        event.event_type,
        event.timestamp,
        event.metadata ? JSON.stringify(event.metadata) : null
      );
      return true;
    } catch (e: any) {
      return false;
    }
  }
}

export const sqliteService = new SqliteService();
