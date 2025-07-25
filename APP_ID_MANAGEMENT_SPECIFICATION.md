# アプリID管理仕様書

## 🎯 問題の概要
複数のAIが同時にアプリ開発を実行する際、異なるアプリでも同じIDが割り当てられる問題を解決する。

### 現在の問題
- 時間管理アプリ → `001` 
- お金管理アプリ → `001` (重複!)
- 複数AI並行実行時のID競合

### 目指す状態
- 時間管理アプリ → `001` (常に同じID)
- お金管理アプリ → `002` (常に同じID)
- どのAIが先に開始してもIDは固定

## 🛠️ 解決策: アプリ種別ベースID管理

### 1. アプリ種別マスター管理

#### `app-type-registry.json`
```json
{
  "registry": {
    "time-management": {
      "id": "001",
      "name": "時間管理アプリ",
      "keywords": ["時間", "タイマー", "スケジュール", "予定"],
      "created_date": "2025-01-25"
    },
    "money-management": {
      "id": "002", 
      "name": "お金管理アプリ",
      "keywords": ["お金", "家計", "収支", "財務", "予算"],
      "created_date": "2025-01-25"
    },
    "calculator": {
      "id": "003",
      "name": "電卓アプリ",
      "keywords": ["電卓", "計算", "四則演算"],
      "created_date": "2025-01-25"
    }
  },
  "next_available_id": "004",
  "last_updated": "2025-01-25 10:00:00"
}
```

### 2. ID自動割り当てフロー

#### A. 新規要求処理時
```javascript
function assignAppId(requestTitle, requestDescription) {
  // 1. キーワードマッチングで既存種別を検索
  const matchedType = findMatchingAppType(requestTitle, requestDescription);
  
  if (matchedType) {
    // 2A. 既存種別の場合 → 既存IDを使用
    return matchedType.id;
  } else {
    // 2B. 新種別の場合 → 新IDを割り当て・登録
    return registerNewAppType(requestTitle, requestDescription);
  }
}

function findMatchingAppType(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  for (const [typeKey, typeData] of Object.entries(registry)) {
    const hasKeyword = typeData.keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      return typeData;
    }
  }
  return null;
}
```

#### B. AI類似判定システム
```javascript
function aiSimilarityCheck(newRequest) {
  // Gemini/Claude APIを使用した意味的類似度判定
  const prompt = `
  新しい要求: "${newRequest.title} - ${newRequest.description}"
  
  既存アプリ種別:
  ${Object.entries(registry).map(([key, data]) => 
    `- ${data.name}: ${data.keywords.join(', ')}`
  ).join('\n')}
  
  この新要求は既存のどの種別に最も近いですか？
  類似度80%以上なら既存種別名を、そうでなければ"新種別"を回答してください。
  `;
  
  return callAIAPI(prompt);
}
```

### 3. 並行実行時の排他制御

#### ファイルロック機能
```javascript
const fs = require('fs');
const path = require('path');

class AppIdManager {
  constructor() {
    this.lockFile = 'app-id.lock';
    this.registryFile = 'app-type-registry.json';
  }
  
  async acquireLock() {
    while (fs.existsSync(this.lockFile)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    fs.writeFileSync(this.lockFile, process.pid.toString());
  }
  
  releaseLock() {
    if (fs.existsSync(this.lockFile)) {
      fs.unlinkSync(this.lockFile);
    }
  }
  
  async getUniqueAppId(request) {
    await this.acquireLock();
    try {
      const registry = this.loadRegistry();
      const appId = this.assignId(request, registry);
      this.saveRegistry(registry);
      return appId;
    } finally {
      this.releaseLock();
    }
  }
}
```

### 4. 実装方法

#### Phase 1: 基本システム
1. **app-type-registry.json作成** - アプリ種別マスター
2. **ID管理ライブラリ作成** - 排他制御付きID割り当て
3. **既存要求の種別登録** - 現在の要求を初期データに

#### Phase 2: AI判定強化
1. **キーワードマッチング強化** - より精密な類似判定
2. **AI API統合** - 意味的類似度での自動判定
3. **学習機能追加** - 判定精度の継続改善

#### Phase 3: 高度機能
1. **階層カテゴリー対応** - アプリの親子関係管理
2. **バージョン管理** - 同種別アプリの改良版管理
3. **統計・分析** - アプリ種別の人気度分析

### 5. ファイル構造

```
app-request-list/
├── app-type-registry.json       # アプリ種別マスター
├── id-management/
│   ├── app-id-manager.js        # ID管理ライブラリ
│   ├── keyword-matcher.js       # キーワードマッチング
│   └── ai-similarity.js        # AI類似度判定
├── locks/                       # ロックファイル置き場
└── logs/
    └── id-assignment.log        # ID割り当て履歴
```

### 6. 使用例

#### 新規要求追加時
```javascript
const idManager = new AppIdManager();

// 要求1: "効率的な時間管理ツール"
const timeAppId = await idManager.getUniqueAppId({
  title: "効率的な時間管理ツール",
  description: "タイマー機能付きスケジュール管理"
});
// → "001" (時間管理カテゴリーとマッチ)

// 要求2: "家計簿アプリ" 
const moneyAppId = await idManager.getUniqueAppId({
  title: "家計簿アプリ",
  description: "収支管理と予算設定"
});
// → "002" (お金管理カテゴリーとマッチ)

// 要求3: "ポモドーロタイマー"
const pomodoroId = await idManager.getUniqueAppId({
  title: "ポモドーロタイマー", 
  description: "25分集中タイマー"
});
// → "001" (時間管理カテゴリーとマッチ、同じID)
```

## 🚀 期待効果
- **ID重複完全回避**: 同じアプリ種別は常に同じID
- **並行実行安全**: 複数AI同時実行でも競合なし
- **自動分類**: 新要求の種別を自動判定・割り当て
- **管理効率化**: アプリ種別ごとの統合管理

---
*この仕様に基づいてID管理システムを実装することで、スケーラブルで安全なアプリ開発フローを実現できます*