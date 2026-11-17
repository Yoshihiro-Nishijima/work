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
+ 主Filters条件
+ Categories条件
+ 行Nより前の有効なRange条件
```

各条件グループはANDで合成する。初期Histogram実装では主FiltersとCategoriesの
実条件入力・他Featureへの反映は行わないため、両グループは空条件として扱う。
将来の連携時も、Histogram自身のQuery条件を個別に再定義せず、共通条件モデルから
主Filters条件、Categories条件、先行Range条件を組み立てる。

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

先行行のHistogram取得がErrorになっても、その行に最後に確定された有効な
Range条件は後続行の条件として扱う。Histogram取得状態とRange条件は別管理とし、
ErrorによってRange条件を自動的に削除・無効化しない。初回取得からErrorとなり、
まだ有効なRange条件が確定していない行は、後続行へ条件を追加しない。
Error行の後続行のHistogram取得は停止せず、各行を独立して継続する。

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

UI状態の補足：

- Analysis Viewer初期化時は、初期6項目の行枠を表示する
- Snapshot準備中は各行をLoading表示とし、項目変更・Slider・行追加・削除・並べ替えを無効化する
- Snapshot準備失敗時は初期行を残したList全体のErrorを表示し、明示的な再読み込みまで操作を無効化する
- 未設定行はHistogramを取得せず、項目選択UIだけを有効にする
- 項目選択後は該当行をLoading表示してHistogramを取得し、完了後にRangeSliderを有効化する
- 行HistogramのLoading中も、項目選択・削除・並べ替えなどの行操作は許可する。
  Loading中に項目が変更された場合は、進行中の取得をAbortし、新しい項目の取得へ
  切り替える
- 再集計対象行は、直前のHistogramを残さずLoading表示へ置き換える。
  取得完了後に新しいHistogramを表示する
- 再集計中も、モック版に合わせてSlider・行操作を許可する
- Empty行は`No data`相当を表示し、RangeSliderを無効化する。Empty行から後続行へのRange条件は生成しない
- Error行は該当行だけにErrorを表示し、後続行の再集計は継続する
- Error行に最後に確定された有効なRange条件がある場合は、後続行の先行条件として維持する
- Result変更、明示的再読み込み、Snapshot消失・期限切れからの再作成、
  Backend再起動後の再作成などでSnapshotが切り替わる場合は、現在の行順・項目・
  Range条件を破棄し、初期6行へ戻して新Snapshotの初期表示を開始する

行操作の表示・再集計挙動はモック版に合わせる。

- 行追加：未設定行を一覧の末尾へ追加する
- 行削除：削除位置以降の行を再集計する
- 項目変更：変更行のRangeを新項目の全範囲へ戻し、変更行以降を再集計する
- 並べ替え：行順変更後、全行を上から順に再集計する
- 全削除：全行を除去し、未完了のHistogram取得を停止する
- 全範囲リセット：全行のRangeを全範囲へ戻し、影響を受ける後続行を再集計する
- 並べ替え操作中は再集計せず、操作確定後に全行を上から順に再集計する

## 7. Model設計

### 7.1 Item Model

```text
ValueRangeFilterItemModel
├─ rowId
├─ field: DefectHistogramField | null
├─ range
├─ rangeCondition
├─ result: DefectHistogramResult | null
├─ status
├─ error
└─ requestGeneration
```

状態例：

```text
unconfigured
loading
ready
empty
error
```

`unconfigured`は項目未選択、`loading`は項目選択済みでHistogram取得中、
`ready`は取得成功かつ表示対象データあり、`empty`は取得成功だが対象データなし、
`error`は取得失敗を表す。`ready`ではHistogram、凡例、Tooltip、RangeSliderを
利用可能とし、`empty`と`error`ではHistogramの代わりに状態表示を行い、
RangeSliderを無効化する。

### 7.2 List Model

```text
ValueRangeFilterListModel
├─ rows
├─ rowOrder
├─ resultIdentity
├─ snapshotIdentity
├─ snapshotStatus
└─ conditionVersion
```

`snapshotStatus`はList全体のSnapshot準備状態を表し、行の`status`とは分離する。
Snapshot準備中・準備失敗はList全体で扱い、Histogram取得の`loading`・`ready`・
`empty`・`error`は各行で扱う。

UI状態・API状態・世代情報はFeature Hookを窓口として扱い、ComponentからAtomを
直接参照しない。

初期Histogramでは、`ValueRangeFilterListModel`をAtomを主軸に管理する。
ただし、モジュール共有のグローバルAtomとして保持せず、ValueRangeFilterListの
インスタンスごとに専用Store／Providerを設ける。これにより、複数Viewer間や
画面再表示の間で行・Range・Histogram結果が意図せず残留することを防ぐ。

Feature Hookは、専用Atomの読み書き、行操作、条件連鎖、Provider呼び出し、
Abort・デバウンス・世代管理、Snapshot変更時の初期化を集約する。Componentは
Feature Hookが返す状態と操作関数だけを利用する。

要件・基本設計上の機能境界は、次の5つに分ける。

```text
ValueRangeFilterList機能
├─ List Model管理
│  └─ 専用Atom Storeで行・Range・Histogram結果を保持する
├─ 行操作
│  └─ 追加・削除・項目変更・並べ替え・全削除・Rangeリセットを扱う
├─ 条件・再集計計画
│  └─ 画面操作に応じて条件を再配置し、影響行・Query順を決める
├─ DefectHistogram取得
│  └─ Queryを実行し、Result／Empty／Errorを行Modelへ反映する
└─ 親Feature条件統合
   └─ 主Filters・Categories・ValueRangeを
      DefectFilterConditionSetへ統合する
```

「条件・再集計計画」はデータ取得を担当しない。主Filters・Categories・先行
Range条件の合成、自行Range・全範囲Rangeの除外、操作ごとの再集計対象判定、
Query順序の決定、Query世代の更新を担当する。これらは可能な限り副作用を持たない
純粋な関数として実装する。

外部公開する窓口は親Feature Hookに統一する。内部では5機能の責務を分離するが、
Componentが個別のAtom・Service・Provider・判定関数を直接利用しない構成とする。

ただし、Feature Hookへすべての実装を集中させて巨大化させない。行操作に伴う
再集計対象の判定、条件の変換、全範囲判定など副作用を持たない処理は純粋な関数へ
分離し、Query実行の共通処理は`DefectHistogramService`、実際のデータ取得方式は
`DefectHistogramProvider`へ分離する。Feature Hookは、これらを組み合わせて画面の
状態遷移を調整する役割に限定する。

AtomとHookの責務を重複させない。同じ状態をAtomとHook内の別Stateで二重管理せず、
Atomを状態の所有者、Hookを操作と公開APIの窓口とする。

Atom管理が実際に過度に複雑化し、更新規則の可読性・テスト性・整合性を損なう場合に
限り、限定的なReducer導入を再検討する。初期実装では既存Frontendの状態管理方針
との整合性を優先し、Reducerを標準方式として導入しない。

親Featureは主Filters・Categories・ValueRangeFilterListを包含し、各機能が保持する
条件を統合した`DefectFilterConditionSet`を管理する。ValueRangeFilterListは行・
Rangeを専用Storeで管理し、親FeatureはそこからValueRange条件を取得して統合する。
`DefectFilterConditionSet`は条件の統合モデルであり、同じ条件を別Atomへ二重保持しない。

AtomへFeature外へ公開する状態は、ResultIdentity、Snapshot参照、および将来他Feature
が利用する確定済みRange条件など、Feature間で共有する必要があるものに限定する。

## 8. 共通条件と機能別Query

条件の意味を共通化し、機能ごとのQueryは分離する。

```text
DefectFilterConditionSet
├─ mainFilters
├─ categories
└─ valueRanges
        ↓
機能別Query変換
├─ DefectHistogramQuery
├─ WaferMapQuery（後続）
└─ DefectListQuery（後続）
```

各機能のQuery形式を同一型にする必要はない。

`DefectFilterConditionSet`は、親Featureが主Filters・Categories・ValueRangeFilterList
の条件から統合する。ValueRangeFilterList自身は、親Featureが渡した統合条件のうち
自分のHistogram取得に必要な条件を使い、行順から`priorRangeConditions`を構成する。
Providerへは、条件合成済みの`DefectHistogramQuery`を渡し、Providerは条件の所有や
合成を行わず、Queryを実行するだけとする。

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

SnapshotSetとFeature別Snapshotでは、識別子の用途を分ける。

| 識別子 | 用途 | 発行主体 |
|---|---|---|
| `snapshotSetId` | Analysis Viewer全体で共有するResultデータ世代の識別 | Backend |
| `snapshotId` | Histogramなど個別FeatureのSnapshot実体の識別 | Backend |
| `resultIdentity` | 元Resultの論理識別 | Frontendから指定、Backendで検証 |
| `sourceFingerprint` | Result DBのデータ世代の一致判定 | Backendで算出 |

既存Snapshotの再利用判定に使用する論理キー（共有検索キー）は、
次の組み合わせとする。

```text
SnapshotSet共有キー
  = resultIdentity + sourceFingerprint

Feature Snapshot共有キー
  = snapshotSetId + featureType + snapshotSchemaVersion
```

共有検索キーと、APIで扱うSnapshot IDは別概念である。Frontendへ返す
`snapshotSetId`と`snapshotId`は、複数API・複数Viewerが同じSnapshotを
共有参照するための外部公開用Opaque IDである。Backendは受け取ったIDから
Snapshot実体を解決し、内部では共有検索キーによって同一Result世代・同一
Feature形式の既存Snapshotを検索・再利用する。Frontendは通常、共有検索キーを
直接管理せず、返却されたIDをHistogram Queryなどの後続APIへ渡す。

`snapshotSetId`と`snapshotId`は外部から内容を推測できないOpaque IDとする。
`resultIdentity`や`sourceFingerprint`をIDへ直接埋め込まない。
`featureType`は`histogram`、`defect-list`、`wafer-map`などの機能識別子、
`snapshotSchemaVersion`は保持列やSnapshot形式が変わった際の再利用防止に使用する。
これはデータの更新世代ではなく、Snapshot実装の形式を表すBackend管理の
システム契約バージョンである。FeatureごとにBackendの定数またはコード管理する。
初期実装では、HistogramのSnapshot Schema Versionを`1`とする。
保持列、SQLiteテーブル構造、欠損値・型変換規則など、既存Snapshotを
互換利用できないソース変更をBackendへリリースするタイミングで、
新しい値（例：`2`）へ上げる。Version変更後は新旧Snapshotの共有検索キーが
一致しないため、新Backendは旧形式のSnapshotを再利用せず、新形式で作成する。
既存SnapshotはTTL Cleanupの対象になるまで保持できる。
後方互換で既存Snapshotをそのまま読み取れる変更では、Versionを上げない。
Frontendが任意の値を指定したり、Resultごとに変更したりはしない。

この段階で確定しているのはキーの概念と構成要素であり、
`sourceFingerprint`は、複数FeatureのSnapshotが同じResultデータ世代を
参照しているか判定するためにBackendが算出する。

初期実装では、Result DBのファイル情報を正規化してFingerprint化する。

```text
sourceFingerprintの入力候補
  ├─ Result DB file size
  └─ Result DB mtime_ns
```

`device`、`name`、`path`はResultIdentityとして別に保持し、
Fingerprintへ重複して含めない。将来、Result管理側に明示的な世代番号が
導入された場合は、それをFingerprintの基準へ置き換えられる境界を残す。

Feature Snapshotは遅延作成とする。Analysis Viewer全体でSnapshotSetを解決した後、
各Featureが初めて利用される時点で、対象FeatureのSnapshotを作成または取得する。
初期実装ではHistogram利用時に`HistogramSnapshot`だけを作成し、
Defect ListやWafer MapのSnapshotは各Featureの利用開始時に作成する。
未使用FeatureのSnapshotを事前作成しないことで、初期表示時の処理時間と容量を抑える。

`AnalysisViewerSnapshotSet`はBackend側で明示的に管理する。SnapshotSetには
少なくとも次の管理情報を保持する。

```text
AnalysisViewerSnapshotSetRecord
├─ snapshotSetId
├─ resultIdentity
├─ sourceFingerprint
├─ sourceGeneration
└─ createdAt
```

SnapshotSetはFeature Snapshotの親として扱うが、Feature Snapshotのデータ本体を
一括して保持するものではない。Frontendまたは複数Viewerから同じ
`resultIdentity`のSnapshotSet取得要求があった場合、Backendは共有検索キーで
既存SnapshotSetを解決し、同じ`snapshotSetId`を返す。

```text
SnapshotSet取得
  ↓
既存SnapshotSetあり
  └─ 既存snapshotSetIdを返す

既存SnapshotSetなし
  └─ SnapshotSetRecordを作成してsnapshotSetIdを返す
```

Featureが利用開始されると、Frontendは`snapshotSetId`と`featureType`を指定して
Feature Snapshotを取得または作成する。これにより、複数Viewerは同じ
SnapshotSet配下の同じFeature Snapshotを共有できる一方、各Viewerの行順・
Slider条件などの表示状態は共有しない。

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
Snapshot作成Jobを取得または作成
  ↓
Job完了後にSnapshotIdentityを取得
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

Snapshot作成の進行状態はJobだけで管理し、Snapshotに独立した`status`は
持たせない。Jobは次の情報を持つ。

```text
SnapshotJob
├─ jobId
├─ status
├─ stage（PROCESSING中）
├─ progress
└─ error情報
```

Jobの状態分類・命名は、既存Dataset Job実装を踏襲する。
Snapshot Jobでは、Job全体の状態を`status`、処理中の工程を`stage`、
進捗率を`progress`で管理する。

```text
status = PROCESSING
  └─ 作成処理中。stageとprogressで進行状況を表す

status = COMPLETED
  └─ Snapshot作成完了

status = FAILED
  └─ Snapshot作成失敗

status = CANCELED
  └─ Snapshot作成キャンセル
```

Snapshot作成用の`stage`は、初期実装では次の工程を定義する。

```text
VALIDATION
  └─ 入力・Result・作成条件の確認

COPYING
  └─ Result DBから一時SQLiteへチャンクコピー

FINALIZING
  └─ 最終ファイル確認・Snapshot管理情報登録
```

`COMPLETED`、`FAILED`、`CANCELED`は`status`で表現し、終了状態を`stage`へ
追加しない。`COMPLETED`への遷移とSnapshotの利用可能化は同一処理として扱う。
`COMPLETED`なのにSnapshot管理情報がない状態や、`PROCESSING`中に完成済み
Snapshotとして扱う状態は許可しない。FrontendとBackend間では、
`jobId`と`snapshotId`を曖昧に「ID」と呼ばず、常に名称を明示する。

Analysis Viewer固有の`unconfigured`、`loading`、`ready`、`empty`、
`error`などは、Job状態ではなくFeature／画面状態として管理する。
SnapshotSetが存在してもFeature Snapshotが未作成である状態は、
遅延作成の通常状態であり、専用Job状態を追加せず、Feature Snapshot準備要求で
既存Jobの取得または新規Jobの開始へ遷移する。

Snapshot作成完了時の確定順序は次のとおりとする。

```text
一時SQLiteの作成完了
  ↓
最終Snapshotファイルへ移動
  ↓
最終ファイルの存在・読み取り可能性を確認
  ↓
Snapshot管理情報を登録
  ↓
Jobをcompletedへ遷移し、snapshotIdを設定
```

この順序により、`completed`のJobが実体のないSnapshotを参照する状態を防ぐ。
途中で失敗した場合はJobを`failed`として扱い、最終ファイル・一時ファイル・
未完了の管理情報をCleanup対象とする。

Job Registry、Snapshot管理情報、Snapshot SQLiteは責務を分離する。

```text
Job Registry
  └─ 作成処理の状態・進捗・エラー・snapshotId

Snapshot管理情報
  └─ snapshotId、SnapshotSet、Feature、データ世代、TTL、ファイル場所

Snapshot SQLite
  └─ Histogramが参照する欠陥データ本体
```

Job Registryは既存Dataset Jobの状態管理・進捗取得・キャンセルのパターンを
踏襲する。Snapshot管理情報とSnapshot SQLiteは、Histogram Snapshot固有の
完成物として管理する。Job失敗・キャンセル時は、一時SQLiteと未完了の管理情報を
削除し、再利用可能な完成Snapshotとして扱わない。

Snapshot関連の初期実装は、Backend内の`SnapshotManager`へ集約する。
`SnapshotStore`などの下位部品は初期設計では独立させない。

```text
Feature Service
  ↓
SnapshotManager
  ↓
Snapshot管理情報・Snapshot SQLite・Job Registry
```

`DefectHistogramService`、将来の`DefectListService`、`WaferMapService`などの
Feature Serviceは、必要なSnapshot操作だけを`SnapshotManager`へ依頼する。
初期の内部公開範囲は次のとおりとする。

```text
SnapshotManager
├─ SnapshotSetの解決
├─ Feature Snapshotの取得または作成Job開始
├─ Snapshot使用開始
├─ Snapshot使用終了
└─ Cleanup
```

初期実装の内部インターフェースは、次の命名とする。

```text
resolve_snapshot_set(result_identity)
  → SnapshotSetReference

prepare_feature_snapshot(snapshot_set_id, feature_type)
  → FeatureSnapshotPreparation

begin_snapshot_use(snapshot_id)
  → SnapshotUseHandle

end_snapshot_use(snapshot_use_handle)
  → None
```

`resolve_snapshot_set`はResultのデータ世代を解決し、SnapshotSetを取得または
作成する。Feature Snapshotの実データは、この処理では作成しない。

`resolve_snapshot_set`の戻り値は、Feature Serviceが後続処理で使用する
`snapshotSetId`を中心とする。`sourceFingerprint`、共有検索キー、
Snapshot管理情報の保存場所などは、SnapshotManager内部の判定情報として
扱い、Feature ServiceやFrontendへ返さない。

TypeScriptで表現する場合は、次のようにする。

```ts
type SnapshotSetId = string;

type SnapshotSetReference = {
  snapshotSetId: SnapshotSetId;
};
```

`resultIdentity`はSnapshotSetの解決要求に使用する入力であり、
`SnapshotSetReference`の公開戻り値へ重複して保持しない。

`prepare_feature_snapshot`は、既存Feature Snapshotが利用可能なら`snapshotId`を
返し、作成中または新規作成開始なら`jobId`を返す。戻り値では`jobId`と
`snapshotId`を状態判別可能な形で分離する。

TypeScriptで表現する場合、`prepare_feature_snapshot`に対応する型は次の
判別可能Unionとする。

```ts
type FeatureSnapshotPreparation =
  | {
      kind: "ready";
      snapshotId: SnapshotId;
    }
  | {
      kind: "creating";
      jobId: JobId;
    };
```

`jobId`と`snapshotId`をNullableな単一型へまとめない。`kind`に応じて必要な
識別子だけを必須にすることで、作成中に`snapshotId`を誤って使用したり、
完了済みなのに`jobId`を参照したりする誤りを型レベルで防ぐ。

この概念は層ごとに対応する型へ変換する。

```text
Frontend
  └─ TypeScript Union
API
  └─ Pydanticの判別可能なResponse DTO
Backend
  └─ Pythonの判別可能な内部型
```

`begin_snapshot_use`はSnapshotの使用開始を登録し、存在・期限を確認した上で
`lastAccessedAt`を更新し、使用中管理を開始する。Snapshot本体の取得を意味しない。
Feature Serviceは実処理終了後に`end_snapshot_use`を呼び出す。
`SnapshotUseHandle`は使用中管理を安全に終了するための内部ハンドルであり、
Frontendへ公開しない。

```text
begin_snapshot_use(snapshot_id)
  → SnapshotUseHandle

end_snapshot_use(snapshot_use_handle)
  → None
```

`SnapshotUseHandle`には、使用対象の`snapshotId`と、今回の使用開始を識別する
内部`useId`などを保持する。同一Snapshotを複数処理が同時利用する場合でも、
各処理の開始・終了を対応付けられるようにする。Handleと`useId`はBackend内部に
閉じ、FrontendやHTTP APIへ公開しない。

共有キーの生成・検索、TTL判定、Job Registryの詳細、Snapshot SQLiteの
ファイル操作、排他制御、`activeCount`管理は`SnapshotManager`内部に隠す。
Frontendは`SnapshotManager`を直接利用せず、Snapshot APIおよびFeature APIを
経由する。

```text
Frontend
  ↓ API
Feature Service
  ↓ 内部呼出し
SnapshotManager
```

Feature ServiceはFeature固有の入力検証・条件変換・集計または取得処理を担当し、
SnapshotのTTL、Cleanup、Job、排他制御を重複実装しない。

Job RegistryをBackendのメモリ上で管理する初期方式では、Backend再起動後に
実行中Jobを引き継がない。再起動時に`PROCESSING`として残っていた
Snapshot作成Jobは`failed`相当として扱い、作成途中の一時SQLiteと未完了の
Snapshot管理情報をCleanup対象とする。FrontendはJob失敗として扱い、必要に応じて
新しいSnapshot作成Jobを開始する。

すでに完成し、Snapshot管理情報とSQLiteが正常に存在するSnapshotは、同一Backend
稼働中であれば、Job Registryの状態に依存せずTTLの範囲内で再利用できるようにする。
ただし、Backend起動時は再起動前のSnapshotを再利用せず、残存するSnapshot管理情報と
Snapshot SQLiteをCleanup対象として破棄する。これにより、Backend再起動後の
管理情報復旧・TTL継続を初期実装の対象外とする。

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

Cleanupの期限判定はFeature Snapshot単位で行う。期限切れとなったFeature
Snapshotを先に削除し、そのSnapshotSetに紐づくFeature Snapshotがすべて
存在しなくなった後で、SnapshotSetの管理情報を削除する。
SnapshotSetだけを先に削除して、利用中のFeature Snapshotが孤立する状態は
作らない。

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

最終参照時刻は、Snapshot作成完了、Feature Snapshot取得・解決、
Histogram取得時に更新する。
Viewer単位ではなく同一Result・同一データ世代で共有するため、
1つのViewer終了を削除契機にはしない。

TTL、Cleanup、`lastAccessedAt`はBackendが一元管理する。
Snapshot本体は作成後に変更せず、管理メタデータとしての
`lastAccessedAt`だけを、Snapshotの実利用を伴うBackend処理で更新する。

```text
lastAccessedAtを更新する
  ├─ Feature Snapshotの取得・解決
  ├─ Histogram集計などSnapshotを使用する処理
  └─ Snapshot作成完了時の初期設定

lastAccessedAtを更新しない
  ├─ SnapshotSetの検索だけ
  ├─ Jobの進捗確認
  ├─ Snapshotの存在確認だけ
  └─ Frontend側の表示・操作
```

Job進捗確認のポーリングだけでSnapshotのTTLが延長されることはない。

CleanupはBackend起動時に実行し、Backend稼働中も定期実行する。
定期間隔は設定値として外出しし、初期値は仮置きとする。
具体的な初期値は実装時に設定するが、性能評価・運用確認後に変更できるようにする。

```text
ANALYSIS_VIEWER_SNAPSHOT_CLEANUP_INTERVAL_SEC
```

TTLはSnapshotの保持期間、Cleanup間隔は期限切れを検知・削除する頻度であり、
別の設定値である。Cleanup間隔がTTLより短い場合でも、期限判定は
`lastAccessedAt + snapshotIdleTtl`を基準とする。

## 10. QueryとProvider

### 10.1 DefectHistogramQuery

```text
DefectHistogramQuery
├─ resultIdentity
├─ histogramSnapshotIdentity
├─ field
└─ conditions: DefectFilterConditionSet
```

`conditions`は親Featureが主Filters・Categories・ValueRange条件をANDで統合した
完成済みの条件集合である。ValueRangeFilterListは、対象行より前の
ValueRangeFilterItemに設定された有効なRange条件を画面上の上から順に抽出し、
全範囲のSliderを除外したうえで、親Featureの条件統合へ提供する。

### 10.2 Provider境界

```text
DefectHistogramProvider
├─ BackendDefectHistogramProvider（初期実装）
└─ DuckDbWasmDefectHistogramProvider（将来候補）
```

React側の行管理・条件生成・表示Componentは、集計方式へ直接依存しない。

### 10.3 Backend処理

```text
Router
  ↓
DefectHistogramService
  ├─ SnapshotService / SnapshotStore
  ├─ applyPriorRangeConditions
  └─ calculateHistogram
```

RouterはHTTP境界に限定し、SQL・条件適用・集計は`mbmmi`側へ配置する。

### 10.4 APIの分離

Snapshot作成とHistogram集計は別のAPI責務とする。

```text
Snapshot API
  └─ ResultIdentityからSnapshotJobを取得または作成

Histogram API
  └─ DefectHistogramQueryで集計
```

Snapshotの取得要求は、Frontendが`resultIdentity`を指定して行う。
BackendはSnapshot共有検索キーを解決し、次のいずれかを返す。

```text
既存Snapshotあり
  → snapshotIdを返す

作成中のJobあり
  → 既存jobIdを返す

既存Snapshot・作成中Jobなし
  → 新しいJobを作成し、jobIdを返す
```

この取得要求でFrontendが受け取る識別子は、処理状態に応じて一方だけとする。
作成中は`jobId`を使用し、Jobが`completed`になった後に`snapshotId`を取得する。
Frontendは共有検索キーを直接保持せず、Backendから返された`jobId`または
`snapshotId`を使用する。

明示的な再読み込みは、通常のFeature Snapshot準備APIへ
`forceRefresh: true`を指定して要求する。再読み込み専用APIは設けず、
新しいSnapshot作成Jobとして扱う。

```text
forceRefresh = false（通常）
  └─ 既存Snapshotまたは作成中Jobを再利用する

forceRefresh = true（明示的再読み込み）
  └─ 既存Snapshotを通常の再利用対象とせず、新しい作成Jobを開始する
```

`forceRefresh: true`であっても、同一共有キーに`PROCESSING`のJobが存在する
場合は新規Jobを作成せず、その既存Jobへ接続する。`forceRefresh`は完成済み
Snapshotの再利用を抑止する指定であり、同一内容の作成処理を重複実行する
指定ではない。

新しいSnapshot作成Jobを開始しても、旧Snapshotは直ちに破棄しない。
旧Snapshotを使用中のViewerは引き続き旧Snapshotを参照でき、新しい利用者は
新Snapshotを使用する。旧Snapshotの削除は`forceRefresh`ではなく、Cleanupが
`lastAccessedAt + TTL`および`activeCount == 0`を確認して行う。

Histogram Snapshot準備APIのFrontend向けJSON契約は、次の形式とする。
Feature種別は機能単位のEndpointで表し、Requestへ`featureType`を重複して含めない。

```json
{
  "resultIdentity": {
    "device": "device-01",
    "name": "result-name",
    "path": "/path/to/result"
  },
  "forceRefresh": false
}
```

`forceRefresh`の省略時は`false`として扱う。Responseは正常系を判別可能な
Union形式とし、Snapshot利用可能時は`snapshotId`、作成中は`jobId`だけを返す。

```json
{
  "kind": "ready",
  "snapshotId": "opaque-snapshot-id"
}
```

```json
{
  "kind": "creating",
  "jobId": "snapshot-job-id"
}
```

Job進捗APIは、既存Dataset Jobの進捗取得パターンを踏襲する。
Frontendは`jobId`を指定して進捗を取得し、Jobの状態に応じて次の情報を受け取る。

```text
作成待ち・作成中
  ├─ Jobの状態
  ├─ progress
  └─ snapshotIdなし

完了
  ├─ Jobの状態
  ├─ progress
  └─ snapshotIdなし（Snapshot取得APIで取得）

失敗・キャンセル
  ├─ Jobの状態
  ├─ error（失敗時）
  └─ snapshotIdなし
```

`jobId`は進捗APIのPathで指定するため、Responseへ重複して返すか、
既存Dataset Jobと同じ形式で返すかは、既存DTOに合わせる。
失敗・キャンセル時の`snapshotId`は、既存DTOの表現に合わせて省略または
空として扱い、利用可能なSnapshot IDとしては扱わない。

Slider変更、項目変更、行削除、並べ替えではSnapshot APIを再実行せず、
同じ`histogramSnapshotId`を使用してHistogram APIを呼び出す。

Snapshot作成APIは、既存Dataset JobのAPI粒度を踏襲する。

```text
POST /histogram-snapshots
  → jobId、status

GET /histogram-snapshots/{jobId}/progress
  → status、stage、progress、error

GET /histogram-snapshots/jobs/{jobId}/snapshot
  → snapshotId

POST /histogram-snapshots/{jobId}/cancel
  → 作成キャンセル
```

Job進捗APIは既存Dataset Jobと同様にJobの状態・工程・進捗・エラーだけを返し、
`snapshotId`は返さない。Frontendは`COMPLETED`を確認した後、
Snapshot取得APIを呼び出して`snapshotId`を取得する。
Snapshot取得APIはSnapshotManagerが保持する`jobId`と`snapshotId`の対応を
解決する。Job Registryから完了Jobが削除された後でも、SnapshotがTTL内で
利用可能なら`snapshotId`を取得できる。

Snapshot ID取得APIは、次の異常系を区別する。

```text
COMPLETEDかつSnapshot実体あり
  → 200、snapshotId

PROCESSING
  → 409、未完了

FAILED / CANCELED
  → 409、Snapshot利用不可

未知のjobId、または対応するSnapshot管理情報・実体の消失
  → 404
```

`COMPLETED`であってもSnapshot管理情報または実体が存在しない場合は、
成功形で返さず404として扱う。Frontendは未完了の409ではポーリングを継続し、
FAILED／CANCELEDまたは404ではError状態として処理する。

キャンセルは既存Dataset Jobと同じく、Frontendが`jobId`を指定して明示的に
要求する。キャンセル要求後の最終状態・Response形式・すでに完了したJobへの
キャンセル要求の扱いは、既存Dataset Jobの契約を踏襲する。

同一のSnapshot共有検索キーに`PROCESSING`のJobが存在する場合、
新しいJobを作成せず、その既存`jobId`を返して進捗確認へ接続する。
作成完了後は、Job進捗の`COMPLETED`を確認し、Snapshot取得APIで
対応する`snapshotId`を取得してSnapshotを再利用する。

同一共有キーの作成要求は重複抑制する。後続のViewerやFeatureは新しいJobを
キューへ追加せず、既存`jobId`の進捗をポーリングして完了を待つ。
Jobが`COMPLETED`になった後、Snapshot取得APIで取得した`snapshotId`を使用して
同じSnapshotを共有する。Jobが`FAILED`または`CANCELED`になった場合のみ、
新しい作成Jobを開始できる。

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
共通のDefectHistogramProviderへQueryを渡す。Providerの内部実装は行単位とし、
将来必要になった場合に一括Queryへ最適化できる境界を残す。

```text
ValueRangeFilterList
  └─ 再集計対象を決定
       ↓
DefectHistogramProvider
  └─ 行ごとのHistogram Queryを順次実行
```

## 12. Loading／Empty／Error

初期設計では、Snapshot取得と行集計を分けて扱う。

- Snapshot取得中：List全体のLoading
- Snapshot取得失敗：初期行を残したList全体のError。明示的な再読み込みで
  Snapshot準備からやり直す
- 行Histogram集計中：該当行のLoading
- 数値データなし：該当行のEmpty
- 行集計失敗：該当行のError。他行の表示、状態、Range条件は維持する
- 行Histogramには専用の再試行ボタンを設けない。項目変更、条件変更、
  行操作など既存の再集計契機が発生した場合は、その仕様に従って該当範囲を
  再取得し、明示的なList再読み込みでは全体を再取得する
- Snapshot消失・期限切れ：Snapshot準備を含むList全体の再読み込みとして扱う

行単位のErrorであっても、最後に確定された有効なRange条件は後続行へ維持する。
初回取得からErrorでRange条件が未確定の場合は、後続行へ条件を追加しない。
行ErrorはList全体のErrorへ昇格させず、既存の再集計契機またはList再読み込みで
復旧させる。

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
- 主Filters・Categories・先行Range条件はANDで合成する
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
- 行状態は`unconfigured`／`loading`／`ready`／`empty`／`error`で管理する
- 行の再集計開始時は直前Histogramを残さずLoading表示へ切り替える
- 行Errorには専用の再試行UIを設けず、既存の再集計契機またはList再読み込みで復旧する
- 行HistogramのLoading中も、項目変更・削除・並べ替えなどの行操作を許可する
- ValueRangeFilterListは専用Atom Store／Providerを使用し、Snapshot変更時に初期化する
- 初期状態管理はAtom＋Feature Hookを基本とし、Reducerは複雑化時の限定的な候補とする
- 主Filters・Categoriesの変更時はSnapshotを再作成せず、行・項目・Rangeを維持して
  全行を上から再集計する
- 主Filters・Categories変更時はQuery世代を更新し、旧条件のResponseを破棄する
- Slider操作はデバウンスと確定イベントを組み合わせて後続行へ反映する
- `DefectFilterConditionSet`は親Featureが統合管理し、Providerには合成済みQueryを渡す
- 機能境界はList Model管理、行操作、条件・再集計計画、DefectHistogram取得、
  親Feature条件統合の5機能に分ける
- Modelは`ValueRangeFilterListModel`／`ValueRangeFilterItemModel`とし、
  状態分類は`ValueRangeFilterItemStatus`で表す
- Query・Provider・Serviceは`DefectHistogram`を基本名とする

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
- Snapshot定期Cleanup間隔の初期値
- SnapshotSetの解決・作成を担当するServiceの具体的なAPI
- SnapshotSet内の未使用Feature Snapshotを延命する条件
- 一時SQLiteのIndex
- 1000万件時のチャンクサイズの具体値
- Backend Query DTOの具体的なJSON形式
- Loading／Empty／Errorの文言

## 15. 次の詳細設計

次は、以下を具体化する。

1. TypeScriptのModel型・API DTO・ViewModel
2. `ValueRangeFilterListModel`の状態遷移
3. `DefectHistogramQuery`のFrontend／Backend DTO
4. `SnapshotManager`のインターフェース
5. 一時SQLite Snapshotの生成・破棄フロー
6. 行操作別の再集計フロー
7. AtomとCustom Hookの公開境界
8. 暫定Hostと正式HostのProps
