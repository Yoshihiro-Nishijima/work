# Project Architecture

## 本書の範囲

本書は、Frontend（React + TypeScript）とBackend（FastAPI／Python）の
アーキテクチャ、責務分担、主要な依存関係を定義する。

AIが実装する際の具体的な禁止事項・作法は、
`AI_IMPLEMENTATION_RULES.md`で定義する。

## 基本方針

本プロジェクトはFeature First構成を採用する。

機能単位でUI、状態管理、APIアクセス、型、ユーティリティを分離し、責務を明確にする。

```text
Layout
 ↓
Component
 ↓
Custom Hook
 ├─ Jotai
 └─ Feature API
      ↓
    lib/ky.ts
```

## Feature構成

新規機能は`features`配下に配置する。

```text
features/
 └─ feature-name/
     ├─ api/
     ├─ components/
     ├─ hooks/
     ├─ layouts/
     ├─ types/
     └─ utils/
```

機能固有の処理を、無関係なFeatureや共通領域へ配置しない。

## Layout

Layoutは画面全体またはFeature内の構成を担当する。

主な責務：

- Componentの配置
- 画面領域の構成
- レイアウト制御
- Feature間の表示構成

Layoutは業務ロジック、API呼び出し、Atom定義を持たない。

## Component

ComponentはUI表示とユーザー操作の受付を担当する。

主な責務：

- 描画
- propsの受け取り
- ユーザー操作の受付
- Custom Hookの呼び出し

Componentは可能な限り薄く保ち、業務ロジック・API呼び出し・Atom直接参照を持たない。

## Custom Hook

Custom HookはFeatureの状態・操作・業務ロジックの中心となる。

主な責務：

- 状態の取得・更新
- Atomの利用
- API呼び出しの制御
- データ変換
- Effect制御
- Feature間の連携
- エラー状態の管理

本プロジェクトでは、Fat Hook / Thin Componentの思想を採用する。

## 状態管理

状態管理にはJotaiを利用する。

基本構造：

```text
Atom
 ↓
Custom Hook
 ↓
Component
```

ComponentはAtomを直接参照せず、Custom Hook経由で状態を利用する。

Atomは原則としてFeature内で管理する。

## APIアクセス

APIアクセスはFeature単位で管理する。

```text
Component
 ↓
Custom Hook
 ↓
features/{feature}/api
 ↓
lib/ky.ts
 ↓
Backend
```

Feature APIはHTTP通信の窓口とし、画面状態やUI操作を直接管理しない。

## HTTP通信

HTTP通信には共通クライアント`lib/ky.ts`を利用する。

共通クライアントで管理する内容：

- Base URL
- Cookie認証
- 401ハンドリング
- Retry設定

## DataGrid

一覧画面にはDataGridProを利用する。

- Column定義はComponentまたは専用定義へ分離する
- DataGridの状態はCustom Hook／Jotaiで管理する
- API呼び出しや業務ロジックをColumn定義へ集約しない

```text
DataGrid
 ↓
Custom Hook
 ↓
Jotai / Feature API
```

## 共通UI

複数Featureで利用可能なUI部品は`components/`配下へ集約する。

例：

- PrimaryButton
- SecondaryButton
- ConfirmDialog
- DeleteConfirmDialog
- ErrorDialog
- Toast

Feature固有のUIを、早期に共通部品へ抽出しない。

---

# Backend Architecture

## Backendの位置付け

BackendはFastAPIをHTTP層とし、`webapp`と`mbmmi`で責務を分担する。

## Backend全体構成

```text
FastAPI Router
 ↓
Service
 ↓
Provider / Adapter
 ↓
Database
```

DB非依存の計算処理はProvider／Adapterから分離する。

## webapp

`webapp`はWebアプリケーション層を担当する。

主な配置対象：

- FastAPI Router
- Router登録
- Dependency Injection
- HTTP Request／Response変換
- 認証・HTTPエラー処理

既存構成では、リソース単位のRouterを以下へ配置する。

```text
webapp/routers/api/<resource>.py
```

Routerは`webapp/routers/api/__init__.py`で集約する。

## mbmmi

`mbmmi`は業務ドメイン・共通ライブラリ層を担当する。

主な配置対象：

- ORM Model
- Result固有のPath・DB部品
- 共通Filter Model
- DB Provider／Adapter
- 業務Service
- DB非依存の計算処理

既存のResult／Defect ORM、ResultPath、DB接続部品は再利用し、機能ごとに再定義しない。

## DB接続

DB接続は既存のDependency Injectionを利用する。

```text
Router
 ↓
webapp.dependencies
 ↓
SQLAlchemy Connection
```

Result配下のDBは既存の`ResultPath`および`get_images_db()`を利用する。

読み取り処理では、既存のReadOnly／Immutable接続方式を優先する。

## APIとドメイン処理の分離

RouterはHTTP境界に限定する。

Service／Providerへ分離する処理：

- 入力検証以外の業務処理
- SQL組み立て
- DBデータ取得
- 集計・計算
- DB製品固有処理

## Backendテスト

Backendのテスト対象は、次の責務単位で分離する。

- Request／Response Model
- Registry・入力変換
- Service
- Provider／Adapter
- DB非依存計算
- Router／APIエラー

テストファイルの物理配置は、既存のpytest実行構成を確認して決定する。