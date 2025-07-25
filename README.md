# アプリ要求リスト

AI自動化ワークフローシステム用のアプリケーション要求管理リポジトリです。

## 使用方法

### 新しいアプリを追加
`app-requests.json`ファイルに以下の形式で追加：

```json
{
  "id": "unique-app-id",
  "title": "アプリ名",
  "priority": "high|medium|low|最優先|urgent|ASAP",
  "requirements": [
    "要件1",
    "要件2" 
  ],
  "tech_preferences": ["HTML", "JavaScript", "CSS"],
  "estimated_complexity": "low|medium|high",
  "created_date": "YYYY-MM-DD",
  "notes": "補足情報"
}
```

### 優先度指定
- **最優先**: 他を差し置いて最初に処理
- **urgent**: 緊急対応
- **high**: 高優先度
- **medium**: 通常優先度
- **low**: 低優先度

### 自動処理
AIが以下の順序で処理：
1. 優先度キーワード検索（最優先→urgent→高優先度→ASAP）
2. 見つからない場合は未完了の最上位項目
3. 1プロジェクト完了まで実行
4. 完了後は次の項目へ自動進行

## 現在のリクエスト
- 📋 **総数**: 1件
- ✅ **完了**: 0件  
- 🔄 **処理中**: 0件
- ⏳ **待機中**: 1件

---
*このリポジトリはAI自動化ワークフローシステムによって監視されています*