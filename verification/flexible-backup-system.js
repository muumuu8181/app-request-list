import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import chokidar from 'chokidar';

/**
 * 柔軟なバックアップ・復旧システム
 * ユーザーの自由度を保ちつつ、データ損失を防ぐ
 */
class FlexibleBackupSystem {
  constructor() {
    this.watchFile = 'app-requests.md';
    this.backupDir = 'auto-backup';
    this.historyDir = 'id-history';
    
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    [this.backupDir, this.historyDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  /**
   * ファイル監視開始
   */
  startWatching() {
    console.log('📁 ファイル監視開始:', this.watchFile);
    
    const watcher = chokidar.watch(this.watchFile, {
      persistent: true,
      ignoreInitial: false
    });
    
    watcher
      .on('add', (path) => {
        console.log('✅ ファイル作成検知:', path);
        this.createBackup('add');
      })
      .on('change', (path) => {
        console.log('📝 ファイル変更検知:', path);
        this.createBackup('change');
      })
      .on('unlink', (path) => {
        console.log('🚨 ファイル削除検知!', path);
        this.handleFileDeletion();
      })
      .on('error', (error) => {
        console.error('❌ ファイル監視エラー:', error);
      });
    
    return watcher;
  }
  
  /**
   * 自動バックアップ作成
   */
  createBackup(event = 'manual') {
    if (!fs.existsSync(this.watchFile)) {
      console.log('⚠️  対象ファイルが見つかりません');
      return;
    }
    
    const content = fs.readFileSync(this.watchFile, 'utf8');
    const timestamp = new Date().toISOString();
    const md5Hash = crypto.createHash('md5').update(content).digest('hex');
    
    // バックアップデータ作成
    const backup = {
      backup_timestamp: timestamp,
      event_type: event,
      original_md5: md5Hash,
      original_content: content,
      parsed_requests: this.parseRequests(content),
      file_size: content.length
    };
    
    // バックアップファイル保存
    const backupFile = path.join(
      this.backupDir, 
      `backup_${timestamp.replace(/[:.]/g, '-')}.json`
    );
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`💾 バックアップ作成: ${backupFile}`);
    
    // 最新バックアップも更新
    fs.writeFileSync(
      path.join(this.backupDir, 'latest-backup.json'),
      JSON.stringify(backup, null, 2)
    );
  }
  
  /**
   * 柔軟な要求パーサー
   */
  parseRequests(content) {
    try {
      // 1. JSON形式を試す
      if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
        return { format: 'json', data: JSON.parse(content) };
      }
      
      // 2. Markdown形式を解析
      if (content.includes('#') || content.includes('##')) {
        return this.parseMarkdown(content);
      }
      
      // 3. 自然言語として解析
      return this.parseNaturalLanguage(content);
      
    } catch (error) {
      console.log('⚠️  パース失敗、生テキストとして保存');
      return { format: 'raw', data: content, error: error.message };
    }
  }
  
  parseMarkdown(content) {
    const requests = [];
    const lines = content.split('\n');
    
    let currentRequest = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 見出しレベルの要求を検出
      if (line.match(/^#+\s+(.+)/)) {
        if (currentRequest) {
          requests.push(currentRequest);
        }
        
        currentRequest = {
          title: line.replace(/^#+\s+/, ''),
          line_number: i + 1,
          content: []
        };
      } else if (currentRequest && line) {
        currentRequest.content.push(line);
      }
    }
    
    if (currentRequest) {
      requests.push(currentRequest);
    }
    
    return { format: 'markdown', data: requests };
  }
  
  parseNaturalLanguage(content) {
    // 簡易的な自然言語解析
    const lines = content.split('\n').filter(line => line.trim());
    const requests = [];
    
    lines.forEach((line, index) => {
      // キーワードベースの要求検出
      const urgentKeywords = ['緊急', 'urgent', '急いで', 'ASAP'];
      const appKeywords = {
        calculator: ['電卓', '計算', 'calculator'],
        timer: ['時間', 'タイマー', 'timer', 'ポモドーロ'],
        money: ['お金', '家計', '収支', 'money', '財務']
      };
      
      let priority = 'medium';
      let appType = 'unknown';
      
      // 優先度判定
      if (urgentKeywords.some(keyword => line.includes(keyword))) {
        priority = 'urgent';
      }
      
      // アプリ種別判定
      for (const [type, keywords] of Object.entries(appKeywords)) {
        if (keywords.some(keyword => line.includes(keyword))) {
          appType = type;
          break;
        }
      }
      
      requests.push({
        title: line,
        line_number: index + 1,
        detected_priority: priority,
        detected_app_type: appType,
        confidence: appType !== 'unknown' ? 0.8 : 0.3
      });
    });
    
    return { format: 'natural_language', data: requests };
  }
  
  /**
   * ファイル削除時の自動復旧
   */
  async handleFileDeletion() {
    console.log('🔄 自動復旧を開始します...');
    
    try {
      // 1. 最新バックアップから復元
      await this.restoreFromBackup();
      console.log('✅ 自動復旧完了');
      
      // 2. Git履歴にも記録
      this.gitAutoCommit('Auto restore after file deletion');
      
    } catch (error) {
      console.error('❌ 自動復旧失敗:', error);
      // 緊急時は最小限のファイルを生成
      this.createEmergencyFile();
    }
  }
  
  /**
   * バックアップからの復元
   */
  async restoreFromBackup() {
    const latestBackupFile = path.join(this.backupDir, 'latest-backup.json');
    
    if (!fs.existsSync(latestBackupFile)) {
      throw new Error('バックアップファイルが見つかりません');
    }
    
    const backup = JSON.parse(fs.readFileSync(latestBackupFile, 'utf8'));
    fs.writeFileSync(this.watchFile, backup.original_content);
    
    console.log(`📁 ${backup.backup_timestamp}のバックアップから復元`);
  }
  
  /**
   * 緊急時の最小ファイル生成
   */
  createEmergencyFile() {
    const emergencyContent = `# アプリ要求リスト（緊急復旧版）

⚠️ このファイルは自動復旧により生成されました。

## 復旧方法
1. auto-backup/フォルダ内のlatest-backup.jsonを確認
2. 必要に応じて手動で要求を再追加
3. Git履歴から復元も可能

## 現在の要求
- 復旧後に要求を再追加してください
`;
    
    fs.writeFileSync(this.watchFile, emergencyContent);
    console.log('🆘 緊急ファイルを生成しました');
  }
  
  /**
   * Git自動コミット
   */
  gitAutoCommit(message) {
    const { exec } = require('child_process');
    
    exec(`git add . && git commit -m "${message} $(date)"`, (error, stdout, stderr) => {
      if (error) {
        console.log('Git commit skip (not a git repo or no changes)');
      } else {
        console.log('📚 Git自動コミット完了');
      }
    });
  }
  
  /**
   * バックアップ統計
   */
  getBackupStats() {
    const backupFiles = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup_'))
      .length;
    
    return {
      total_backups: backupFiles,
      backup_directory: this.backupDir,
      watching_file: this.watchFile,
      last_check: new Date().toISOString()
    };
  }
}

export default FlexibleBackupSystem;