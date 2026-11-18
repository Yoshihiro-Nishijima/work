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
+ フィルター条件
+ カテゴリ条件
+ 行Nより前の有効なスライダー条件
```

各条件グループはANDで合成する。初期Histogram実装ではフィルター条件とカテゴリ条件の
実条件入力・他Featureへの反映は行わないため、両グループは空条件として扱う。
将来の連携時も、Histogram自身のQuery条件を個別に再定義せず、共通条件モデルから
フィルター条件、カテゴリ条件、先行スライダー条件を組み立てる。

行N自身のスライダー条件は、行N自身のHistogramには適用しない。

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
├─ dataRange
├─ selectedRange
├─ sliderCondition
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

### 7.3 Item Modelの状態遷移

```text
unconfigured
  └─ 項目選択
       ↓
    loading
      ├─ 数値データあり ─→ ready
      ├─ 数値データなし ─→ empty
      └─ 取得失敗 ──────→ error

ready
  ├─ Slider確定／先行条件変更 ─→ loading（対象行）
  ├─ 項目変更 ───────────────→ loading
  ├─ 行削除 ─────────────────→ Modelから除去
  └─ 全範囲リセット ──────────→ loading（影響行）

empty
  ├─ 項目変更 ───────────────→ loading
  └─ 既存の再集計契機 ────────→ loading

error
  ├─ 項目変更 ───────────────→ loading
  └─ 既存の再集計契機 ────────→ loading
```

取得開始時は対象Itemの`result`、`dataRange`、`selectedRange`を新しい取得結果へ
置き換えるため、前回Histogramを表示しない。`sliderCondition`は、項目変更時や
Rangeの再初期化時に明示的に更新し、取得Errorだけでは削除しない。

### 7.4 List Modelの状態遷移

```text
初期化
  └─ snapshot準備中
       ↓
    snapshot準備完了
       └─ 初期6行を生成
            ├─ 未設定行 ─→ unconfigured
            └─ 初期項目 ─→ 各Itemをloading

snapshot準備失敗
  └─ List全体Error（初期行は保持、操作無効）

snapshot変更
  └─ 取得中のRequestを停止
       ↓
    初期6行へリセット
```

フィルター条件・カテゴリ条件の変更ではSnapshotを変更せず、
`conditionVersion`を更新して全行を上から再集計する。旧VersionのResponseは、
取得が成功していてもModelへ反映しない。

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
   └─ フィルター条件・カテゴリ条件・スライダー条件を
      DefectFilterConditionSetへ統合する
```

「条件・再集計計画」はデータ取得を担当しない。フィルター条件・カテゴリ条件・
先行スライダー条件の合成、自行スライダー条件・全範囲スライダー条件の除外、操作ごとの再集計対象判定、
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

親Featureはフィルター条件・カテゴリ条件・ValueRangeFilterListを包含し、各機能が保持する
条件を統合した`DefectFilterConditionSet`を管理する。ValueRangeFilterListは行・
Rangeを専用Storeで管理し、親FeatureはそこからValueRange条件を取得して統合する。
`DefectFilterConditionSet`は条件の統合モデルであり、同じ条件を別Atomへ二重保持しない。

AtomへFeature外へ公開する状態は、ResultIdentity、Snapshot参照、および将来他Feature
が利用する確定済みRange条件など、Feature間で共有する必要があるものに限定する。

## 8. 共通条件と機能別Query

絞り込み条件エリアの条件を統合モデルで表現し、機能ごとのQueryは分離する。

```text
DefectFilterConditionSet
├─ filterConditions
├─ categoryConditions
└─ sliderConditions
        ↓
機能別Query変換
├─ DefectHistogramQuery
├─ WaferMapQuery（後続）
└─ DefectListQuery（後続）
```

各機能のQuery形式を同一型にする必要はない。

`DefectFilterConditionSet`は、親Featureがフィルター条件・カテゴリ条件・
ValueRangeFilterListのスライダー条件から統合する。ValueRangeFilterList自身は、
親Featureが渡した統合条件のうち自分のHistogram取得に必要な条件を使い、行順から
先行スライダー条件を構成する。
Providerへは、条件合成済みの`DefectHistogramQuery`を渡し、Providerは条件の所有や
合成を行わず、Queryを実行するだけとする。

初期Histogramでは、フィルター条件とカテゴリ条件に選択条件がないため、これらは空条件と
する。空条件はSnapshotへの追加絞り込みを行わないことを意味し、Histogramの母集団
はSnapshot作成時に定義された対象Resultの欠陥データ全体となる。Snapshot自体の
対象範囲や、Snapshot作成時に除外されたデータの扱いを変更するものではない。

Histogramでは、対象行より前のスライダー条件を次の名称で扱う。

```text
priorSliderConditions
```

`priorSliderConditions`は、ReactやPythonの標準用語ではなく、
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

`conditions`は親Featureがフィルター条件・カテゴリ条件・スライダー条件をANDで
統合した完成済みの条件集合である。ValueRangeFilterListは、対象行より前の
ValueRangeFilterItemに設定された有効なスライダー条件を画面上の上から順に抽出し、
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

### 12.1 エラーログ

エラー発生時は、既存実装のロギング方式を踏襲して記録する。

- Snapshot準備Error：Backendで`resultIdentity`、`jobId`、処理stage、エラー分類を記録する
- 行Histogram取得Error：Backendで`snapshotId`、対象field、エラー分類を記録する
- FrontendはAbort以外の取得失敗を、operation、rowId、jobIdまたはsnapshotId、
  request generationなどの追跡情報とともに補助的に記録する
- Abort、古いResponseの破棄、Emptyは通常制御またはデータなしであり、Errorログにしない
- 生の条件値や欠陥データなど、不要なデータはログへ出力しない
- ログ内容と画面表示文言は分離し、内部エラー詳細をそのまま画面表示しない

### 12.2 Snapshot準備状態とJob状態の対応

画面向けの`SnapshotPreparationStatus`は、`idle`、`preparing`、`ready`、
`error`の4値に限定する。BackendのJob状態やHTTPエラーの詳細は、画面状態へ
直接追加せず、別のメタデータおよびログで保持する。

| Backend／API状態 | 画面状態 |
|---|---|
| 初期状態、未要求 | `idle` |
| `PROCESSING`、準備中を示す409 | `preparing` |
| `COMPLETED`かつSnapshot ID取得成功 | `ready` |
| `FAILED`、`CANCELED`、準備失敗、回復不能な404 | `error` |

`CANCELED`は画面上で独立状態として表示せず、必要に応じてエラー分類や
Jobメタデータで識別する。`retrying`も独立状態にはせず、再試行中は
`preparing`として扱う。

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
- 自行スライダー条件は自行Histogramへ適用しない
- 先行スライダー条件は後続Histogramへ適用する
- フィルター条件・カテゴリ条件・先行スライダー条件はANDで合成する
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
- フィルター条件・カテゴリ条件の変更時はSnapshotを再作成せず、行・項目・Rangeを維持して
  全行を上から再集計する
- フィルター条件・カテゴリ条件変更時はQuery世代を更新し、旧条件のResponseを破棄する
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
- Snapshot準備Errorと行Histogram取得Errorは、Frontend／Backendで切り分けて記録する

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

### 15.1 Frontend Model型の初期案

既存FrontendのFeatureでは、Feature配下の`types`でRequest／Response／Item型を
管理している。Analysis Viewer版でもこの配置方針を踏襲する。ただし、既存の
`DefectHistogramItemState`はIntegratedViewer版の状態を表す型であるため、
Analysis Viewer版ではValueRangeFilterList固有のModel型として定義する。

```ts
type ResultIdentity = {
  device: string;
  name: string;
  path: string;
};

type SnapshotReference = {
  snapshotSetId: string;
  snapshotId: string;
};

type ValueRangeFilterItemStatus =
  | "unconfigured"
  | "loading"
  | "ready"
  | "empty"
  | "error";

type NumericRange = {
  lower: number;
  upper: number;
};

type SliderCondition = {
  field: DefectHistogramField;
  lower: number;
  upper: number;
};

type DefectFilterConditionSet = {
  filterConditions: DefectFilterCondition[];
  categoryConditions: DefectCategoryCondition[];
  sliderConditions: SliderCondition[];
};

type ValueRangeFilterItemModel = {
  rowId: string;
  field: DefectHistogramField | null;
  dataRange: NumericRange | null;
  selectedRange: NumericRange | null;
  sliderCondition: SliderCondition | null;
  result: DefectHistogramResult | null;
  status: ValueRangeFilterItemStatus;
  error: string | null;
  requestGeneration: number;
};

type ValueRangeFilterListModel = {
  rows: ValueRangeFilterItemModel[];
  resultIdentity: ResultIdentity;
  snapshot: SnapshotReference | null;
  snapshotStatus: SnapshotPreparationStatus;
  conditionVersion: number;
};
```

`dataRange`はHistogram対象の有効な数値の最小値・最大値を保持し、Sliderの操作可能
範囲を表す。`selectedRange`はユーザーがSliderで選択中の範囲を保持し、
`sliderCondition`は後続行へ適用可能な確定条件を表す。全範囲の場合は
`sliderCondition`を`null`とし、Queryへ含めない。Histogram取得のErrorやEmptyは、
最後に確定した`sliderCondition`を自動的に削除しない。

`DefectHistogramResult`の`dataMin`／`dataMax`は`dataRange`へ、`counts`はBinごとの
棒の高さへ、`matchedCount`と`numericValueCount`はHistogram全体の件数情報へ対応する。

`ValueRangeFilterListModel`はList専用Storeが所有する。`DefectFilterConditionSet`は
別の保存用Modelとして二重保持せず、親Featureがフィルター条件・カテゴリ条件と
Listのスライダー条件から組み立て、`DefectHistogramQuery`へ渡す。

`DefectFilterCondition`は、既存Frontendの`GridFilterItem`をそのまま内部状態として
使用する型ではない。絞り込み条件エリアを親Feature主体で構成できるよう、Frontend内部
ではUIコンポーネントに依存しない条件型として扱う。既存Backendの`FilterItem`については、
`field`・`operator`・`value`による条件表現、対応演算子、入力検証の考え方を踏襲する。
Analysis Viewer用API DTOへ変換する境界で、この既存方針を適用する。

### 15.2 DefectHistogram Query／Result型の初期案

```ts
type DefectHistogramQuery = {
  resultIdentity: ResultIdentity;
  snapshot: SnapshotReference;
  field: DefectHistogramField;
  conditions: DefectFilterConditionSet;
};

type DefectHistogramBin = {
  lower: number;
  upper: number;
  count: number;
};

type DefectHistogramCategory = {
  categoryNo: number;
  counts: number[];
};

type DefectHistogramResult = {
  dataMin: number | null;
  dataMax: number | null;
  edges: number[];
  counts: number[];
  categories: DefectHistogramCategory[];
  matchedCount: number;
  numericValueCount: number;
};
```

データなしは`DefectHistogramResult`の`numericValueCount === 0`で表す成功結果とし、
ProviderがUI用の`empty`状態を返さない。
通信・Snapshot・集計失敗は例外として返し、Feature Hookが行の`error`へ変換する。

Empty判定は`matchedCount`ではなくHistogram対象項目の数値有無で行う。
`numericValueCount === 0`をFrontendの判定基準とし、Backendレスポンスでは
`dataMin`と`dataMax`がともに`null`であることを不変条件とする。これは、既存
IntegratedViewer版BackendのResponse意味を踏襲したものである。

UIの表示・操作挙動はモック版を基準とし、Histogram APIのResponse意味と数値なしの
表現は既存IntegratedViewer版Backendを基準とする。Analysis Viewer版では、この
二つの既存実装の役割を混同せず、UI仕様とデータ契約をそれぞれの基準に合わせる。

### 15.3 Provider契約の初期案

```ts
interface DefectHistogramProvider {
  getHistogram(
    query: DefectHistogramQuery,
    signal?: AbortSignal,
  ): Promise<DefectHistogramResult>;
}
```

Providerは完成済みの`DefectHistogramQuery`を実行するだけとし、条件の所有・合成、
行順による先行条件の決定、UI状態の判定は担当しない。初期実装は
`BackendDefectHistogramProvider`、将来の差し替え先は
`DuckDbWasmDefectHistogramProvider`とする。

### 15.4 Atom StoreとFeature Hookの契約

`ValueRangeFilterList`は、画面インスタンスごとに生成する専用Atom Storeを使用する。
モジュール共有のグローバルAtomは使用せず、Result変更または画面再初期化時にStoreを
初期化する。Atomは`ValueRangeFilterListModel`を状態の所有者とし、Hook内に同じ状態を
複製しない。

```ts
type ValueRangeFilterListActions = {
  selectField: (rowId: string, field: DefectHistogramField | null) => void;
  setSelectedRange: (rowId: string, range: NumericRange) => void;
  addRow: () => void;
  removeRow: (rowId: string) => void;
  clearRows: () => void;
  reorderRows: (sourceRowId: string, targetRowId: string) => void;
  reload: () => void;
};

type UseValueRangeFilterListResult = {
  model: ValueRangeFilterListModel;
  actions: ValueRangeFilterListActions;
  isInteractive: boolean;
  sliderConditions: SliderCondition[];
};
```

`useValueRangeFilterList`は、Atom Storeの読み書き、行操作、条件連鎖、再集計要求、
Snapshot準備状態の画面反映を担当するComponent向けの唯一の窓口とする。
ComponentからAtom、Provider、Query Serviceを直接利用させない。

`isInteractive`はSnapshot準備状態とList操作可否からHookが導出する。行Histogramの
Loading／Error／Emptyは、項目変更・削除・並べ替えを原則として妨げないため、
List全体の操作可否と行単位の状態を混同しない。

### 15.5 Query Serviceの責務

`DefectHistogramQueryService`は、Hookから渡された再集計計画を実行する。責務は
デバウンス、Abort、Request generationの採番、完了順による古いResponseの破棄、
Provider呼び出しとする。

```ts
type DefectHistogramRecalculationPlan = {
  conditionVersion: number;
  rows: Array<{
    rowId: string;
    query: DefectHistogramQuery;
  }>;
};

interface DefectHistogramQueryService {
  schedule(
    plan: DefectHistogramRecalculationPlan,
    options?: { debounceMs?: number },
  ): void;
  cancel(): void;
}
```

行の追加・削除・項目変更・Slider確定・並べ替えによる影響行の決定はHookまたは
純粋な再集計計画関数が担当し、Query Serviceは行順や条件を解釈しない。
Providerの例外はHookへ返し、HookがAbortを除いて該当行の`error`へ変換する。

### 15.6 既存実装から踏襲する事項

既存IntegratedViewer版Frontend／Backendで確立している構成は、Analysis Viewer版
でも原則として踏襲する。既存実装と異なる判断が必要な場合だけ、Analysis Viewer
固有の論点として扱う。

Frontendで踏襲する事項：

- Feature配下の`types`、`api`、`providers`、`hooks`、`utils`への責務別配置
- `DefectHistogramQueryService`によるデバウンス、Abort、リクエスト世代管理
- Providerのメソッドで`AbortSignal`を受け取る契約
- Request型とResponse型を分ける構成
- Feature HookをComponentと状態管理・取得処理の窓口とする構成
- AbortされたRequestを通常のError状態へ遷移させない扱い

Backendで踏襲する事項：

- `DefectHistogramService`による入力検証、データ取得、Histogram計算、Response生成
- RouterをHTTP境界に限定し、条件適用・SQL・集計をService側へ配置する構成
- `dataMin`、`dataMax`、`edges`、`counts`、`categories`、`matchedCount`、
  `numericValueCount`によるHistogram Response
- Histogram対象の数値が存在しない場合、`dataMin`／`dataMax`を`null`、
  `numericValueCount`を`0`とする表現

Snapshot／Jobで踏襲する事項：

- 非同期Job、Progress、Cancelを分離するAPIパターン
- `PROCESSING`、`COMPLETED`、`FAILED`、`CANCELED`によるJob状態
- Snapshot準備処理とHistogram Queryを分離するAPI境界
- Router、Service、Snapshot管理の責務分離

これらは、Analysis Viewer版の行順条件、Snapshot参照、専用Atom Storeなどの
固有設計と組み合わせて使用する。既存実装にない判断が必要な場合は、既存方式を
無理に拡張せず、固有論点として提示する。

### 15.7 命名規則

同じ概念に複数の呼称を与えず、以下の用語を固定して使用する。

条件の分類：

- `filter`：フィルター機能で設定された条件
- `category`：カテゴリ機能で設定された条件またはカテゴリ定義
- `slider`：ValueRangeFilterListのSliderで設定された条件
- `condition`：上記の各条件を表すデータ
- `DefectFilterConditionSet`：絞り込み条件エリア全体の統合条件

ValueRangeFilterListのSlider条件は、型名・プロパティ名ともに`SliderCondition`または
`sliderConditions`を使用し、`ValueRangeCondition`、`rangeCondition`、
`valueRanges`などの同義語は新たに使用しない。対象行より前のSlider条件は
`priorSliderConditions`と呼ぶ。

状態・取得データ：

- `Model`：画面・行が保持する情報全体
- `Status`：状態分類値
- `Result`：Providerから返る集計結果
- `Query`：Providerへ渡す完成済み取得条件
- `Provider`：Backend／DuckDB WASMなどの取得方式
- `Service`：Query実行やBackend集計などの処理補助

DefectHistogramに関する型・実装名は、`DefectHistogram`を基本名とする。
`HistogramQuery`、`HistogramProvider`などの短縮名や、同一層での
`MainFilter`、`ValueRange`、`Range`の混在は避ける。

### 15.8 条件連鎖と再集計計画の純粋関数

条件連鎖と再集計対象の決定は、AtomやProviderに依存しない純粋な関数として分離する。
最低限、次の関数を定義する。

```ts
function getPriorSliderConditions(
  rows: ValueRangeFilterItemModel[],
  rowIndex: number,
): SliderCondition[];

function buildDefectHistogramQuery(
  context: {
    resultIdentity: ResultIdentity;
    snapshot: SnapshotReference;
    filterConditions: DefectFilterCondition[];
    categoryConditions: DefectCategoryCondition[];
  },
  row: ValueRangeFilterItemModel,
  priorSliderConditions: SliderCondition[],
): DefectHistogramQuery | null;

function getRecalculationStartIndex(
  operation:
    | { type: "sliderChanged"; rowIndex: number }
    | { type: "fieldChanged"; rowIndex: number }
    | { type: "rowRemoved"; rowIndex: number }
    | { type: "rowsReordered" }
    | { type: "allRangesReset" },
  rowCount: number,
): number | null;
```

`getPriorSliderConditions`は、対象行より前の行について、`sliderCondition`が存在し、
かつ全範囲ではない条件だけを行順に返す。対象行自身の条件、未設定行、Empty行から
生成される条件は含めない。Error行は、最後に確定された`sliderCondition`が残って
いれば含める。

`buildDefectHistogramQuery`は、行が未設定、Snapshot未準備、または対象行のfieldが
未確定の場合は`null`を返す。行自身の`sliderCondition`はQueryへ含めず、
`filterConditions`、`categoryConditions`、`priorSliderConditions`だけを合成する。

再集計開始位置は操作ごとに次の規則とする。

| 操作 | 開始位置 | 備考 |
|---|---:|---|
| Slider変更 | 変更行+1 | 変更行自身のHistogramは再取得せず、後続行のみ再集計 |
| 項目変更 | 変更行 | Rangeを初期化し、変更行と後続行を再集計 |
| 行削除 | 削除位置 | 削除後の同位置から後続行を再集計 |
| 並べ替え | 0 | 確定後に全行を上から再集計 |
| 全範囲リセット | 0 | 全行の先行条件が変化し得るため全行を再集計 |
```

Slider変更では、自行Histogramは自分自身の条件を適用しないため、変更行の
Histogramを再取得せず、変更行より後続の行を再集計する。選択範囲変更により
自行の表示範囲やSliderの`dataRange`を再計算する仕様へ変更する場合は、
この境界を明示的に見直す。

### 15.9 Component PropsとHost接続

Componentは取得方式やAtomを直接受け取らず、ModelとイベントだけをPropsとして受け取る。
ProviderとList専用StoreはFeature内部のContext／Hook境界で解決する。

```ts
type ValueRangeFilterListProps = {
  resultIdentity: ResultIdentity;
  snapshot: SnapshotReference | null;
  snapshotStatus: SnapshotPreparationStatus;
  snapshotError: string | null;
  filterConditions: DefectFilterCondition[];
  categoryConditions: DefectCategoryCondition[];
  onSliderConditionsChange?: (conditions: SliderCondition[]) => void;
};

type ValueRangeFilterItemProps = {
  model: ValueRangeFilterItemModel;
  onFieldChange: (field: DefectHistogramField | null) => void;
  onRemove: () => void;
  onRangeChange: (range: NumericRange) => void;
};

type DefectHistogramItemProps = {
  result: DefectHistogramResult | null;
  status: ValueRangeFilterItemStatus;
  error: string | null;
};

type RangeSliderProps = {
  dataRange: NumericRange | null;
  selectedRange: NumericRange | null;
  disabled: boolean;
  onChange: (range: NumericRange) => void;
};
```

`ValueRangeFilterList`は`useValueRangeFilterList`からList Modelと操作関数を取得し、
各行へ`ValueRangeFilterItemProps`を渡す。`ValueRangeFilterItem`は表示構成とイベント
通知に限定し、条件連鎖や再集計対象を判断しない。

`DefectHistogramItem`は`result`と`status`を受け取り、`loading`、`empty`、`error`を
描画状態へ変換する。`RangeSlider`は`dataRange`、`selectedRange`、`disabled`だけを
扱い、`sliderCondition`や後続行の条件はPropsに持たない。

暫定Hostと正式Hostは、同じ`ValueRangeFilterListProps`を用いてFeatureを呼び出す。
暫定HostはIntegratedViewerの既存Filter状態を直接書き換えず、Filter条件は初期値の
空配列として渡す。将来の正式Hostでは、親FeatureがFilter／Categoryの条件を渡し、
`onSliderConditionsChange`でListが生成した有効なSlider条件を受け取って
`DefectFilterConditionSet`へ統合する。

Snapshot準備のAPI実行はListの外側または親Featureで行い、準備状態とErrorを
`ValueRangeFilterListProps`でListへ渡す。Listは`SnapshotPreparationStatus`に応じて
List全体のLoading／Errorを表示し、Histogram行の取得Errorと混同しない。
Providerの実装はHostから直接Componentへ渡さず、Feature用Contextへ登録する。

### 15.10 Snapshot／Histogram API DTO

FrontendのModelとHTTP DTOは分離する。Frontend内部の`ResultIdentity`はSnapshot準備時に
使用し、Histogram QueryではBackendが発行したOpaqueなSnapshot識別子を使用する。

Snapshot準備Request／Response：

```ts
type PrepareHistogramSnapshotRequest = {
  resultIdentity: ResultIdentity;
  forceRefresh?: boolean;
};

type PrepareHistogramSnapshotResponse =
  | {
      kind: "ready";
      snapshot: SnapshotReference;
    }
  | {
      kind: "creating";
      jobId: string;
    };
```

Job進捗Responseは既存Dataset Jobの契約を踏襲する。

```ts
type HistogramSnapshotJobStatus =
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

type HistogramSnapshotJobProgressResponse = {
  jobId: string;
  status: HistogramSnapshotJobStatus;
  stage: "VALIDATION" | "COPYING" | "FINALIZING" | null;
  progress: number | null;
  error: {
    code: string;
    message: string;
  } | null;
};

type GetHistogramSnapshotResponse = {
  snapshot: SnapshotReference;
};
```

Histogram QueryのHTTP Requestは、`DefectHistogramQuery`からAPI DTOへ変換する。
`resultIdentity`は送信せず、Snapshot IDと完成済み条件だけを送信する。

```ts
type DefectHistogramApiRequest = {
  snapshotSetId: string;
  snapshotId: string;
  field: DefectHistogramField;
  filterConditions: DefectFilterCondition[];
  categoryConditions: DefectCategoryCondition[];
  sliderConditions: SliderCondition[];
};
```

`sliderConditions`には対象行より前の有効な条件だけを格納する。自行の条件、
全範囲の条件、未設定行やEmpty行から生成される条件は含めない。

想定するHTTP境界は次のとおりとする。

```text
POST /histogram-snapshots
  Request: PrepareHistogramSnapshotRequest
  Response: PrepareHistogramSnapshotResponse

GET /histogram-snapshots/{jobId}/progress
  Response: HistogramSnapshotJobProgressResponse

GET /histogram-snapshots/jobs/{jobId}/snapshot
  Response: GetHistogramSnapshotResponse

POST /histogram-snapshots/{jobId}/cancel
  Response: 既存Dataset JobのCancel Response

POST /histogram-snapshots/{snapshotId}/histogram
  Request: DefectHistogramApiRequest
  Response: DefectHistogramResult
```

Histogram Queryでは、入力不正は4xx、Snapshotの不存在・期限切れは404、
Snapshot準備中など利用不可は409、集計処理の予期しない失敗は5xxとして返す。
Frontendは404をSnapshot再準備の対象として1回だけ扱い、同一Queryを無制限に
再試行しない。409はSnapshot準備完了前の利用不可として、Snapshot状態に応じて
待機またはList Errorへ変換する。

Backendは`DefectHistogramApiRequest`を検証後、内部の`DefectHistogramQuery`へ変換する。
ProviderはHTTP DTOを直接扱わず、Frontend／BackendそれぞれのService境界で変換する。

### 15.11 APIエラーと画面状態の変換

APIエラーは、Snapshot準備に関するList全体のErrorと、個別Histogram Queryに関する
行単位のErrorを分けて扱う。

| 発生箇所 | API／制御状態 | 画面への変換 |
|---|---|---|
| Snapshot準備 | 通信失敗、4xx、5xx | List全体を`error` |
| Snapshot Job | `FAILED`／`CANCELED` | List全体を`error` |
| Snapshot Job | `PROCESSING` | List全体を`preparing` |
| Snapshot ID取得 | 409（未完了） | `preparing`を維持して再確認 |
| Snapshot ID取得 | 404 | List全体を`error` |
| Histogram Query | 入力不正4xx | 該当行を`error` |
| Histogram Query | 集計5xx | 該当行を`error` |
| Histogram Query | Snapshot 404 | Snapshot再準備フローへ移行 |
| Histogram Query | Snapshot利用不可409 | Snapshot状態確認後、待機またはList全体を`error` |
| Request制御 | Abort、世代不一致 | 状態変更なし |

Snapshot準備Errorでは初期行を保持し、明示的なList再読み込みまでデータ依存操作を
無効にする。行Histogram Errorでは該当行だけを`error`とし、後続行のQuery処理は
継続する。既に確定している行の`sliderCondition`は、どちらのErrorでも自動的に
削除しない。

Snapshot消失・期限切れを検出した場合は、次の手順で一度だけ再準備する。

```text
Histogram QueryがSnapshot 404
  ↓
現在のQuery世代を無効化し、未完了RequestをAbort
  ↓
Snapshot準備APIを再実行（同じResult、forceRefresh=false）
  ↓
新Snapshot取得
  ↓
行・項目・Rangeを初期状態へ戻して全行を再集計
```

再準備後の同一Queryが再びSnapshot 404になった場合は再試行せず、List全体を
`error`とする。再準備中にResult変更、明示的再読み込み、別のSnapshot切り替えが
発生した場合は、古い再準備処理のResponseを破棄する。

Snapshot準備APIの再試行とHistogram Queryの再試行は同じ世代管理へ統合するが、
Snapshot準備の再試行回数とQueryの再試行回数は別に記録する。Abortされた処理、
古い世代のResponse、Empty結果はError状態へ変換しない。

## 16. 実装タスク分解

### 16.1 Frontendの型・純粋関数

1. `ResultIdentity`、`SnapshotReference`、`SnapshotPreparationStatus`、
   `ValueRangeFilterItemModel`、`ValueRangeFilterListModel`を定義する。
2. `DefectHistogramQuery`、`DefectHistogramResult`、API DTOを定義し、
   Domain Modelとの変換関数を実装する。
3. `getPriorSliderConditions`、`buildDefectHistogramQuery`、
   `getRecalculationStartIndex`を実装する。
4. Sliderの全範囲判定、Inclusive条件、未設定／Empty行の除外を共通関数へ分離する。

### 16.2 Atom Store・Query Service・Feature Hook

1. Listインスタンス専用のJotai Store生成処理を実装する。
2. 行追加・削除・全削除・項目変更・並べ替え・Rangeリセットを実装する。
3. `DefectHistogramQueryService`へデバウンス、Abort、世代管理、
   古いResponse破棄を実装する。
4. `useValueRangeFilterList`でSnapshot状態、行状態、再集計計画、
   Provider呼び出しを統合する。
5. 親Feature向けに有効な`sliderConditions`を出力する。

### 16.3 Provider・Backend API

1. `DefectHistogramProvider`と`BackendDefectHistogramProvider`を実装する。
2. Snapshot準備、Progress、Snapshot ID取得、Cancel APIを実装する。
3. Snapshot参照を受け取るHistogram Query APIを実装する。
4. Backend Serviceで入力検証、先行条件の適用、Histogram計算、Response生成を行う。
5. Snapshot共有、TTL、失効検出、ログ出力を実装する。
6. 将来のDuckDB WASM Providerが同じDomain Queryを受け取れる境界を維持する。

### 16.4 Component・Host

1. `ValueRangeFilterList`を実装する。
2. `ValueRangeFilterItem`を実装する。
3. `DefectHistogramItem`を表示専用として実装する。
4. `RangeSlider`を入力専用として実装する。
5. IntegratedViewer暫定Hostを追加し、空のFilter／Category条件で接続する。
6. Snapshot準備状態と行Histogram状態の表示を接続する。

### 16.5 実装順序

```text
Frontend型・純粋関数
  ↓
Atom Store・Query Service
  ↓
Backend Snapshot／Histogram API
  ↓
Backend Provider接続
  ↓
Feature Hook
  ↓
Component
  ↓
暫定Host
```

Backend APIを先行して単独検証できるようにし、FrontendはProviderをStubへ差し替えて
行操作・条件連鎖・状態遷移を先に検証できる構成とする。

## 17. 最小テスト項目

### 17.1 純粋関数

- 自行のSlider条件がHistogram Queryへ含まれない
- 先行行の有効なSlider条件が行順に含まれる
- 全範囲、未設定行、Empty行の条件が除外される
- Error行の最後に確定されたSlider条件が維持される
- Slider条件が下限・上限を含む
- 項目変更、削除、並べ替え、全範囲リセットの再集計開始位置が正しい

### 17.2 状態・非同期処理

- 初期6行と追加未設定行が正しく生成される
- 項目変更時にRangeが初期化される
- Loading開始時に前回Histogramがクリアされる
- Abort後にError状態へ遷移しない
- 古い世代のResponseがModelへ反映されない
- Snapshot準備状態が4値へ正しく変換される
- Snapshot 404後の再準備が1回だけ実行される

### 17.3 Component・API

- `unconfigured`／`loading`／`ready`／`empty`／`error`の表示が正しい
- Empty／ErrorでRangeSliderが無効になる
- List全体のSnapshot Errorと行Histogram Errorが分離される
- Snapshot準備APIのUnion Responseを正しく解釈できる
- Histogram APIの404／409／4xx／5xxを規定状態へ変換できる

## 18. 実装着手前コード整合性レビュー

### 18.1 レビュー方法

実装着手前に、次の順で設計と既存コードを突き合わせる。

1. 既存のRouter、Request／Response DTO、Service、Provider、Hookを特定する
2. 設計上の各契約を、既存の型・HTTP形式・状態遷移と比較する
3. モック版の操作イベントと再集計条件を、既存Frontendの制御と比較する
4. 既存コードを流用する部分、新規境界を作る部分、変更禁止の部分を確定する
5. 確定した境界ごとに、純粋関数、API、状態遷移、非同期処理のテスト項目を割り当てる

### 18.2 レビュー結果と確定事項

#### 既存Histogram API

IntegratedViewer版の既存APIは次の形式である。

```text
POST /results/{name}/defect-histogram
POST /results/{name}/defect-histogram-range
```

既存Requestは単一の`GridFilterItem`相当の条件を受け取り、
Frontend Providerは`resultName`を引数として渡す。Analysis Viewerの
Snapshot ID、ResultIdentity、複数条件、先行Slider条件を扱う契約とは一致しない。

したがって、既存APIは後方互換性のため変更せず、Analysis Viewerは設計書の
Snapshot-aware APIを新設する。新APIは既存API Router配下へ
`/analysis-viewer/histogram-snapshots`として登録し、実URLは
`/api/analysis-viewer/histogram-snapshots`を基準とする。既存Backendの
Histogram計算、Response項目、数値なしの表現、入力検証の考え方は再利用する。

既存の`defect-histogram-range`は、自行Histogramの再集計に使用しない。
Analysis ViewerのSlider変更は後続行のHistogram Queryを再実行する。

#### Job／Snapshot

既存Dataset Jobから、`PROCESSING`、`COMPLETED`、`FAILED`、`CANCELED`、
進捗、Cancel、Job監視、ログ出力の規約を踏襲する。一方、
`DatasetCreateJob`はDataset固有の属性と完了Job保持期間を持つため、
Histogram Snapshot Jobへ直接流用しない。

Histogram Snapshot用には、同じ状態・APIパターンを持つ専用Jobモデルと
Registryを新設する。Snapshot TTLとJob Registryの保持期間は別管理とし、
Job削除後もTTL内のSnapshotを参照できる構成を維持する。

#### Frontend

既存の`itemsAtom`、IntegratedViewer版`DefectHistogramItemState`、
`getHistogram`／`getRange`中心のQuery Serviceは、Analysis Viewerへ
そのまま流用しない。既存実装のAbort、Provider差し替え、世代管理の考え方だけを
踏襲し、Analysis Viewer専用のList-scoped Store、Model、Query Serviceを新設する。
既存の`defectHistogramQueryService.test.ts`を、Abort・世代管理・古いResponse破棄の
テスト構成における先行例として利用する。

#### モック版との整合

モック版で確認できる次の挙動は、設計と一致する。

- 自行のRange条件を自行Histogramへ適用しない
- 先行行のRange条件を後続行へ適用する
- Slider変更時に後続行を再集計する
- 項目変更時にSlider範囲を初期化する
- 行削除時に削除位置以降を再集計する
- 並べ替え確定後に全行を再集計する
- Request Abort、Loadingクリア、Empty、Errorを行単位で扱う

#### 条件型

Analysis Viewer内部の`DefectFilterCondition`は、既存Backendの
`field`／`operator`／`value`形式を基礎とするUI非依存型として確定する。
MUIの`GridFilterItem`はAnalysis Viewer内部Modelへ持ち込まない。
Filters／Categoriesの具体的なfieldとoperatorは各Feature仕様確定時に追加するが、
Histogram初期実装では両方を空配列として扱う。

### 18.3 実装着手条件

以下は実装前に確定済みとする。

- 既存IntegratedViewer APIは変更しない
- Analysis Viewer用Snapshot APIとHistogram APIを新設する
- Dataset Jobの状態・進捗・Cancel規約は踏襲するが、Jobモデルは分離する
- 既存Histogram計算・Response意味・ログ方式は再利用する
- Analysis ViewerのAtom、Hook、Query Service、Providerは専用実装とする
- Slider変更ではRange集計APIを呼ばず、後続行Queryだけを再実行する
- Filters／Categoriesの実条件は初期実装では空条件とする

このレビューにより、Histogram単体の初期実装とIntegratedViewer暫定Hostでの
確認に必要な主要な差分は解消した。Filters／Categoriesの具体仕様は本スレッドの
Histogram実装完了条件ではなく、後続Featureの設計時に確定する。

本スレッドの対象範囲では、Filter条件・Category条件を空配列として扱うため、
それらの具体型やUIを確定する必要はない。Histogramは、将来それらを受け取れる
`DefectFilterConditionSet`とProvider境界だけを用意した状態で実装可能とする。

### 18.4 最終レビュー完了記録

実装着手前の最終コード整合性レビューを完了した。対象はHistogram単体と、
IntegratedViewer暫定Hostでの確認に限定した。

確認済みの既存実装配置：

- Frontend既存Histogram：`frontend/01_frontend/src/features/defect-histogram/`
- Frontend既存Host：`features/defect-histogram/layouts/IntegratedMapAndDefectDetails.tsx`
  および`features/misc/layouts/IntegratedViewer.tsx`
- Frontend既存テスト：Feature配下の`*.test.ts`／`*.test.tsx`
- Backend既存Histogram：`backend/02_backend/mbmmi/histogram/`
- Backend既存Histogram API：`backend/02_backend/webapp/routers/api/defect_histogram.py`
- Backend既存Histogramテスト：`mbmmi/histogram/tests/`
- API Router登録：`backend/02_backend/webapp/routers/api/__init__.py`

確定した実装境界：

- 既存IntegratedViewer HistogramのAPI、Atom、Hook、Componentは後方互換性のため変更しない
- Analysis Viewer Histogramは専用Feature実装として追加する
- 既存Histogramの計算、Response項目、入力検証、Empty判定、ログ方式は再利用する
- 既存の`getRange`／`defect-histogram-range`はAnalysis ViewerのSlider連鎖には使用しない
- Analysis Viewer用APIは`/api/analysis-viewer/histogram-snapshots`配下へ追加する
- 新APIのRouter登録は既存`webapp/routers/api/__init__.py`へ追加する
- Snapshot Job／RegistryはDataset Jobから状態・進捗・Cancel規約のみ踏襲し、モデルと管理領域は分離する
- Frontendテストは既存Query Serviceテストと同じFeature配下へ追加する
- Backendテストは既存Histogram Serviceテストと同じ`mbmmi/histogram/tests/`へ追加する
- 暫定Hostは既存IntegratedViewerへ専用Featureを接続し、既存Filter Operator連携を変更しない

設計書、既存ソース、モック版の比較により、Histogram単体の実装方針を変更する
未解決の差分は検出されなかった。Filters／Categoriesは今回のレビュー対象外であり、
後続Featureの設計時に扱う。
