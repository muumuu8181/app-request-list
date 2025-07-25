import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * アプリID管理システム
 * 複数AI並行実行時でもアプリ種別ごとに一意IDを保証
 */
class AppIdManager {
  constructor() {
    this.lockFile = path.join(__dirname, '../locks/app-id.lock');
    this.registryFile = path.join(__dirname, '../app-type-registry.json');
    this.logFile = path.join(__dirname, '../logs/id-assignment.log');
    
    // ディレクトリ作成
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    const dirs = ['../locks', '../logs'];
    dirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }
  
  /**
   * ファイルロック取得（排他制御）
   */
  async acquireLock() {
    let attempts = 0;
    const maxAttempts = 50; // 5秒まで待機
    
    while (fs.existsSync(this.lockFile) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('ロック取得タイムアウト');
    }
    
    fs.writeFileSync(this.lockFile, JSON.stringify({
      pid: process.pid,
      timestamp: new Date().toISOString()
    }));
  }
  
  /**
   * ファイルロック解放
   */
  releaseLock() {
    if (fs.existsSync(this.lockFile)) {
      fs.unlinkSync(this.lockFile);
    }
  }
  
  /**
   * レジストリ読み込み
   */
  loadRegistry() {
    if (!fs.existsSync(this.registryFile)) {
      return {
        registry: {},
        next_available_id: "001",
        last_updated: new Date().toISOString()
      };
    }
    return JSON.parse(fs.readFileSync(this.registryFile, 'utf8'));
  }
  
  /**
   * レジストリ保存
   */
  saveRegistry(registry) {
    registry.last_updated = new Date().toISOString();
    fs.writeFileSync(this.registryFile, JSON.stringify(registry, null, 2));
  }
  
  /**
   * キーワードマッチングで既存種別検索
   */
  findMatchingAppType(title, description, registry) {
    const text = `${title} ${description}`.toLowerCase();
    
    for (const [typeKey, typeData] of Object.entries(registry.registry)) {
      const hasKeyword = typeData.keywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
      if (hasKeyword) {
        this.log(`キーワードマッチ: "${title}" → ${typeData.name} (${typeData.id})`);
        return typeData;
      }
    }
    return null;
  }
  
  /**
   * 新アプリ種別登録
   */
  registerNewAppType(title, description, registry) {
    const newId = registry.next_available_id;
    const typeKey = this.generateTypeKey(title);
    
    // 基本キーワード抽出（簡易版）
    const keywords = this.extractKeywords(title, description);
    
    registry.registry[typeKey] = {
      id: newId,
      name: title,
      keywords: keywords,
      created_date: new Date().toISOString().split('T')[0]
    };
    
    // 次のIDを生成
    registry.next_available_id = String(parseInt(newId) + 1).padStart(3, '0');
    
    this.log(`新種別登録: ${title} → ${newId}`);
    return newId;
  }
  
  /**
   * 種別キー生成
   */
  generateTypeKey(title) {
    return title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }
  
  /**
   * キーワード抽出（簡易版）
   */
  extractKeywords(title, description) {
    const text = `${title} ${description}`;
    const words = text.toLowerCase().match(/[\w]+/g) || [];
    
    // 重要そうなワードを抽出（長さ2文字以上）
    const keywords = words.filter(word => word.length >= 2);
    
    // 重複削除して最大5個まで
    return [...new Set(keywords)].slice(0, 5);
  }
  
  /**
   * ログ出力
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }
  
  /**
   * メイン: 一意アプリID取得
   */
  async getUniqueAppId(request) {
    await this.acquireLock();
    try {
      const registry = this.loadRegistry();
      
      // 既存種別検索
      const matchedType = this.findMatchingAppType(
        request.title, 
        request.description || request.requirements?.join(' ') || '', 
        registry
      );
      
      let appId;
      if (matchedType) {
        // 既存種別のIDを使用
        appId = matchedType.id;
        this.log(`既存ID使用: "${request.title}" → ${appId}`);
      } else {
        // 新種別として登録
        appId = this.registerNewAppType(
          request.title,
          request.description || request.requirements?.join(' ') || '',
          registry
        );
      }
      
      this.saveRegistry(registry);
      return appId;
      
    } finally {
      this.releaseLock();
    }
  }
  
  /**
   * 種別一覧表示
   */
  listAppTypes() {
    const registry = this.loadRegistry();
    return registry.registry;
  }
  
  /**
   * 統計情報
   */
  getStats() {
    const registry = this.loadRegistry();
    return {
      total_types: Object.keys(registry.registry).length,
      next_id: registry.next_available_id,
      last_updated: registry.last_updated
    };
  }
}

export default AppIdManager;

// 使用例
if (import.meta.url === `file://${process.argv[1]}`) {
  async function example() {
    const manager = new AppIdManager();
    
    // テスト用要求
    const requests = [
      { title: "格好良い電卓", description: "四則演算ができる電卓" },
      { title: "時間管理ツール", description: "ポモドーロタイマー付き" },
      { title: "家計簿アプリ", description: "収支管理システム" },
      { title: "Calculator Pro", description: "Scientific calculator" },
      { title: "タイマーアプリ", description: "集中時間を測定" }
    ];
    
    for (const request of requests) {
      const id = await manager.getUniqueAppId(request);
      console.log(`"${request.title}" → ID: ${id}`);
    }
    
    console.log('\n=== 統計情報 ===');
    console.log(manager.getStats());
    
    console.log('\n=== 登録済み種別 ===');
    console.log(manager.listAppTypes());
  }
  
  example().catch(console.error);
}