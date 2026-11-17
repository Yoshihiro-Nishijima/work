# Analysis Viewer版 Histogram 詳細設計書（Draft）

## 1. 文書の位置付け

本書は、Analysis Viewerの絞り込み条件エリアにおけるHistogram機能について、
方針資料・改修ポイント資料・共有された既存ソースを基に整理した詳細設計ドラフトである。

本書では、Histogram初期実装の構成、責務、状態、条件連鎖、Snapshot、Provider境界を扱う。
Categories、主Filters、Wafer Map、Defect Listとの実連携仕様は後続工程で定義する。

## 2. 前提資料と既存実装

- Analysis Viewer ヒストグラム機能 方針整理（Draft）
- Analysis Viewer版Histogram 改修ポイント整理
- IntegratedViewer版 Frontend／Backend
- モック版 Web Tools
- AI実装ルール
- プロジェクトアーキテクチャ

既存IntegratedViewer版には、以下の再利用候補がある。

- Histogram描画
- カテゴリ別表示
- Tooltip
- Loading／Empty／Error表示
- Providerインターフェース
- Abort制御
- リクエスト世代管理
- Range取得のQuery Serviceパターン

ただし、IntegratedViewer版は単一のGrid Filter条件を前提としており、
Analysis Viewer版で必要な行順・先行Range条件・Snapshot識別は新設する。

## 3. 初期実装の範囲

### 3.1 対象

- `ValueRangeFilterList`
- `ValueRangeFilterItem`
- `DefectHistogramItem`
- `RangeSlider`
- 初期6行
- 行追加・削除・全削除・並べ替え
- 項目変更
- RangeSliderによる条件設定
- 行順によるHistogram条件連鎖
- Backend側Histogram Snapshot
- Backend Histogram Provider
- Loading／Empty／Error／未設定状態
- IntegratedViewer暫定Host

### 3.2 初期実装で扱わないもの

- Categoriesの選択UI
- 主Filtersの入力UI
- Wafer Mapへの実条件反映
- Defect Listへの実条件反映
- DuckDB WASM Provider
- Analysis Viewer正式Layoutへの組み込み

ただし、将来接続できる条件モデル、Atom、Provider境界は初期設計から用意する。

## 4. 画面・コンポーネント構成

```text
Analysis Viewer
└─ FilterCondition
   └─ ValueRangeFilterList
      ├─ ValueRangeFilterItem
      │  ├─ 項目選択
      │  ├─ DefectHistogramItem
      │  ├─ カテゴリ凡例
      │  └─ RangeSlider
      └─ ...
```

### 4.1 ValueRangeFilterList

責務：

- 順序付き行一覧の保持・表示
- 初期6行の生成
- 行追加・削除・全削除
- 行並べ替え
- 行順に基づく条件連鎖の管理
- 変更行以降の再集計制御
- 全行範囲リセット

### 4.2 ValueRangeFilterItem

責務：

- 1行の表示構成
- 項目選択
- 行削除操作
- 自行のRange状態の保持・更新
- `DefectHistogramItem`と`RangeSlider`へのProps受け渡し
- 行単位の状態表示

行自身のRangeSlider条件は、後続行の母集団へ適用する。

### 4.3 DefectHistogramItem

責務：

- Histogram描画
- カテゴリ別積み上げ表示
- 凡例
- Tooltip
- Loading／Empty／Error表示
- 集計結果の表示

責務外：

- 行一覧管理
- Atomの直接利用
- APIの直接呼び出し
- 行順による条件合成
- Range条件の業務ロジック

### 4.4 RangeSlider

責務：

- 下限・上限の入力
- Slider値の表示
- 下限・上限の交差防止
- UI操作イベントの通知

条件適用や後続行再集計は、親Hook／List側が担当する。

## 5. Histogram連鎖

### 5.1 基本規則

行NのHistogram母集団は、以下とする。

```text
基準Snapshot
+ 主Filters条件（初期実装では空）
+ Categories条件（初期実装では空）
+ 行Nより前の有効なRange条件
```

行N自身のRangeSlider条件は、行N自身のHistogramには適用しない。

```text
Row 1: Size X = 10..20
Row 2: Gray
Row 3: Area
```

- Row 1：基準母集団でSize Xを集計
- Row 2：Size X=10..20を適用してGrayを集計
- Row 3：Size X=10..20とRow 2のRange条件を適用してAreaを集計

Slider変更は、その行より後ろに存在する全行へ適用される。
後から追加された行にも、追加時点の先行行条件として適用される。

### 5.2 有効Range条件

全範囲のSliderは条件なしとして扱い、Queryへ含めない。

```text
RangeCondition
├─ field
├─ lower
└─ upper
```

条件は下限・上限を含む。

```text
field >= lower AND field <= upper
```

同一項目の複数行選択は許可する。

## 6. 行操作と再集計

| 操作 | 状態変更 | 再集計対象 |
|---|---|---|
| Slider変更 | 自行Rangeを更新 | 変更行より後続の全行を順次Query |
| 項目変更 | fieldを更新、Rangeはモック版に合わせて再初期化 | 変更行と後続の全行 |
| 行削除 | 行を削除 | 削除位置以降の行 |
| 行追加 | 未設定行を追加 | 項目選択後、その行と必要な後続行 |
| 並べ替え | 行順を更新 | 初期実装では全行を順次Query |
| REMOVE ALL | 全行削除 | 行なし |
| RESET ALL RANGES | Rangeのみ全範囲化 | 影響を受ける行 |

行追加時は未設定状態とし、項目選択前のHistogram集計は実行しない。

## 7. 状態設計

### 7.1 行状態

```text
ValueRangeFilterItemState
├─ rowId
├─ field: HistogramField | null
├─ range
├─ rangeCondition
├─ histogramResult
├─ status
├─ error
└─ requestGeneration
```

状態例：

```text
unconfigured
loading
success
empty
error
```

### 7.2 List状態

```text
ValueRangeFilterListState
├─ rows
├─ rowOrder
├─ resultIdentity
├─ snapshotIdentity
└─ conditionVersion
```

UI状態・API状態・世代情報はCustom Hookへ集約し、ComponentからAtomを直接参照しない。

## 8. 共通条件と機能別Query

条件の意味を共通化し、機能ごとのQueryは分離する。

```text
CommonFilterCondition
├─ mainFilterConditions
├─ categoryConditions
└─ valueRangeConditions
        ↓
機能別Query変換
├─ HistogramQuery
├─ WaferMapQuery（後続）
└─ DefectListQuery（後続）
```

各機能のQuery形式を同一型にする必要はない。

Histogramでは、対象行より前の条件を次の名称で扱う。

```text
priorRangeConditions
```

`priorRangeConditions`は、ReactやPythonの標準用語ではなく、
Analysis Viewerの行連鎖を表す設計上の名称である。

## 9. Snapshot設計

### 9.1 方針

初期実装では、Frontendへ欠陥データ全体を渡さず、
Backend側にHistogram専用の縮小Snapshotを保持する。

Snapshotには、Histogramで選択可能な全数値項目と、
カテゴリ表示に必要な`defectClass`を保持する。

```text
Histogram Snapshot
├─ Analysis Viewerで選択可能な全Histogram数値項目
└─ defectClass
```

初期6項目はUIの初期行であり、Snapshot列数を意味しない。

SnapshotはFeature単位で管理する。初期Histogram実装では
`HistogramSnapshot`のみを作成し、Defect ListやWafer MapのSnapshotは
各Featureの実装時に必要性を判断する。

```text
ResultIdentity
├─ HistogramSnapshot
├─ DefectListSnapshot（後続）
└─ WaferMapSnapshot（後続）
```

各FeatureのSnapshotは、同じResultを基準にしても、実体・`snapshotId`・
ライフサイクルを共有しない。

ただし、各Featureが同一時点のResultデータを利用する必要があるため、
Snapshotの生成単位とデータ世代は共通化する。FeatureごとのSnapshotは、
共通の`sourceFingerprint`（および必要に応じて`sourceGeneration`）に紐づける。
ここでいう「同一時点」は、Snapshotの作成完了時刻を一致させることではなく、
同一のResultデータ世代を参照することを意味する。

```text
AnalysisViewerSnapshotSet
├─ resultIdentity
├─ sourceFingerprint
├─ sourceGeneration
├─ HistogramSnapshot
├─ DefectListSnapshot（後続）
└─ WaferMapSnapshot（後続）
```

各Featureを同時に使用する場合は、共通の`AnalysisViewerSnapshotSet`を
解決してから、各FeatureのSnapshotをその世代に対して作成・取得する。
初期Histogram実装ではHistogram Snapshotだけを作成し、後続Feature追加時に
同じ世代を使用できる境界を残す。

### 9.2 Snapshot保持方式の推奨

初期実装方式は、一時SQLiteファイルを推奨する。

理由：

- DB定義変更が不要
- 既存のSQLite／SQLAlchemy構成を利用できる
- Pythonオブジェクトによる全件保持を避けられる
- 複数Workerで共有しやすい
- 1000万件規模でも処理時間を許容して継続できる可能性がある

Pythonメモリ方式は、Worker間共有・メモリ使用量・再起動時消失の問題があるため、
初期方式としては採用優先度を下げる。

### 9.3 Snapshot識別と共有

Resultを識別する情報と、Snapshotの世代を分離する。

```text
ResultIdentity
├─ device
├─ name
└─ path

HistogramSnapshotIdentity
├─ snapshotId（Backend発行）
├─ resultIdentity
├─ sourceFingerprint
└─ createdAt
```

同じResultと同じデータ世代を参照するHistogramSnapshotは、
複数のAnalysis Viewerで共有可能とする。

- Viewerごとの行順・Slider範囲は共有しない
- 1つのViewer終了で共有Snapshotを直ちに削除しない
- Snapshotは作成後に変更しない
- Resultの更新検知または明示的再読み込みで新しい世代を作成する
- `sourceFingerprint`にはDB更新時刻・サイズなどを候補とする

`snapshotId`はBackendが発行する。FrontendはResultIdentityを指定して
Snapshotを要求し、返されたSnapshotIdentityを以後のHistogram Queryに使用する。

### 9.4 Snapshotライフサイクル

```text
Analysis Viewer初期化
  ↓
必要列をResult DBからSnapshot SQLiteへコピー
  ↓
BackendがSnapshotIdentityを発行
  ↓
行操作ではSnapshotを再利用
  ↓
Result変更・再初期化・明示再読み込みで破棄・再作成
```

Snapshot作成中は、Listと各行をLoading表示し、Slider、行追加・削除、
並べ替え、再読み込みなどのデータ依存操作を無効化する。

Snapshot不存在または期限切れでHistogram Queryが404になった場合は、
FrontendからのSnapshot再作成と同一Queryの再実行を1回だけ許可する。
再試行後も失敗した場合は無限再試行せず、Error状態とする。

### 9.5 Snapshot管理境界

```text
SnapshotIdentity
  └─ snapshotId、Result識別、生成時刻

SnapshotStore
  └─ 作成・取得・破棄・期限切れ cleanup
```

同一Result・同一データ世代に対するSnapshot作成の重複を抑制する。
Snapshotの具体的な保存先、TTL、参照中Snapshotの削除条件、
起動時cleanupは実装前に確定する。

### 9.6 TTL

既存Backendには、Sessionに対する6時間の有効期限と、
アクセス時の期限延長・生成時の期限切れCleanupがある。
一方、一時DatasetのCleanupは起動時処理であり、
汎用的な定期TTL Cleanupの仕組みではない。

TTLはFeatureごとに個別設定せず、Analysis Viewer共通の設定として管理する。
初期値は暫定的に6時間とし、後から設定変更できるようにする。

```text
ANALYSIS_VIEWER_SNAPSHOT_IDLE_TTL_SEC = 21600
```

実際の期限判定と`lastAccessedAt`はFeatureごとのSnapshot単位で保持する。
これにより、共通TTLを使いながら、Histogram・Defect List・Wafer Mapの
Snapshotを独立してCleanupできる。

```text
Analysis Viewer共通設定
  └─ snapshotIdleTtl

FeatureごとのSnapshot
  ├─ createdAt
  ├─ lastAccessedAt
  └─ expiresAt
```

同一Viewerで複数Featureを利用する場合の世代整合はTTLではなく、
`AnalysisViewerSnapshotSet`の`sourceFingerprint`／`sourceGeneration`で
保証する。あるFeatureのSnapshotに対するアクセスだけで、未使用の他Feature
Snapshotまで延命するかは別途決定する。初期実装では、参照されたSnapshot
のみを延命する。

Histogram Snapshotでは、次のIdle TTLを採用する。

```text
最終参照時刻 + 6時間 < 現在時刻
  → 期限切れ
  → Cleanup対象
```

最終参照時刻は、Snapshot作成、作成Progress確認、Histogram取得時に更新する。
Viewer単位ではなく同一Result・同一データ世代で共有するため、
1つのViewer終了を削除契機にはしない。

定期Cleanupの実行間隔は実装時に決定する。少なくともBackend起動時の残存Snapshot Cleanupと、
Backend稼働中の定期Cleanupを用意する。

## 10. QueryとProvider

### 10.1 HistogramQuery

```text
HistogramQuery
├─ resultIdentity
├─ histogramSnapshotIdentity
├─ field
├─ priorRangeConditions（画面上の上から順）
└─ baseConditions（初期実装では空）
```

`priorRangeConditions`は、対象行より前のValueRangeFilterItemに
設定された有効なRange条件を、画面上の上から順に並べた配列である。
全範囲のSliderは配列へ含めない。

### 10.2 Provider境界

```text
HistogramProvider
├─ BackendHistogramProvider（初期実装）
└─ DuckDBWasmHistogramProvider（将来候補）
```

React側の行管理・条件生成・表示Componentは、集計方式へ直接依存しない。

### 10.3 Backend処理

```text
Router
  ↓
HistogramService
  ├─ SnapshotService / SnapshotStore
  ├─ applyPriorRangeConditions
  └─ calculateHistogram
```

RouterはHTTP境界に限定し、SQL・条件適用・集計は`mbmmi`側へ配置する。

### 10.4 APIの分離

Snapshot作成とHistogram集計は別のAPI責務とする。

```text
Snapshot API
  └─ ResultIdentityからHistogramSnapshotを作成または取得

Histogram API
  └─ histogramSnapshotId + field + priorRangeConditionsで集計
```

Slider変更、項目変更、行削除、並べ替えではSnapshot APIを再実行せず、
同じ`histogramSnapshotId`を使用してHistogram APIを呼び出す。

Snapshot作成APIは、既存Dataset JobのAPI粒度を踏襲する。

```text
POST /histogram-snapshots
  → snapshotJobId

GET /histogram-snapshots/{snapshotJobId}/progress
  → progress、status、error、snapshotIdentity

POST /histogram-snapshots/{snapshotJobId}/cancel
  → 作成キャンセル
```

Snapshotは作成後に変更しないため、`PUT`／`PATCH`による更新APIは設けない。
明示的な再読み込みは、新しいSnapshot作成Jobを開始する。
通常の削除はTTL Cleanupが担当し、明示的な削除APIは必要性を確認して追加する。

## 11. UI操作と集計タイミング

IntegratedViewer版には、以下の仕組みがある。

- Slider移動中の遅延実行
- 約180msのデバウンス
- 操作確定時の即時実行
- AbortController
- リクエスト世代管理
- 古いResponseの破棄

Analysis Viewer版では、このパターンを行連鎖へ拡張する。

```text
Slider移動
  ↓
自行の表示状態を即時更新
  ↓
デバウンスまたは確定イベント
  ↓
変更行より後続のHistogram APIを行単位で順次呼び出し
```

UI状態更新とBackend集計要求を分離し、Slider操作中の過剰なリクエストを抑制する。

初期実装では、ValueRangeFilterListが操作内容から再集計対象を決定し、
共通のHistogramProviderへQueryを渡す。Providerの内部実装は行単位とし、
将来必要になった場合に一括Queryへ最適化できる境界を残す。

```text
ValueRangeFilterList
  └─ 再集計対象を決定
       ↓
HistogramProvider
  └─ 行ごとのHistogram Queryを順次実行
```

## 12. Loading／Empty／Error

初期設計では、Snapshot取得と行集計を分けて扱う。

- Snapshot取得中：List全体のLoading
- Snapshot取得失敗：List全体のError
- 行Histogram集計中：該当行のLoading
- 数値データなし：該当行のEmpty
- 行集計失敗：該当行のError

行単位のError発生時に、他行の表示を継続するかは詳細設計で確定する。

## 13. 暫定Host

正式Analysis Viewer完成前は、IntegratedViewerにPreview用Hostを配置する。

```text
AnalysisViewerHistogramFeature
├─ AnalysisViewer正式Host
└─ IntegratedViewer暫定PreviewHost
```

暫定HostはAnalysis Viewer版Featureを呼び出すだけとし、
IntegratedViewer版のDataGrid Filter Operator仕様は変更しない。

確認対象：

- 初期6行
- 未設定行
- 行操作
- 項目変更
- Slider連鎖
- Loading／Empty／Error
- Snapshot更新
- Atomへの条件出力境界

## 14. 現時点の確定・暫定・保留

### 14.1 確定

- Analysis Viewerは独立Feature／Layout
- 初期6行を表示
- 追加行は未設定
- 同一項目の重複を許可
- 行順を条件適用順とする
- 自行Rangeは自行Histogramへ適用しない
- 先行Rangeは後続Histogramへ適用する
- Result変更等でSnapshotを更新する
- 初期ProviderはBackend
- DuckDB WASMは将来候補
- SnapshotはHistogram対象列に限定する
- `defectClass`をカテゴリ表示用に保持する
- 初期Snapshot方式は一時SQLiteを推奨する
- SnapshotはFeature単位で管理する
- 同一Result・同一データ世代のHistogramSnapshotは複数Viewerで共有する
- Snapshot IDはBackendが発行する
- Snapshot APIとHistogram APIは分離する
- Snapshot作成はチャンク取得を前提とする
- Histogramは行単位・上から順の順次Queryとする
- Snapshot再作成の自動リトライは1回に制限する
- SnapshotのIdle TTLは最終参照から6時間とする
- TTLはAnalysis Viewer共通設定として管理し、後から変更可能とする
- 複数Featureのデータ世代は`sourceFingerprint`／`sourceGeneration`で揃える
- Snapshot作成APIは非同期Job／Progress／Cancelの既存パターンを踏襲する

### 14.2 暫定判断

- 並べ替え時は初期実装で全行再集計
- 項目変更時はモック版に合わせてRangeを再初期化
- SnapshotはViewer単位ではなく、同一Result・同一データ世代で共有
- API要求はデバウンスと確定イベントを組み合わせる
- Snapshot作成中はデータ依存操作を無効化し、Loadingを表示する

### 14.3 保留

- Snapshotファイル保存先
- TTLとcleanupの具体値
- Snapshot作成の重複抑制
- Snapshot作成中の同一Result要求の共有
- Snapshot定期Cleanupの実行間隔
- SnapshotSetの解決・作成を担当するServiceの具体的なAPI
- SnapshotSet内の未使用Feature Snapshotを延命する条件
- 一時SQLiteのIndex
- 1000万件時のチャンクサイズの具体値
- Backend Query DTOの具体的なJSON形式
- Atomの具体的な公開範囲
- Loading／Empty／Errorの文言
- Categories・主Filtersとの合成規則

## 15. 次の詳細設計

次は、以下を具体化する。

1. TypeScriptのDomain型・API DTO・ViewModel
2. `ValueRangeFilterListState`の状態遷移
3. `HistogramQuery`のFrontend／Backend DTO
4. `SnapshotStore`のインターフェース
5. 一時SQLite Snapshotの生成・破棄フロー
6. 行操作別の再集計フロー
7. AtomとCustom Hookの公開境界
8. 暫定Hostと正式HostのProps
