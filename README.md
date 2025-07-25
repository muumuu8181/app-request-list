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

### 作業継続・確認
- **途中停止時**: 「y」で作業継続
- **完了時**: GitHub Pages URLをブラウザで確認
- **Android Tablet**: open-termuxでブラウザ起動可能

### 🚨 緊急対応（重要）
**デプロイ前に必ずID衝突チェックを実行**
- 既存アプリとIDが重複していないか確認
- 衝突時は新しいIDまたは名前変更で回避
- 詳細: [緊急ID衝突回避ワークフロー](EMERGENCY_CONFLICT_RESOLUTION.md)

## 現在のリクエスト
- 📋 **総数**: 1件
- ✅ **完了**: 0件  
- 🔄 **処理中**: 0件
- ⏳ **待機中**: 1件

## 📚 関連ドキュメント
- [🚀 **START_HERE.md**](START_HERE.md) - **AI開発者向けガイド（迷った時はここ）**
- [🚨緊急ID衝突回避ワークフロー](EMERGENCY_CONFLICT_RESOLUTION.md) - ID重複時の緊急対応手順

### 参考資料（通常は不要）
- [AI学習・改善機能仕様書](docs/AI_LEARNING_SPECIFICATION.md) - 継続的学習・改善メカニズム
- [アプリID管理仕様書](docs/APP_ID_MANAGEMENT_SPECIFICATION.md) - 複数AI並行実行時のID重複防止
- [柔軟なID管理システム](docs/FLEXIBLE_ID_MANAGEMENT.md) - 自由度と堅牢性の両立

---
*このリポジトリはAI自動化ワークフローシステムによって監視されています*