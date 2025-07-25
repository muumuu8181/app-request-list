# 🚀 START HERE - AI開発者向けガイド

## 📋 最重要ファイル（必読）

### 1. **app-requests.md** ⭐ メインタスク
**現在のアプリ開発要求一覧 - ここから作業開始**

### 2. **README.md** ⭐ 基本ルール  
**ワークフロー・優先度・作業継続方法**

## 🚨 緊急時のみ参照

### 3. **EMERGENCY_CONFLICT_RESOLUTION.md**
**ID重複時の対応手順（デプロイ前チェック必須）**

## 📁 フォルダ構成

```
app-request-list/
├── 📄 app-requests.md          ← ⭐ メインタスク
├── 📄 README.md                ← ⭐ 基本ルール  
├── 🚨 EMERGENCY_CONFLICT_RESOLUTION.md  ← 緊急時のみ
│
├── verification/               ← 検証用コード
│   ├── flexible-backup-system.js
│   └── REQUIREMENTS.md
│
├── docs/ (以下参考資料)
│   ├── AI_LEARNING_SPECIFICATION.md
│   ├── APP_ID_MANAGEMENT_SPECIFICATION.md
│   └── FLEXIBLE_ID_MANAGEMENT.md
│
└── system/ (システムファイル)
    ├── app-type-registry.json
    ├── backup-system.js
    └── id-management/
```

## 🎯 作業フロー

### Step 1: タスク確認
```bash
1. app-requests.md を開く
2. "最優先" または先頭のタスクを確認
3. 必要なファイルパスをメモ
```

### Step 2: 開発実行
```bash
1. 指定されたverification/フォルダ内のコードを確認
2. REQUIREMENTS.mdで詳細仕様を理解
3. アプリ作成開始
```

### Step 3: デプロイ前チェック
```bash
1. GitHub Pages URLで既存アプリ確認
2. ID重複時はEMERGENCY_CONFLICT_RESOLUTION.md参照
3. 問題なければデプロイ実行
```

## 🏆 最重要：優先ルールシステム

**全ての判断は優先度レベル1-10で決定されます**
- **レベル10**: 絶対ルール（永続的保護）
- **レベル7**: 構造ルール（ドキュメント分離）
- **レベル1**: 参考程度

詳細: [PRIORITY_RULES.md](PRIORITY_RULES.md)

**迷ったら高いレベルのルールに従ってください**

## ⚠️ 注意事項

### 読む必要のないファイル
- `AI_LEARNING_SPECIFICATION.md` (将来の改善計画)
- `APP_ID_MANAGEMENT_SPECIFICATION.md` (システム設計書)  
- `FLEXIBLE_ID_MANAGEMENT.md` (技術仕様書)
- `backup-system.js` (システムツール)
- `app-type-registry.json` (設定ファイル)

### 迷った時の判断基準
1. **app-requests.md** → 作業内容
2. **README.md** → 基本ルール
3. **EMERGENCY_CONFLICT_RESOLUTION.md** → 問題発生時のみ
4. **その他** → 無視してOK

---

## 📢 重要メッセージ

**「app-requests.mdだけ見れば作業できる」**

他のファイルは参考資料です。混乱したらこのファイルに戻ってください。