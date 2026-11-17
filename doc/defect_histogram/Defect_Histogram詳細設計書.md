# Defect Histogram 詳細設計書

## 1. 本書の位置づけ

本書は、MUIを利用した欠陥ヒストグラム機能の正式詳細設計書である。初期実装の仕様、技術方針、実装・UTへの引き継ぎ事項、将来拡張時の確認事項を定義する。

本書の内容を実装・UTの基準とする。5章に記載する将来拡張事項および実装時技術検証事項は、初期実装の未確定要件ではなく、適用範囲を明示した引き継ぎ事項である。

## 2. 初期実装の確定仕様

### 2.1 対象範囲

- 初期実装は通常Result系のみを対象とする。
- Test Run系は初期対象外とする。
- 将来のTest Run Provider追加を妨げないProvider境界は維持する。
- 正式版は新Feature `defect-histogram`として実装し、既存の仕掛中`defect-range-histogram`は残置するが正式導線には接続しない。
- 対象データは、HISTOGRAM操作時点でHISTOGRAMボタンが配置されたFilterItemに有効な条件があればその条件に一致する全欠陥データとし、有効な条件がなければ対象fieldの全欠陥データとする。
- DataGridの現在ページ、ソート、ページングは集計対象に含めない。
- HISTOGRAM操作時点のFILTERSから、HISTOGRAMボタンが配置されたFilterItemの条件だけをヒストグラムごとにスナップショット化する。
- 同じfieldに複数のFilterItemが存在する場合も、ボタンを押下していないFilterItemの条件は初期実装では適用しない。
- 適用対象外となった他のFilterItemや他fieldのFILTERSについて、HISTOGRAM起動時に画面通知は行わない。
- 起動後のDataGrid FILTERS変更は、既存ヒストグラムへ反映しない。
- 初期状態ではヒストグラム領域を表示せず、最初のHISTOGRAM操作後に表示する。
- 複数Itemを追加した場合は、新しいItemを一覧の先頭へ追加する。
- Item削除は確認なしで即時実行し、通信・タイマー・状態・キャッシュを破棄する。
- HISTOGRAM操作は、既存動作を踏襲して数値fieldのFILTERS行内に配置する。
- HISTOGRAMボタンは、既存の`DefectViewColumns`から数値列のFilterOperatorへ専用InputComponentを注入する方式で実装し、DataGrid Toolbarや別メニューには配置しない。
- HISTOGRAMボタンは条件未設定・入力途中の状態でも利用可能とする。その場合は条件なしのスナップショットを作成して全件を対象に集計する。
- Slider・数値入力・bin選択・選択範囲のドラッグ移動は、Item内の範囲状態だけを変更する。
- 範囲状態はDataGridやレーダーマップのFILTERSへ反映しない。

### 2.2 API方式・名称

ヒストグラムAPIだけを既存APIから分離し、POST＋JSONを採用する。既存の欠陥一覧APIは変更しない。

```text
POST /results/{resultName}/defect-histogram
POST /results/{resultName}/defect-histogram-range
```

機能名・公開名は、欠陥を明示する`DefectHistogram`系で統一する。

### 2.3 Backend構成

```text
FastAPI Router
  ↓
DefectHistogramService
  ↓
ResultDefectHistogramProvider
  ↓
image.db / Defect table
  ↓
HistogramCalculationService
  ↓
Response Mapper
```

責務：

- `DefectHistogramService`
  - 欠陥用field・FILTERSの検証
  - Frontend fieldからDB fieldへの正規化
  - 欠陥カテゴリの調整
  - Provider・Calculation呼び出し
- `ResultDefectHistogramProvider`
  - Resultの`image.db`から対象データを読み取る
  - FILTERS条件をSQLへ適用する
  - 欠陥値と`defectClass`を提供する
- `HistogramCalculationService`
  - 欠陥固有名を持たない共通計算処理
  - min/max、bin、件数、範囲別件数を計算する

将来は次のProviderを追加できる構造とする。

```text
DefectHistogramService
  ├─ ResultDefectHistogramProvider
  ├─ TestRunDefectHistogramProvider（将来）
  └─ その他データソースProvider（将来）
```

### 2.4 Frontend構成

```text
DefectHistogramPanel
  └─ DefectHistogramList
      └─ DefectHistogramItem
          ├─ DefectHistogramHeader
          ├─ DefectHistogramSummary
          ├─ DefectHistogramChart
          ├─ DefectHistogramRangeSlider
          └─ DefectHistogramDetailsDialog
```

各名称の意味：

- `DefectHistogramPanel`：レーダーマップ下部のヒストグラム領域
- `DefectHistogramList`：縦方向の一覧と表示順
- `DefectHistogramItem`：`histogramId`単位のヒストグラム1件
- `DefectHistogramChart`：MUI X Chartsの表示
- `DefectHistogramRangeSlider`：数値範囲選択
- `DefectHistogramDetailsDialog`：範囲別件数の詳細表示

ヒストグラムは1列の縦並びとし、ヒストグラム領域だけを縦スクロール可能にする。

- レーダーマップとヒストグラムPanelは、画面内のコンテンツ領域を上下に分割して配置する。
- 上下分割と境界ドラッグには既存の`Allotment vertical`を再利用し、新規のリサイズ機構は作成しない。
- ヒストグラムPanelの初期高さは約480pxを目安とし、Panel内に複数Itemを表示する場合はPanel内を縦スクロールする。
- レーダーマップとヒストグラムPanelの境界はドラッグで調整可能とする。高さの最小・最大は、レーダーマップと1 Itemの操作性を維持できる相対制約とする。
- Chartの高さは約280pxを目安とし、幅はPanelの内容幅に追従するレスポンシブ表示とする。
- 画面幅が狭くなった場合は、Chart・Sliderなど個別コンポーネントの途中で分割せず、Item内のコンポーネント群を縦並びへ切り替える。
- Chartは可読性を維持するため、最低幅を約320px、Item内の横並びから縦並びへの切替を内容幅640px未満の初期基準値とする。実装時に実画面で表示・操作性を確認し、必要に応じてCSS値を調整する。必要に応じて軸ラベル・目盛り数を簡略化し、最低幅を下回る極端な画面幅での実用性は保証対象外とする。
- Summary・Slider・操作ボタンは、狭幅時に必要に応じて複数行へ折り返し、横方向のはみ出しや横スクロールを発生させない。

#### 複数ヒストグラムの表示・動作

- 複数の`DefectHistogramItem`を同時に表示する。
- 新しく追加したItemを一覧の先頭へ表示する。
- 同じfieldを複数回選択した場合も、`histogramId`が異なる独立したItemとして表示する。
- 各Itemは自身の通常集計結果、範囲状態、範囲別結果、Cache、エラー、対数Y軸状態を個別に保持する。
- あるItemのSlider操作・数値入力・通信・エラーは、他のItemの表示や状態へ影響させない。
- Itemが増えてPanelの表示領域を超えた場合は、Panel内の一覧だけを縦スクロールする。
- Item削除後、残りのItemは表示順と状態を維持する。
- 通常表示では範囲別APIの結果を可視化せず、詳細表示時だけ範囲別件数を表示する。

### 2.5 Frontendの責務分離

```text
DefectHistogramItem
  ↓
useDefectHistogram
  ↓
DefectHistogramQueryService
  ↓
DefectHistogramProvider
  ├─ BackendDefectHistogramProvider
  └─ WasmDefectHistogramProvider（将来）
```

- Componentは表示に集中する。
- Hookは状態・操作・通信制御をまとめる。
- カテゴリ名称・色・表示順はヒストグラムFeature内のAtomで管理し、Hook経由でChart・凡例・詳細表示から参照する。
- カテゴリAtomはヒストグラム画面では参照専用とし、画面操作では変更しない。初期値はヒストグラムFeature内で定義する。
- Query ServiceはProvider呼び出し、Abort、エラー伝播を扱う。
- Backend ProviderはHTTP通信を扱う。
- WASM Providerは将来、同じ論理Request／Resultを用いてFrontend内で計算する。
- API DTOとChart表示用型はMapperで分離する。

### 2.6 対象field

既存`DefectViewColumns`の`type: "number"`列を対象とする。

```text
defectId
abnormality
width
height
gray
grayDiff
area
mFOVno
sFOVno
chipX
chipY
coordX
coordY
```

`defectClass`は`singleSelect`列であるため、横軸のヒストグラム選択対象にはしない。`defectClass`はカテゴリ系列専用とする。

各fieldの`headerName`は既存DataGrid列定義を根拠とし、ヒストグラム側で別の表示名を重複定義しない。

`defectClassName`、`caughtBy`、`layers`、`src`は、今回のヒストグラム対象fieldおよびヒストグラム固有operator検討の対象外とする。

### 2.7 field Registry

FrontendとBackendは別実装・別ファイルのRegistryを持つ。ただし、次の契約項目は一致させる。

```text
frontendName
databaseName
dataType
histogramEnabled
```

Frontend Registry：

- DataGrid fieldとの対応
- `headerName`
- 数値列・ヒストグラム選択可否
- WASM計算用情報

Backend Registry：

- Frontend fieldの許可判定
- DB fieldへの変換
- DB型・NULL可否
- FILTERS operator制約
- ヒストグラム集計可否

代表的なDB field変換：

```text
width  → sizeX
height → sizeY
その他 → 既存DB field名
```

#### Registryの定義項目

Registryはfield名だけでなく、値の型・変換・利用可否を明示する。

| 定義項目 | 内容 |
|---|---|
| `field` | APIで使用するFrontend field名 |
| `databaseField` | Backend／DB上のfield名 |
| `dataType` | `number`、`category`、`array`等の論理型 |
| `requestValueType` | JSON Requestで受け付ける値の型 |
| `histogramTarget` | 横軸のヒストグラム対象か |
| `filterTarget` | FILTERSで使用可能か |
| `normalizeValue` | 値の変換・正規化規則 |
| `allowedOperators` | そのfieldで許可するoperator |
| `displayName` | Frontendで表示する名称 |

#### field別の変換規則

| Frontend field | DB field | Request値 | 横軸 | FILTERS | 変換・正規化 |
|---|---|---|---:|---:|---|
| `defectId` | `defectId` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `abnormality` | `abnormality` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `width` | `sizeX` | 有限数値 | 可 | 可 | `width`から`sizeX`へ変換 |
| `height` | `sizeY` | 有限数値 | 可 | 可 | `height`から`sizeY`へ変換 |
| `gray` | `gray` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `grayDiff` | `grayDiff` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `area` | `area` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `mFOVno` | `mFOVno` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `sFOVno` | `sFOVno` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `chipX` | `chipX` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `chipY` | `chipY` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `coordX` | `coordX` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `coordY` | `coordY` | 有限数値 | 可 | 可 | 数値化・有限値検証 |
| `defectClass` | — | — | 不可 | 不可 | カテゴリ系列としてResponseに使用 |
| `defectClassName` | — | 受け付けない | 不可 | 不可 | 今回のヒストグラム対象外 |
| `caughtBy` | — | 受け付けない | 不可 | 不可 | 今回のヒストグラム対象外 |
| `layers` | — | 受け付けない | 不可 | 不可 | 今回のヒストグラム対象外 |
| `src` | — | 受け付けない | 不可 | 不可 | 今回のヒストグラム対象外 |

対象外fieldについて、ヒストグラム専用の変換・operator検証は設けない。

### 2.8 Request契約

Frontend field名をAPI・WASM共通Requestの正式名称とする。

```ts
type DefectHistogramRequest = {
  field: string;
  filter?: FilterItem;
};

type DefectHistogramRangeRequest = DefectHistogramRequest & {
  lower: number;
  upper: number;
};
```

`filter`はHISTOGRAMボタンが押下されたFilterItemに有効な条件がある場合、その単一条件を表す。有効な条件がない場合はFrontendから`filter`を省略する。Backendは省略された`filter`を条件なしとして扱い、対象fieldの全件を集計する。

`filter`が指定された場合は、次を必ず検証する。

- `filter.field`はRequestの集計対象`field`と一致すること。不一致は422とする。
- `filter`のfield・operator・valueが許可され、条件として成立していること。不正または未成立のFilterItemは422とし、条件なし（全件）へ読み替えない。
- 通常集計APIと範囲別集計APIで同一の検証を適用する。

一致検証後、有効なFilterItemは既存のFilterModel／FilterItem変換処理を再利用するため、Backend内部で単一条件のFilterModelへ変換する。

範囲条件は次を満たす必要がある。

```text
lower、upperは有限数値
lower <= upper
```

Requestにページング・ソート・bin数指定は含めない。bin数はProvider側で決定する。

### 2.9 FILTERS

初期実装では、HISTOGRAM操作時点でボタンが配置されたFilterItemに有効な条件がある場合、その単一条件だけをスナップショット化し、BackendでDB fieldへ変換する。ボタンが配置されたFilterItemに有効な条件がない場合は、条件なしのスナップショットを作成し、対象fieldの全件を集計する。したがって、HISTOGRAMボタンは条件未設定・入力途中でも利用可能であり、ボタンが配置された行の条件が未成立であることを理由に無効化しない。

有効な条件がある場合でも、入力途中で未成立のFilterItem、ボタンが押下されていない同一fieldのFilterItem、およびヒストグラム対象外fieldのFilterItemはスナップショットに含めない。DataGrid上で複数fieldまたは複数条件の複合FILTERSが設定されていても、初期実装ではボタンが配置されたFilterItemの条件だけを集計条件として使用する。ボタンが配置されたFilterItemに有効な条件がない場合は、他のFilterItemの条件も適用せず全件対象とする。適用対象外のFILTERSを画面上で通知することもしない。

例えば、`defectClassName`、`gray > 100`、`gray <= 500`のFilterItemが存在し、`gray > 100`の行に配置されたHISTOGRAMボタンを起動した場合、`gray > 100`だけを集計条件として使用する。`defectClassName`と`gray <= 500`は適用せず、ヒストグラムの`matchedCount`に影響させない。

`gray`行に有効な条件が設定されていない状態で、その行のHISTOGRAMボタンを起動した場合は、`filter`を省略して送信し、他fieldや他FilterItemの条件を適用せず、`gray`の有限数値を全件集計する。この場合の`matchedCount`は条件なしで一致した全欠陥行数、`numericValueCount`はそのうち`gray`が有限数値である行数とする。

```text
JSON Request
  ↓
field／operator／value検証
  ↓
Frontend field → DB field変換
  ↓
Normalized Filter
  ↓
SQLAlchemy WHERE条件
```

既存の`FilterModel`、`FilterItem`、`generate_filter_comps()`を可能な範囲で再利用する。ただし、既存処理が未知条件をスキップする場合は、ヒストグラムAPIでは事前に拒否する。

次は黙って無視せず422とする。

- 未知field
- Requestの`field`と`filter.field`の不一致
- 未知operator
- 変換不能な値
- operatorと値の形式不一致
- APIへ明示的に渡されたFilterItemの未成立・不正状態
- 未対応の複合条件

#### 既存処理との共通化境界

ヒストグラム機能では、既存DataGridのFILTERSと条件解釈が一致することを最優先とする。次の処理は、既存のFrontend／Backend実装を共通利用し、ヒストグラム専用の別解釈を作らない。

- MUI operatorからBackend `FilterOperator`への変換
- 選択された`FilterItem`のoperator・値の変換
- field名の変換（`width → sizeX`、`height → sizeY`等）
- 値の型変換・数値化
- 配列値やカテゴリ値の既存の扱い
- SQLAlchemyのWHERE条件生成

一方、次の処理はヒストグラムAPI固有の責務とする。

- ヒストグラムで許可するfieldの確認
- fieldごとの許可operatorの確認
- ヒストグラムRequestとして受け付ける値の型・有限性の確認
- 既存変換処理が未知条件をスキップする前の厳格な事前検証

共通処理が条件を解釈・変換できる場合でも、ヒストグラムRegistryで許可されていないfield／operatorは受け付けない。検証に失敗した場合は条件を省略せず、標準422形式で明示的に拒否する。

この境界により、既存DataGrid一覧機能の挙動は変更せず、ヒストグラム機能だけを厳格な契約として運用できる。将来、既存の条件変換処理を修正する場合は、DataGrid一覧とヒストグラムの双方へ影響する共通処理として、互換性を確認する。

### 2.10 通常集計

```text
1. 選択されたFilterItemの条件に一致する全件数を取得する。条件なしの場合は全欠陥行数を取得する
   → matchedCount
2. 対象fieldの有限数値を抽出
3. dataMin、dataMax、numericValueCountを算出
4. bin数を決定
5. edgesとcountsを生成
6. defectClass別countsを生成
7. Responseへ変換
```

bin数：

```text
binCount = max(10, min(100, round(sqrt(N))))
```

`N`は有限数値の件数とする。

例外：

```text
N = 0
  → edges=[]、counts=[]、categories=[]

dataMin === dataMax
  → 1bin
```

bin境界：

```text
[edge[i], edge[i + 1])
```

最後のbinだけ最大値を含める。

空binは`0`件として保持する。Response契約は次とする。

```text
通常結果では `edges.length === counts.length + 1`
category counts.length === counts.length
```

空結果では、`edges=[]`かつ`counts=[]`を許容する。

`matchedCount == 0`、または`matchedCount > 0`かつ`numericValueCount == 0`の場合も、画面上は正常な空結果として扱う。Backendは0件の理由を区別してログへ出力する。

数値fieldの`NULL`、`NaN`、`Infinity`、`-Infinity`は、ヒストグラムの欠陥数・bin・`numericValueCount`の計算対象から除外する。一方、`defectClass`の`NULL`・`-1`・未知値は、カテゴリ系列の`Unknown(-1)`として件数へ含める。

ログには次を含める。

- `resultName`
- 対象field
- `matchedCount`
- `numericValueCount`
- 適用した対象field FILTERSの件数（`filterCount`）
- 0件理由（FILTERS一致0件、対象fieldの有限数値0件など）

FILTERSの具体的な値は、原則としてログへ出力しない。

### 2.11 範囲別集計

通常binを再作成せず、指定範囲に対する正確な件数を返す。

内部分類：

```text
value < lower           → left
lower <= value <= upper → selected
value > upper           → right
```

API内部キーは`left`、`selected`、`right`とする。ただし、画面には内部名称を直接表示しない。

画面表示：

```text
left     → 下限未満
selected → 選択範囲
right    → 上限超過
```

### 2.12 Response契約

通常集計：

```ts
type DefectHistogramResponse = {
  dataMin: number | null;
  dataMax: number | null;
  edges: number[];
  counts: number[];
  categories: {
    categoryNo: number;
    counts: number[];
  }[];
  matchedCount: number;
  numericValueCount: number;
};
```

範囲別集計：

```ts
type DefectHistogramRangeResponse = {
  counts: {
    left: number;
    selected: number;
    right: number;
  };
  categories: {
    categoryNo: number;
    counts: {
      left: number;
      selected: number;
      right: number;
    };
  }[];
  matchedCount: number;
  numericValueCount: number;
};
```

空結果は正常Responseとする。

```json
{
  "dataMin": null,
  "dataMax": null,
  "edges": [],
  "counts": [],
  "categories": [],
  "matchedCount": 0,
  "numericValueCount": 0
}
```

`displayedCount`は通常APIに含めない。

### 2.13 カテゴリ

Backendはカテゴリ番号と件数だけを返す。初期実装では、名称・色・表示順はヒストグラムFeature内のカテゴリAtomで管理し、Hook経由で参照する。既存の`CLASS_NAMES`や他機能のカテゴリ設定は変更・連携しない。

```text
NULL、-1、未知値 → -1 / Unknown
0                → 0 / Unclassified
1～10             → 同じ番号 / CAT1～CAT10
```

既存DataGridでは`0`が空表示であるため、既存DataGridは変更しない。ヒストグラム専用表示では`0`を`Unclassified`とする。

出現したカテゴリだけをResponse・Chart・凡例へ含め、共通定義の表示順で並べる。通常の数値fieldではカテゴリ別積み上げ棒グラフを使用する。

### 2.14 Slider

モック版に合わせ、Sliderを値域の500分割とする。

```ts
const sliderMin = dataMin;
const sliderMax = dataMin === dataMax
  ? dataMin + 1
  : dataMax;
const sliderStep = (sliderMax - sliderMin) / 500 || 1;
```

- ヒストグラムbin数とSlider分割数は別物である。
- 内部値・API送信値は表示用丸めと分離する。
- 浮動小数誤差はstep単位へ補正する。
- 表示値はstepから表示桁数を決める。
- `lower`／`upper`という内部名は画面に表示しない。
- 画面には「選択範囲：10.25 ～ 20.75」のように表示する。
- 選択範囲の帯をドラッグすると、選択幅を維持したまま移動する。
- 選択範囲のドラッグ移動は全体値域内に補正し、ドラッグ中は表示だけを更新し、終了時に範囲別APIを即時取得する。
- 詳細表示では下限・上限を数値入力でき、入力確定時に即時反映する。
- 数値入力中はAPIを呼び出さず、入力確定時だけSlider・範囲状態を同期して取得する。
- 空値・不正値は現在値へ戻し、値域外は値域内へ補正する。
- 下限と上限は交差させない。
- 個別リセットとPanel全体の一括リセットを提供し、全体範囲へ戻したうえで即時取得する。
- binクリックおよびキーボード操作でも範囲を設定できる。
- binクリックおよびキーボード操作で範囲を設定した場合は、確定操作として範囲別APIを即時取得する。
- リセット先は、Item作成時のFILTERSスナップショットに対する新しい通常集計結果の全体範囲であり、DataGridのFILTERS自体を変更しない。

### 2.15 状態管理

ヒストグラムごとに独立した状態を保持する。

```ts
type DefectHistogramItemState = {
  histogramId: string;
  field: DefectHistogramField;
  filter?: FilterItem;
  histogramStatus: "idle" | "loading" | "success" | "error";
  rangeStatus: "idle" | "loading" | "success" | "error";
  result: DefectHistogramResult | null;
  range: DefectHistogramRange | null;
  rangeResult: DefectHistogramRangeResult | null;
  error: DefectHistogramError | null;
  logYAxis: boolean;
};
```

- 一覧のID・表示順は`defectHistogramListAtom`で管理し、Itemの詳細状態は`defectHistogramAtom(histogramId)`で管理する。
- 同じfieldでも起動ごとに別`histogramId`を発行する。
- 追加時にfieldと押下された単一FilterItemをsnapshot化する。
- 削除時は通信、debounce timer、状態、範囲別Cacheを破棄する。
- 通常集計と範囲別集計は独立して状態管理する。
- 古いRequestの結果が新しい状態を上書きしない。
- 通常集計を再取得した場合は、範囲別Cacheと実行中Requestをクリアし、Sliderの選択範囲を新しい全体範囲へリセットする。
- 範囲別Cacheと実行中Request MapはItem単位で保持し、Item間で共有しない。

### 2.16 Slider操作・通信制御

`onChange`：

1. Slider範囲を即時更新
2. 表示上の選択範囲を即時更新
3. 既存debounceを解除
4. 約180ms後に範囲別APIを呼び出す

`onChangeCommitted`：

1. debounceを解除
2. 最新範囲で範囲別APIを即時実行

初期表示では通常集計APIだけを呼び出し、Sliderの範囲状態は全体範囲で初期化する。範囲別APIはSlider操作、数値入力、bin選択、選択範囲のドラッグ移動、または詳細表示を開いたときに遅延取得する。

新しいRequestでは、実行中の範囲別Requestを一律にAbortしない。同じ範囲のRequestは共有し、異なる範囲のRequestは一時的に複数管理する。Request世代と範囲キーで最新結果を判定する。

- 完了済み範囲別結果は、範囲キー付きLRU Cacheで管理する。初期上限は1件とする。
- 実行中Requestは完了済みCacheとは別に管理し、複数保持できる。
- 完了済みCacheに範囲キーが一致する結果があればAPIを呼ばずに再利用する。
- 同じ範囲のRequestが実行中の場合は、既存Requestを共有して重複呼び出しを避ける。
- 最新操作の世代・範囲と一致するレスポンスだけを画面へ反映する。
- 最新操作と一致しない成功・失敗レスポンスは画面にもCacheにも反映しない。
- 範囲別APIのエラー結果は完了済みCacheへ保存しない。
- Item削除時は実行中Requestをキャンセルし、キャンセルできない結果も破棄する。

### 2.17 Chart

API ResponseをChart用Mapperで変換する。

```text
API DTO
  ↓
DefectHistogramResult
  ↓
DefectHistogramChartData
  ↓
MUI X Charts props
```

- MUI X ChartsのBarChartを使用する。
- 数値fieldではカテゴリ別BarSeriesを同一stackで積み上げる。
- X軸のbin識別情報は内部的に保持する。
- X軸の目盛り・ラベルは常時表示しない。
- Tooltipではbin範囲、カテゴリ別件数、合計件数を表示する。
- 詳細表示では、総計およびカテゴリ別に、下限未満・選択範囲・上限超過の件数と割合を表示する。
- 詳細表示には対数Y軸スイッチを設け、カテゴリ別グラフへ適用する。総計グラフは線形表示とする。
- 対数表示では`log10(1 + count)`で棒の高さを計算し、0件も表示可能とする。目盛り・Tooltip・件数表示は実件数を使用する。
- 対数Y軸スイッチの状態はItem単位で保持し、詳細ダイアログを閉じても維持する。Item削除時に破棄する。
- binクリックでbin範囲を選択範囲へ設定する。
- 選択範囲の帯をドラッグすると、選択幅を維持したまま範囲全体を移動する。
- `edges`と`counts`の対応をMapperで検証する。
- 空結果はChartではなくEmptyStateを表示する。
- 数値表示はstepに応じた小数桁と桁区切りを使用し、表示上の丸めは内部値・API送信値へ影響させない。

### 2.18 画面表示状態

```text
loading → Loading表示
error   → Error表示
empty   → No data表示
success → Chart表示
```

詳細ダイアログを閉じても、通常集計結果とヒストグラムItemは削除しない。

範囲別APIエラー時は、Sliderと選択範囲を維持し、範囲別件数部分にエラーを表示する。専用の再試行ボタンは設けず、範囲変更または詳細表示の再オープンを再取得契機とする。

通常集計APIエラー時は、ItemのChart領域をエラー表示へ置き換える。範囲別APIエラー時は、ChartとSliderを維持したまま範囲別件数部分だけをエラー表示とする。

### 2.19 DB読み取りスナップショット

次の2種類を区別する。

```text
条件スナップショット
  = HISTOGRAM起動時点のFILTERSを固定

データ読み取りスナップショット
  = 1回の集計処理中にDB読み取り対象を固定
```

Backendでは、`matchedCount`、対象値、カテゴリ値を同じ読み取りトランザクション／読み取り一貫性の範囲で扱う。

### 2.20 認証・エラー

- 既存の`session_id` Cookie認証を使用する。
- 401時は既存Frontendのky共通処理を利用する。
- POST＋JSONに伴うCSRF追加対策は今回の内部Web・Read API前提では追加しない。
- 公開範囲が変わる場合は再検討する。

HTTP分類：

```text
JSON構造・型不正              → 422
field／operator／値の意味的不正 → 422
Result不存在                  → 404
認証失敗                      → 401
予期しないDB・処理障害         → 500
```

ヒストグラムAPIのエラーResponseは、既存API全体の形式統一を目的とせず、当該APIの範囲で次の方針とする。

- FastAPI標準の`HTTPException`を使用し、エラー本文は原則`{"detail": ...}`とする。
- Request Validationの422は、既存共通ハンドラーが返す標準形式に従う。
- 未知field・未知operator・値不正・許可されない条件は422とする。
- Resultまたは必要なデータソースが存在しない場合は404とする。
- DB障害・予期しない内部処理エラーは500とする。
- SQL文、スタックトレース、FILTERSの具体値などの内部情報はResponseへ含めない。
- Frontendは`detail`を表示用エラーへ変換し、通常集計と範囲別集計のエラー表示領域を分ける。

## 3. Backend UT方針

### 3.1 Request Model

- field未指定・空文字
- `filter`省略時に条件なしとして全件集計すること
- `filter.field`と集計対象`field`の不一致を422で拒否すること
- 指定されたFilterItemの未成立・不正状態を422で拒否し、全件条件へ読み替えないこと
- extra property
- lower／upperの型不正
- lower > upper
- NaN・Infinity

### 3.2 Registry・FILTERS

- `width → sizeX`
- `height → sizeY`
- 未知field・未知operator
- 変換不能値
- 値不要operator
- 値必須operatorの値欠落
- 対象fieldと既存DB fieldの対応

### 3.3 HistogramCalculationService

- 空入力
- 同一値
- 正負・小数・大きな値
- bin数の最小・最大
- 空bin
- 最大値の最後binへの包含
- `None`、NaN、Infinity、-Infinity
- カテゴリ番号変換
- 通常集計の不変条件
- 範囲境界の包含規則
- lower == upper

### 3.4 Provider・API

- FILTERS適用
- FilterItem条件未設定時の全件集計
- 条件未設定時に他FilterItem／他field条件が適用されないこと
- 通常集計API・範囲別集計APIの双方で、FilterItemと集計fieldの不一致を422で拒否すること
- 全件matchedCount
- ページング・ソート非依存
- 通常／範囲別のFILTERS一貫性
- 空DB
- DB障害
- 422／404／401／500

## 4. Frontend UT方針

- Frontend field Registry
- API ClientのPOST＋JSON
- Request／Response Mapper
- `edges`／`counts`変換
- カテゴリ名称・色・表示順
- Sliderの500分割、同一値、小数値
- Slider値の浮動小数補正
- Atomの追加・削除・snapshot
- 複数Itemの独立状態
- Query ServiceのAbort・競合制御・エラー伝播
- Hookの初回取得・debounce・commit
- 古いResponseの破棄
- Empty／Loading／Error表示
- Chartへ渡すseries・Tooltipデータ

MUI X Charts内部の描画を検証するのではなく、Chartへ渡すpropsとMapper結果を中心に検証する。

## 5. 補足・将来拡張・実装時確認事項

### 5.1 将来拡張時の要件確認事項

以下は初期実装には含めず、将来拡張時に要件担当者へ確認して正式確定する項目である。初期実装のAPI契約・FILTERS適用範囲・画面動作は、2章の確定事項に従う。

#### 5.1.1 ヒストグラム集計に適用するFILTERSの範囲

初期実装の適用範囲は確定済みである。HISTOGRAMボタンが配置されたFilterItemの条件だけをスナップショット化し、集計条件へ適用する。同じfieldの別FilterItem、他fieldのFilterItem、およびそれらを組み合わせたAND／ORの複合条件は適用しない。

例：

```text
defectClassName = CAT1  （ヒストグラム対象外）
gray > 100               （HISTOGRAMボタン押下対象）
gray <= 500              （同じfieldだが、ボタン未押下）
```

この状態で`gray > 100`のFilterItemに配置されたHISTOGRAMボタンを起動した場合、現設計では`gray > 100`だけを適用し、`defectClassName = CAT1`と`gray <= 500`は適用しない。

これは将来拡張時の要件確認事項として引き継ぐ。

- 選択したFilterItem以外の条件を、将来の拡張でヒストグラムへ引き継ぐか
- 同じfieldの複数FilterItemをAND／ORで複合適用するか
- 他fieldのFILTERSを、将来の拡張で集計条件へ追加するか

#### 5.1.2 範囲選択の画面反映範囲

初期実装の範囲は確定済みである。Slider・数値入力・bin選択・範囲ドラッグで変更した範囲は、ヒストグラムItem内の状態と範囲別APIにだけ使用し、DataGridやレーダーマップへ反映しない。

範囲選択を一覧・レーダーマップの絞り込み条件として連動させるかは、将来拡張時の要件確認事項として引き継ぐ。

#### 5.1.3 ヒストグラム専用の再試行導線

初期実装の方針は確定済みである。専用の再試行ボタンを設けず、範囲変更または詳細表示の再オープンを再取得契機とする。

障害時に明示的な再試行操作を追加するかは、将来拡張時の要件確認事項として引き継ぐ。

### 5.2 確定済み技術方針：Backendファイル配置

既存の`webapp`／`mbmmi`の責務分担に合わせ、次の配置を基本方針とする。

```text
webapp/routers/api/defect_histogram.py
mbmmi/histogram/
  calculation.py
  models.py
  registry.py
  service.py
  providers/
    result.py
```

RouterはHTTP受付・依存性注入・Response変換に限定する。`mbmmi/result`のORM・ResultPath・既存DB部品は再利用し、ヒストグラム固有のService、Calculation、Registry、Result用Providerは`mbmmi/histogram`へ集約する。実装時は既存パッケージの命名・テスト配置に合わせてファイル名を最終確認する。

### 5.3 確定済み技術方針：FILTERS operatorの照合

ヒストグラム対象13数値fieldについて、既存の`getGridNumericOperators()`が提供するoperator集合を許可する。Backendに定義されているが、既存DataGridから生成されないoperatorは追加許可しない。

数値fieldからDB fieldへの変換も既存処理を利用する。`width → sizeX`、`height → sizeY`を含め、ヒストグラム専用の別解釈は設けない。

### 5.4 確定済み技術方針：ヒストグラム対象外field

`defectClassName`、`caughtBy`、`layers`、`src`は、今回のヒストグラム対象fieldおよびヒストグラム固有operator検討の対象外とする。`defectClass`は横軸ではなくカテゴリ系列としてのみ扱う。

### 5.5 実装時技術検証：NULL・NaN・Infinityの実データ

`Defect` ORMの数値列は原則`nullable=False`で定義されているが、ProviderはORM定義だけを信頼せず、取得値を検証する。数値fieldの`NULL`・`NaN`・`Infinity`・`-Infinity`は計算対象から除外し、`defectClass`の未定義・未知値は`Unknown(-1)`へ正規化する。実装時に、実DBのスキーマ・代表データを確認し、併せて異常値を含むテストFixtureで除外動作を検証する。

### 5.6 確定済み技術方針：DB集計とヒストグラム計算の責務分離

初期実装は、SQLite用Provider／AdapterでFILTERS適用と必要値の取得を行い、bin・カテゴリ・範囲別件数はPythonの`HistogramCalculationService`で計算する。

DB接続、SQL、FILTERS適用、値取得はProvider／Adapterの責務とし、SQLiteからDuckDBなどへ変更する場合も、DBごとの実装をProvider／Adapter内へ閉じ込める。ヒストグラム計算仕様、API契約、Frontend状態管理はDB製品に依存させない。

将来の性能改善でSQL側またはDuckDB側へ集計処理を移す場合も、Response契約と`HistogramCalculationService`の計算仕様を基準として互換性を確認する。

### 5.7 確定済み技術方針：ResponseエラーJSON

ヒストグラムAPIでは、既存API全体のエラー形式は変更せず、2.20記載の形式を採用する。ヒストグラム専用エラーコードは初期実装では付与しない。

### 5.8 初期確定・将来未確定：カテゴリ定義の配置

初期実装では、ヒストグラムFeature内のAtomでカテゴリ名称・色・表示順を管理し、Hook経由で各表示コンポーネントから参照する。既存の`CLASS_NAMES`や他機能のカテゴリ設定とは連携しない。将来、他機能からカテゴリ名称・色・表示順を設定できる共通定義または外部設定へ接続するかは未確定事項とする。

### 5.9 確定済み技術方針：DataGrid操作の実装箇所

数値列のHISTOGRAM操作は、既存の`DefectViewColumns`からFilterOperatorへ専用InputComponentを注入する方式で実装する。DataGrid Toolbarや列メニュー等の別導線は追加しない。

### 5.10 初期確定・実装時確認：Panel配置・高さ

レーダーマップとヒストグラムPanelを上下分割し、Panel初期高を約480px、境界をドラッグ調整可能とする方針は確定した。既存の`Allotment vertical`を再利用し、ヒストグラム側Pane内だけを縦スクロール可能とする。実装時に、親Layoutの`height: 100%`／`min-height: 0`、Paneの`minSize`／`maxSize`、Panel内`overflow: auto`が成立することを確認する。具体的なCSS値は実装時に既存Layoutとの整合性を見て決定する。

### 5.11 確定済み画面方針：Summary・詳細表示

通常表示ではTooltipにbin範囲・合計件数・カテゴリ別件数を表示する。詳細表示では、総計およびカテゴリ別に、下限未満・選択範囲・上限超過の件数と割合を表示する。

画面表示では内部名を使わず、次の日本語を使用する。

```text
left     → 下限未満
selected → 選択範囲
right    → 上限超過
```

### 5.12 確定済み画面方針：再試行・通知

ヒストグラム専用の再試行ボタンは設けない。通常集計エラーはItem内に表示し、範囲別集計エラーは範囲別件数部分に表示する。範囲変更または詳細表示の再オープンを再取得契機とする。

### 5.13 確定済み技術方針：範囲別Cache

完了済み範囲別結果は、範囲キー付きLRU Cacheで管理する。初期上限は1件とし、将来の保持数変更に対応できる構造とする。実行中RequestはCacheとは別に複数保持できる。

### 5.14 正式版作成時の確認事項

本書へ、現時点で確定した方式・表示・操作・通信制御・レイアウト方針を反映済みとする。Chartの幅・高さ・縦並び切替は、320px／280px／640pxを初期基準値として設計に記載し、実装時に実画面で可読性・操作性を確認する。残る事項は、カテゴリ定義の既存共通定義との接続、親LayoutのCSS成立性確認、Chart初期基準値の実画面確認、実装時のテスト配置確認である。

### 5.15 実装時技術検証：UTの物理配置

UTの対象・観点は3章・4章で定義する。テストファイルの物理配置は、実装時にBackendのpytest実行構成、FrontendのVitest実行構成、既存ディレクトリ規約を確認して決定する。物理配置が未確定であることは、UT対象の未定義を意味しない。

## 6. GOサイン後の実装順序

1. Backend／Frontendのfield Registryと型契約
2. Backend Request／Response Model
3. Backend Router／Service／Provider／Calculation
4. Backend UT
5. Frontend API Client／DTO／Mapper
6. Frontend Atom／Query Service／Provider
7. `useDefectHistogram`
8. DataGrid HISTOGRAM操作
9. Panel／List／Item／Chart／Slider／Dialog
10. Frontend UT
11. 型チェック・Lint・Build・対象テスト
12. 既存機能への影響確認

### 6.1 実装引き継ぎ事項

- Backendは`webapp/routers/api/defect_histogram.py`をHTTP境界とし、ヒストグラム固有処理は`mbmmi/histogram`へ配置する。
- 既存`mbmmi/result`のORM・ResultPath・DB接続部品を再利用し、`Defect` ORMやResult用DBパスを再定義しない。
- API Requestは押下された単一`FilterItem`を`filter`として受け取り、Backend内部で既存のFilterModel変換へ接続する。
- SQLite ProviderはFILTERS適用と必要値取得を担当し、bin・カテゴリ・範囲別件数は`HistogramCalculationService`で計算する。
- FrontendはカテゴリAtomを参照専用として管理し、Hook経由でChart・凡例・詳細表示へ提供する。
- 既存の`DefectViewColumns`／FilterOperator／InputComponentによるHISTOGRAM導線を再利用する。
- 通常集計と範囲別集計のCache、Request世代、Abort、古いResponse破棄をItem単位で管理する。
- `Allotment vertical`を再利用し、ヒストグラムPane内だけをスクロール可能にする。

### 6.2 UT引き継ぎ事項

- BackendのRegistry・Request検証・FilterItem変換・計算・Provider・APIエラーを分離して検証する。
- 数値fieldのNULL／NaN／Infinity除外と、`defectClass`未知値の`Unknown(-1)`正規化を検証する。
- FrontendのAtom・Mapper・Query Service・Hook・Cache・debounce・Request競合を検証する。
- 複数Itemの独立性、追加・削除、通常／範囲別エラー、空結果表示を検証する。
- Chartそのものの描画ではなく、Mapper結果とChartへ渡すpropsを検証する。
- テストファイルの物理配置は、実装時に既存のpytest／Vitest構成へ合わせて決定する。

## 7. 現時点の結論

初期実装は、通常Result系のヒストグラム対象field FILTERSに一致する全データをBackendで集計し、POST＋JSONでFrontendへ返す方式とする。

外部公開名・画面機能名・状態管理名は`DefectHistogram`で統一する。欠陥に依存しないbin・範囲・件数計算だけを`HistogramCalculationService`として共通化する。

Frontendは、複数の`DefectHistogramItem`をレーダーマップ下部へ縦方向に表示し、ヒストグラム領域をスクロール可能とする。Backend Providerと将来WASM Providerの差し替え境界を維持する。

本書は、初期実装の設計基準として確定した正式詳細設計書である。実装時に確認する技術検証事項の結果が仕様変更に影響する場合は、変更理由と影響範囲を記録したうえで本書を改訂する。
