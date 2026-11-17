# AI Implementation Rules

## 本書の範囲

本書は、Frontend（React + TypeScript）およびBackend（FastAPI／Python）
の実装をAIへ依頼する際の共通ルールを定義する。

プロジェクトの構造・責務分担は`PROJECT_ARCHITECTURE.md`を参照する。

## 基本方針

- 既存実装パターンを最優先する
- 新しい設計思想・ライブラリ・共通化を独自判断で導入しない
- 実装前に類似Feature、既存Hook、共通Componentを確認する
- 既存機能の挙動を変更しない
- 型安全性と既存規約への適合を優先する

## Feature構成

新規機能はFeature First構成に従う。

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

許可：

- レイアウト制御
- Component配置
- Feature間の表示構成

禁止：

- API呼び出し
- 業務ロジック
- Atom定義
- データ加工処理

## Component

許可：

- UI表示
- propsの受け取り
- ユーザー操作の受付
- Custom Hook呼び出し

禁止：

- APIの直接呼び出し
- `useAtom`の直接利用
- 業務ロジックの実装
- 複雑なデータ変換

## Custom Hook

Custom Hookへ以下を集約する。

- 状態管理
- API制御
- Jotai利用
- データ変換
- Effect制御
- エラーハンドリング
- Feature間連携

Fat Hook / Thin Componentを維持する。

## Jotai

基本構造：

```text
Atom
 ↓
Custom Hook
 ↓
Component
```

ルール：

- Componentから直接`useAtom`しない
- ComponentからAtomを直接参照しない
- ComponentとAtomの間にCustom Hookを置く
- Atomは原則としてFeature内で管理する
- 状態の責務を明確にし、不要なグローバル状態を作らない

## API

配置場所：

```text
features/{feature}/api/
```

ルール：

- 1エンドポイント1関数を基本とする
- API関数はHTTP通信に集中させる
- API関数へ画面状態やUIロジックを持ち込まない
- Request／Responseの型を明示する
- API DTOと画面表示用型が異なる場合はMapperで変換する

## HTTP通信

必ず共通クライアントを利用する。

```text
lib/ky.ts
```

禁止：

```text
fetch
axios
独自HTTPクライアント
```

## DataGrid

- DataGridProを利用する
- Column定義は分離する
- DataGridの状態はCustom Hook／Jotaiで管理する
- Column定義へAPI呼び出しや複雑な業務ロジックを追加しない
- 既存のFilterOperator、field定義、変換処理を優先して再利用する

## 共通UI

新規Component作成前に既存共通部品を確認する。

利用候補：

```text
PrimaryButton
SecondaryButton
ConfirmDialog
DeleteConfirmDialog
ErrorDialog
Toast
```

既存部品で要件を満たせない場合のみ、Feature固有Componentを作成する。

## TypeScript

- `any`を使用しない
- 型を明示する
- 既存型を優先して再利用する
- 型アサーションを必要最小限にする
- `null`、`undefined`、空配列などの状態を明示的に扱う
- API DTO、Domain型、ViewModelの責務を混在させない

型の配置：

```text
features/{feature}/types/
```

## スタイリング・レスポンシブ対応

- 既存のMUI／プロジェクトのスタイル方式を優先する
- 既存画面のspacing、色、Typographyを再利用する
- 固定値を追加する前に既存の定数・テーマを確認する
- レイアウト部品の途中で不自然に分割しない
- 狭幅時はComponent単位で縦並びへ切り替える
- 横方向のはみ出しや不要な横スクロールを発生させない

## Biome

- タブインデント
- ダブルクォート
- 未使用Importを残さない
- 未使用変数を残さない
- 既存のBiome設定に従う
- Biome警告を増やさない

## テスト

実装対象に応じて、以下を検証する。

- API ClientとRequest／Response Mapper
- AtomとCustom Hookの状態遷移
- debounce、Cache、非同期競合
- Loading／Empty／Error／Success表示
- Componentへ渡すprops
- DataGridのFilterOperator連携

外部ライブラリ内部の描画そのものではなく、入力props・Mapper結果・状態遷移を中心に検証する。

## 実装前チェック

実装前に以下を確認する。

- 類似Featureが存在しないか
- 既存Hookで再利用できないか
- 既存Atomで再利用できないか
- 共通Componentが利用できないか
- API配置場所が適切か
- Componentが薄く保たれているか
- 状態管理がHookへ集約されているか
- 既存DataGridのFilterOperatorやColumn定義と整合するか

## AIへの指示

既存実装パターンと本ルールを維持すること。

- Feature First構成を維持する
- Fat Hook / Thin Componentを維持する
- ComponentからAPIを直接呼び出さない
- ComponentからAtomを直接利用しない
- APIは`features/{feature}/api/`へ配置する
- HTTP通信は`lib/ky.ts`経由とする
- DataGrid状態はCustom Hook／Jotaiで管理する
- 共通部品を優先利用する
- TypeScriptの型を明示する
- Biome警告を増やさない
- 既存機能の挙動を変更しない

---

# Backend Implementation Rules

## 基本方針

- 既存のFastAPI／SQLAlchemy／Pydantic実装を最優先する
- 新しいライブラリや独自の設計方式を追加しない
- 既存APIの挙動を変更しない
- 実装前に類似Router、Dependency、ORM、共通Filter処理を確認する
- 既存部品を再利用し、重複実装を作らない

## Router

RouterはHTTP境界に限定する。

許可：

- URL・HTTPメソッド定義
- Request Model受け取り
- Dependency Injection
- Service呼び出し
- Response変換
- HTTPエラー変換

禁止：

- 複雑なSQL
- 集計ロジック
- DB製品固有処理
- 画面固有ロジック
- 複数責務の一体化

## webappとmbmmi

- Routerは`webapp/routers/api/`へ配置する
- Router登録は既存の`webapp/routers/api/__init__.py`へ追加する
- HTTP固有処理は`webapp`へ配置する
- 業務処理・Provider・計算処理は`mbmmi`へ配置する
- 既存の`mbmmi/result`のORM・Path・DB部品を再定義しない
- `webapp/services`を独自に新設しない

## Dependency Injection

- DB接続をRouter内で直接生成しない
- 既存Dependencyを優先利用する
- Result DBは既存の`get_images_db()`および`ResultPath`を利用する
- 接続の生成・解放方式を既存実装に合わせる
- 読み取り処理では既存のReadOnly／Immutable方式を確認する

## SQLAlchemy・Filter

- ORM Modelを再定義しない
- SQL文字列へ値を連結しない
- SQLAlchemyのbind parameterを利用する
- 既存の`FilterItem`、`FilterModel`、`generate_filter_comps()`を再利用する
- Frontend fieldとDB fieldの変換を明示する
- 未知field・未知operatorを黙って無視しない
- 変換不能な入力はHTTP 422として明示的に拒否する
- DB依存処理はProvider／Adapterへ閉じ込める

## Request・Response

- Request／Response Modelを明示する
- 入力値の型、有限性、範囲、相互関係を検証する
- 内部ORM Modelをそのまま外部Responseに使用しない
- API DTOと内部型を必要に応じて分離する
- Response契約を既存APIに合わせて明示する

## エラー処理

新規APIでは、次のHTTP分類を基本とする。

```text
入力不正・型不正       → 422
field・operator不正    → 422
対象Resource不存在     → 404
認証失敗               → 401
予期しない内部障害     → 500
```

- 原則としてFastAPIの`HTTPException`を利用する
- エラー本文は原則`{"detail": ...}`とする
- SQL文やスタックトレースをResponseへ含めない
- エラーを成功形Responseへ変換して隠蔽しない
- 既存API全体のエラー形式は変更しない

## ログ

- 予期しない例外は既存Loggerへ記録する
- Result名、対象field、処理種別など特定に必要な情報を記録する
- SQL全文、秘密情報、FILTERS具体値は原則記録しない
- 正常な空結果と処理障害を区別する
- 広範囲な例外捕捉で失敗を隠蔽しない

## 非同期・負荷処理

- 既存Routerの同期／非同期方式を確認して合わせる
- 同期DB処理を無条件にasync関数内へ追加しない
- CPU負荷の高い処理を無制御で実行しない
- スレッド実行が必要な場合は既存の`anyio`方式を確認する
- 独自ExecutorやグローバルThreadPoolを勝手に追加しない

## 型・コードスタイル

- 型注釈を付ける
- 既存の`Annotated` Dependency方式を優先する
- Import順序・命名・module構成を既存実装に合わせる
- 不要な`Any`や型キャストを追加しない
- 未使用Import・未使用変数を残さない
- 既存のFormatter／Linter設定に従う

## Backendテスト

最低限、以下をテストする。

- Request入力検証
- field／operator変換
- FilterItemからSQL条件への変換
- ProviderのDB取得
- DB非依存計算
- 空結果
- NULL／NaN／Infinity
- DBエラー
- 422／404／401／500
- Responseに内部情報が含まれないこと

テスト対象の定義と物理ファイル配置を分離する。
物理配置は既存のpytest構成に合わせて決定する。