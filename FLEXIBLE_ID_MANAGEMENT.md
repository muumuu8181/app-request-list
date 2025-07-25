# 柔軟なID管理システム設計

## 🎯 課題
現在のJS固定方式では以下の問題がある：
- 書き方の自由度が制限される
- AIによるファイル削除リスク
- 復旧困難な障害発生の可能性

## 💡 解決策: ハイブリッド方式

### 1. 多層バックアップシステム

#### A. メインデータ（柔軟）
```markdown
# app-requests.md
ユーザーが自由に書ける形式を維持
```

#### B. 自動バックアップ（堅牢）
```json
// auto-backup/app-requests-backup.json
{
  "backup_timestamp": "2025-01-25 10:00:00",
  "original_md5": "abc123...",
  "requests": [
    {
      "detected_title": "格好良い電卓",
      "assigned_id": "001",
      "source_line": 3,
      "backup_date": "2025-01-25"
    }
  ]
}
```

#### C. ID履歴（永続化）
```json
// id-history/permanent-registry.json  
{
  "id_assignments": {
    "001": {
      "app_type": "calculator",
      "first_assigned": "2025-01-25",
      "keywords": ["電卓", "計算"],
      "assignment_history": [
        {
          "date": "2025-01-25",
          "title": "格好良い電卓",
          "context": "四則演算機能"
        }
      ]
    }
  }
}
```

### 2. 自動回復システム

#### A. リアルタイム監視
```javascript
// file-watcher.js
import chokidar from 'chokidar';

const watcher = chokidar.watch('app-requests.md');

watcher.on('change', async (path) => {
  // 1. 変更検知
  // 2. 自動バックアップ作成
  // 3. ID整合性チェック
  // 4. 必要に応じて復旧提案
});

watcher.on('unlink', async (path) => {
  console.log('⚠️  ファイル削除検知！自動復旧を開始...');
  await autoRestore();
});
```

#### B. 自動復旧機能
```javascript
async function autoRestore() {
  // 1. 最新バックアップから復元
  // 2. Git履歴から復元
  // 3. ID履歴から最小限のファイル再生成
  
  const restoredContent = await generateFromBackup();
  fs.writeFileSync('app-requests.md', restoredContent);
  console.log('✅ ファイル復旧完了');
}
```

### 3. 柔軟性と堅牢性の両立

#### A. フォーマット自動検出
```javascript
function detectRequestFormat(content) {
  // Markdown形式、JSON形式、テキスト形式を自動判別
  // ユーザーの書き方に合わせて自動適応
  
  if (content.includes('```json')) return 'json-in-md';
  if (content.includes('##') || content.includes('#')) return 'markdown';
  if (content.startsWith('[') || content.startsWith('{')) return 'json';
  return 'freetext';
}
```

#### B. 複数パーサー対応
```javascript
class FlexibleParser {
  parse(content) {
    const format = this.detectFormat(content);
    
    switch(format) {
      case 'markdown': return this.parseMarkdown(content);
      case 'json': return this.parseJSON(content);
      case 'freetext': return this.parseNaturalLanguage(content);
    }
  }
  
  parseNaturalLanguage(text) {
    // AI解析で要求を抽出
    // "電卓作って" → calculator, priority: medium
    // "緊急で家計簿" → money-management, priority: urgent
  }
}
```

### 4. 実装段階

#### Phase 1: 安全網構築
```bash
# 1. ファイル監視システム
npm install chokidar

# 2. 自動バックアップ
node backup-system.js

# 3. Git自動コミット
git add . && git commit -m "Auto backup $(date)"
```

#### Phase 2: 柔軟性向上
```javascript
// 1. 複数形式対応
// 2. 自然言語解析
// 3. AI支援による要求抽出
```

#### Phase 3: 自動回復
```javascript
// 1. リアルタイム復旧
// 2. 履歴ベース復元
// 3. ユーザー通知システム
```

### 5. ユーザー側のメリット

#### ✅ 自由度維持
- **どんな書き方でもOK**: markdown、JSON、自然言語
- **気軽に編集**: 厳密な形式を覚える必要なし
- **段階的学習**: 使いながら最適な書き方を発見

#### ✅ 安全性確保
- **自動バックアップ**: 3重バックアップで安心
- **瞬間復旧**: ファイル削除されても即座に復元
- **履歴保持**: 過去の変更も全て記録

#### ✅ AI支援
- **自動解析**: 書いた内容からAIが要求を理解
- **提案機能**: より効率的な書き方を提案
- **エラー修正**: 不整合があれば自動修正

## 🚀 移行計画

### 即時実装可能
1. **ファイル監視**: chokidarで削除検知
2. **定期バックアップ**: cronでJSON形式保存
3. **Git自動コミット**: 変更の度に履歴保存

### 段階的改善
1. **柔軟パーサー**: 複数形式対応
2. **AI解析**: 自然言語からの要求抽出
3. **自動回復**: 高度な復旧機能

---

この方式なら、**書き方の自由度を保ちつつ、堅牢性も確保**できます。