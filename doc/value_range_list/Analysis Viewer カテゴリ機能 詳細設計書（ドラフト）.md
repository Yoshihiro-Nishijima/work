# Analysis Viewer カテゴリ機能 詳細設計書

## 1. 文書の位置付け

本書は、Analysis Viewerの絞り込み条件エリアにおけるCategories機能（開発第2弾）の詳細設計書である。

Categories第2弾では、カテゴリのUI操作、選択状態、カテゴリ表示定義、Category Setting、
後続の各種連携で利用する型・Atom・Custom Hookの境界を定義する。

Histogram、Filters、Defect List、Wafer Mapなどとの実際の条件適用・再取得・同期処理は、
第4弾「各種連携」で実装する。

## 2. 開発単位上の責務

Analysis Viewerの絞り込み条件エリアは、次の4単位に分けて開発する。

1. Histogram
2. Categories
3. Filters
4. 各種連携

Categories第2弾の責務は次のとおり。

- カテゴリ一覧の表示
- カテゴリの選択・解除操作
- カテゴリ定義の表示
- Category Settingの編集状態管理
- カテゴリ定義の取得・保存境界
- 後続連携へ渡す選択状態・条件モデルの公開

第2弾では、次を実装しない。

- Histogramの再Query
- Defect Listの再取得
- Wafer Mapの再取得・再描画
- Filters／Slider／Categories条件の共通条件への実統合
- Area・カテゴリ選択条件のBackend Queryへの変換
- 複数Feature間のLoading／Error同期

## 3. カテゴリの対象範囲

### 3.1 対象カテゴリ

Categoriesの画面表示・件数表示・選択対象は、次のカテゴリとする。

- `UndefinedCategory`（内部値`0`、画面表示`undefined`）
- 通常カテゴリ`1`〜`10`

### 3.2 対象外カテゴリ

`Unknown`（内部値`-1`）は、Categoriesの画面表示・件数表示・選択対象外とする。

ただし、`-1`は既存Histogramなどの内部分類として存在し得るため、
既存Feature側の内部データから除去することは本設計の対象外とする。

### 3.3 UndefinedCategoryの命名

既存実装では、内部値`0`がFeatureにより`Unclassified`または`undefined`と表示されている。
Categoriesでは名称を統一し、次の対応とする。

| 項目 | 定義 |
|---|---|
| 内部値 | `0` |
| 内部の正式名称 | `UndefinedCategory` |
| 画面表示名 | `undefined` |

`undefined`はJavaScriptの未指定値を表す値としては使用せず、
カテゴリの表示ラベルとして扱う。

## 4. Areaの概念

### 4.1 Areaの意味

CategoriesのAreaは、装置・Resultデータ上の`Inspection Area`（撮像領域）を指す。

ウェーハ上のChip／Dieには複数のInspection Areaが設定され得る。
Areaごとに異なるCategoryや検査パラメータを設定できる。

`CareArea`は、撮像した画像のうち実際に検査する範囲を示す別概念であり、
CategoriesのAreaモデルには含めない。

### 4.2 AreaKey

既存Backendでは、Inspection Areaは`areaNo`で識別される。
`mps`テーブルの`areaNo`が主キーであり、`msrs`、`fovs`、`images`などのデータから参照される。

Categoriesでは、次の対応を採用する。

```text
AreaKey = areaNo
```

Areaの一意性は、対象Result内の`areaNo`を基準とする。
`areaNo`が全Result・全装置でグローバルに一意であることは前提としない。

### 4.3 Areaの表示

既存実装には、Area名称を保持する名称マスタや名称フィールドは確認できない。
そのため、現時点の表示名は次の表示規則で生成する。

```text
areaNo = 1 → Area 1
areaNo = 2 → Area 2
```

Area数は固定せず、対象Resultから取得したArea一覧に応じて扱う。
Appendixに記載されたArea1〜Area3は、固定仕様ではなく表示例として扱う。

## 5. カテゴリ定義の識別単位

カテゴリ定義を取得・保存する際の対象Resultは、APIの`resultKey`で指定する。
カテゴリ定義の対象内での識別キーは、次の組み合わせとする。

```text
APIスコープ：resultKey
定義識別：AreaKey（areaNo）＋ categoryNo
```

`resultKey`は画面表示およびAPI取得・保存の対象を示す。
カテゴリ定義の永続化スコープをResult単位とするか、複数Resultで共有するかは、
本書では未確定とする。

同じ`categoryNo`であっても、Areaが異なれば別のカテゴリ定義として扱う。
したがって、Areaごとに次の表示属性を変更できる。

- カテゴリ名
- Comment
- 色・色パターン
- アイコン

カテゴリ番号、表示順、欠陥数、チェック状態は保存対象のカテゴリ定義には含めない。

### 5.1 カテゴリ情報の管理単位

カテゴリ情報は`AreaKey × categoryNo`単位で管理する。
同じ`categoryNo`が複数Areaに存在する場合も、Area単位の別カテゴリとして扱う。

Categories一覧におけるAreaの表示範囲、Areaの明示方法、Category Settingとの連携方法は
未確定事項として扱う。管理単位が`AreaKey × categoryNo`であることと、
画面上で全Areaを同時に表示することは同義としない。

## 6. 選択状態

### 6.1 保持単位

カテゴリ選択状態は、Area単位に分離して保持する。

概念モデルは次のとおり。

```ts
Map<AreaKey, Set<CategoryNo>>
```

選択キーは`AreaKey`と`categoryNo`の組み合わせであり、
`UndefinedCategory（0）`および通常カテゴリ`1`〜`10`を指定できる。

### 6.2 初期選択状態

Categories初回表示時は、対象カテゴリを全て選択済みとする。

- 全Area・全カテゴリ選択状態：カテゴリ条件なし
- 一部選択状態：選択された`AreaKey × categoryNo`の集合を保持
- 全解除状態：カテゴリ条件なしとして扱う

したがって、特定Areaの全カテゴリを選択し、他Areaのカテゴリを選択しない状態は、
「そのAreaの欠陥のみを表示する」条件として表現できる。
たとえばArea 2のカテゴリ1〜10を選択した場合は、Area 2に属するカテゴリ1〜10を
対象とする。Area 1のカテゴリを追加選択した場合は、Area 1の選択カテゴリも対象に含める。

全選択・全解除の専用操作の有無や配置は、カテゴリ一覧の表示単位・レイアウト確定後に決定する。

### 6.3 選択状態と表示定義の分離

カテゴリ表示定義とチェック状態は別状態として管理する。

- 表示定義：永続化対象
- チェック状態：画面内の一時状態。永続化しない

カテゴリの選択・解除はCategories第2弾のUI操作および状態管理の対象とする。

### 6.4 Area間の条件合成

Categoriesの選択条件は、選択された`AreaKey × categoryNo`を正規化した
`categoryConditions`として第4弾へ公開する。

```ts
type DefectCategoryCondition = {
  areaKey: AreaKey;
  categoryNo: CategoryNo;
};
```

`categoryConditions`は選択対象の配列であり、同一Area内・Area間のAND／ORなどの
論理規則を配列の形や並び順に埋め込まない。論理規則と`defectClass`への変換は、
親機能の共通条件解決層で扱う。

### 6.5 外部参照用の公開情報と変換境界

Categoriesは、外部Featureが参照するカテゴリ情報の正本として、確定済みのカテゴリ表示定義を
共有する。共有対象には、少なくとも次を含める。

- `AreaKey`
- `categoryNo`
- カテゴリ名
- Comment
- 色
- アイコン
- 色パターン

カテゴリ選択状態もCategoriesが保持し、後続連携へ公開する。
UI操作用の`categorySelectionByArea`と、親機能へ公開する`categoryConditions`は、
別の型・境界で扱う。

```text
Categories
  ├─ 確定済みカテゴリ表示定義（共有・参照用）
  ├─ categorySelectionByArea（UI操作用）
  └─ categoryConditions（親機能への公開用）
```

`defectClass`はCategoriesの公開モデルに含めない。`categoryNo`から`defectClass`への
変換は、親機能の共通条件解決層で一元管理する。

## 7. Category Setting

### 7.1 編集・保存単位

Category Settingは、対象Resultに含まれる全Inspection Areaを対象とし、
Areaごとの全対象カテゴリを編集できる。

画面上はArea単位の切り替えまたはグルーピングにより、全Areaのカテゴリ定義を
編集可能とする。Area切り替え時に、切り替え前Areaの編集状態を保持する。

Apply時は、現在表示中Areaの全カテゴリ定義を一括保存する。
変更されたカテゴリだけでなく、未変更カテゴリも既定値を含む完全な定義として保存する。

### 7.2 未設定カテゴリ名

未設定のカテゴリ名は、入力欄の実値を空欄とし、MUI TextFieldの`placeholder`として
既定名称を灰色表示する。

Apply時にカテゴリ名が空欄の場合は、既定名称へ補完して保存する。
Commentの空欄は空文字として保存する。

### 7.3 Apply後の反映

Apply成功後は、次の状態を即時更新する。

- Categories一覧が参照する確定済み表示定義
- Category Settingの現在の確定値
- 後続の各種連携が参照する共有カテゴリ定義・選択状態

ただし、Histogram・Defect List・レーダーマップの再Query・再取得・再描画は
第4弾「各種連携」で実装する。

### 7.4 編集状態とArea切り替え

Category Settingでは、確定済みカテゴリ定義を編集開始時の基準として、
Areaごとに編集下書きを保持する。入力中の変更はApplyが成功するまで、
Categories一覧や他Featureが参照する確定済み表示定義へ反映しない。

- 全Areaを編集対象とし、Area切り替え時も切り替え前Areaの未保存編集を保持する
- Apply対象は現在表示中のAreaだけとする
- 現在表示中Areaに未保存変更がある場合だけApplyを有効にする
- 非表示Areaの未保存変更は、そのApplyでは保存しない
- Apply成功時は、保存した下書きを確定済みカテゴリ定義へ反映する
- Apply成功後のCategory Settingの表示は、確定済みカテゴリ定義を現在値として扱う
- Close時は全Areaの未保存下書きを破棄する
- 未保存変更の破棄確認Dialogは表示しない

### 7.5 取得・保存中の操作

Category Settingを開いた時点で、対象Resultの全Inspection Area分のカテゴリ定義を
一括取得する。Area切り替え時の追加取得は行わない。

- 全Area定義の取得中：編集・Area切り替え・Applyを無効にする
- 保存中：Apply対象Areaの編集を無効にする
- Loading表示・成功／失敗通知は既存の流儀を利用する
- 専用のLoading Dialog・Error Dialogは追加しない
- 409競合時は編集内容を保持し、再編集・再試行可能とする
- 入力検証エラー時は保存を実行せず、下書きを保持して修正後に再Applyする
- 通信エラー時は既存のToast・エラー抽出を利用し、下書きを保持して再試行する

### 7.6 未保存定義の既定値補完

保存済み定義が存在しないカテゴリは、Frontendが既定値を補完して表示する。
入力中の変更はApplyが成功するまで確定済み状態へ反映しない。
Apply時はFrontendが完全な定義を送信し、Backendが再検証・必要な補完・正規化を行って保存する。
Apply成功時は、Backendが確定した完全な定義を返し、Frontendの共有状態を更新する。

- カテゴリ名：空欄時は既定名称
- Comment：空文字を許容
- アイコン：既定値を表示
- 基本色：既定値を表示
- 色パターン：Areaの既定値を表示

アイコン・基本色・色パターンは、候補から選択した値そのものを保存する。
`categoryNo`から保存値を再生成する方式にはしない。

### 7.7 CategoryName／Commentの入力制約（暫定）

CategoryNameおよびCommentの入力制約は、ユーザビリティに関わるため、
要件担当または顧客への確認結果をもって確定する。

確認前の暫定仕様は、既存の入力項目に合わせ、次の制約を適用する。

- 最大40文字
- 英数字、`_`、`-`のみ許可
- 改行は許可しない
- CategoryNameは空欄時に既定名称へ補完する
- Commentは空文字を許可する

文字数はUTF-8のバイト数ではなく、Unicode文字数を基準とする。
アプリケーション上はUnicode文字列として扱い、通信・保存時のエンコーディングは
既存システムの標準に従う。既存標準がUTF-8の場合はUTF-8を使用し、EUC等への変換が
必要な場合は外部入出力境界で実施する。

要件確認後、最大文字数、使用可能文字、改行の可否、Unicode文字の許容範囲を
確認結果に合わせて更新する。FrontendとBackendの両方で同一の制約を検証する。

## 8. API・永続化の設計方針

### 8.1 取得

取得APIは、`resultKey`を対象スコープとして全Areaのカテゴリ定義一式を返す。
Endpoint候補は次のとおりとする。

```text
GET /results/{resultKey}/category-definitions
```

ResponseはArea単位でグループ化し、各Areaに次の項目を持たせる。

- `areaKey`
- `createdAt`
- `updatedAt`
- `categories`

`categories`にはカテゴリ0〜10の完全な定義を格納する。各カテゴリ定義は、
`categoryNo`、`categoryName`、`comment`、`icon`、`color`、`colorPattern`を持つ。
`resultKey`はAPIパスまたはResponse全体のスコープとして扱い、各カテゴリ定義へ重複して保持しない。

### 8.2 保存

保存APIは、`resultKey`と対象`areaKey`を指定する。Endpoint候補は次のとおりとする。

```text
PUT /results/{resultKey}/areas/{areaKey}/category-definitions
```

ApplyのRequestは、カテゴリ0〜10の全定義と、取得時点の対象Areaの`updatedAt`を送信する
完全置換形式とする。

保存はArea内のカテゴリ群を単位とする原子更新とする。
成功時は、対象Areaのカテゴリ0〜10のBackend確定済み完全定義と、新しい`updatedAt`を
Area単位で返す。FrontendはResponseを確定済み共有状態とCategory Settingの現在値へ反映する。

### 8.3 競合

保存時に、Requestの`updatedAt`と現在保存されている対象Areaの`updatedAt`が
一致しない場合は`409 Conflict`とする。

楽観ロックはArea単位で行い、別Areaの更新は競合させない。
`createdAt`と`updatedAt`はBackendがUTCの日時として管理する。
初回保存時に`createdAt`と`updatedAt`を設定し、更新成功時は`updatedAt`だけを更新する。

409 Conflictの場合は、競合を示すエラー情報と最新の`updatedAt`などの競合情報を返す。
Frontendは編集中の下書きと入力内容を破棄せず、再編集・再試行できる状態を維持する。

APIエラーは既存のエラーResponse形式を踏襲する。

- 入力検証エラー：項目単位のエラー情報
- `409 Conflict`：競合情報と最新`updatedAt`
- その他の通信・サーバーエラー：既存の共通エラー形式

### 8.4 DTOの型表現

`icon`と`colorPattern`はBackend／Frontend双方で列挙値として検証し、
API上は既存規約に合わせた文字列で表現する。
`createdAt`と`updatedAt`はBackend管理のUTC ISO 8601文字列とする。

Frontendは未設定カテゴリの既定値を表示上補完するが、保存時は空欄を含む完全定義を送信する。
Backendは保存時に再検証・既定値補完・正規化を行う。

## 9. 件数表示

カテゴリ件数はCategoriesが独自集計せず、親Featureまたは後続連携から受け取る。
件数はSnapshotとFilter／Slider条件を基準とし、Categories自身の選択状態は含めない。

- 正常取得した0件：`0`
- 未取得または取得失敗：`—`

カテゴリ定義の取得状態と件数の取得状態は分離する。
カテゴリ定義を取得できていれば、件数が未取得・失敗でも一覧表示を継続する。

## 10. Appendixとの対応

カテゴリの基本アイコンはAppendixに示された10種類を使用する。

- Circle
- Triangle
- Inverted Triangle
- Square
- Diamond
- Right Chevron
- Left Chevron
- Star
- Right Triangle
- Left Triangle

基本色はAppendixに示された次の10色を使用する。

```text
#1f77b4
#ff7f0e
#2ca02c
#d62728
#9467bd
#8c564b
#e377c2
#7f7f7f
#bcbd22
#17becf
```

Areaごとの色表現は、Appendixの次の3パターンを前提とする。

- Area1：単色
- Area2：縦ストライプ
- Area3：横ストライプ

ただし、色パターンの描画仕様、Area4以降の扱い、具体的な表示生成式は、
追加の設計論点として扱う。

## 11. 既存実装から踏襲する方針

次の既存実装パターンを踏襲候補とする。

- `areaNo`を取得してArea一覧を管理する既存Frontend／Backendの構成
- Feature、Component、Custom Hook、APIの責務分離
- ComponentからAtom・APIを直接利用しない構成
- ADCアノテーションのHookへの状態管理・API制御・エラー処理の集約
- 既存のToast、エラー抽出、Abort制御、Loading表示の流儀
- 既存のカテゴリシンボル描画実装の再利用

ただし、既存Histogramのカテゴリ定義HookはHistogram表示用の定義であり、
Area、Comment、選択状態、Category Settingの編集状態を保持しない。
Categoriesの状態管理へはそのまま流用しない。

### 11.1 React／Hook／Atomの責務

CategoriesはReact Context Providerを導入せず、既存実装に合わせた
Thin Component／Fat Hook方式とする。

メインHookは`useCategories`とし、Feature単位で関連状態・操作をまとめて公開する。
Hook内部では、次の状態を別Atomとして管理する。

- `categoryDefinitions`：確定済み表示定義
- `categorySelectionByArea`：`Map<AreaKey, Set<CategoryNo>>`の選択状態
- `draftCategoryDefinitions`：Category Settingの下書き
- `definitionFetchState`：定義取得状態
- `definitionSaveState`：定義保存状態
- `categoryCountFetchState`：件数取得状態

確定済み定義と下書きは、次の構造で管理する。

```ts
Map<AreaKey, Map<CategoryNo, CategoryDefinition>>
```

`CategoryDefinition`はカテゴリ単位の表示・保存定義であり、名称、Comment、色、
アイコン、色パターン等を含む。チェック状態、件数、`defectClass`は含めない。

`useCategories`は、一覧・Category Setting・後続連携が必要とする値と操作を公開する。

```ts
useCategories()
  ├─ categoryDefinitions
  ├─ categorySelectionByArea
  ├─ draftCategoryDefinitions
  ├─ categoryConditions
  ├─ categoryCounts
  ├─ currentAreaKey
  ├─ definitionFetchState
  ├─ definitionSaveState
  ├─ categoryCountFetchState
  ├─ toggleCategory()
  ├─ resetCategorySelection()
  ├─ updateDraftCategoryDefinition()
  ├─ applyCategorySetting()
  └─ closeCategorySetting()
```

ComponentはHookが公開する値・操作だけを利用し、AtomやAPIを直接参照しない。
`resetCategorySelection`は選択状態を初期状態へ戻す操作であり、Category Settingに
Resetボタンを追加するものではない。

### 11.2 Result変更・取得失敗・Category Settingのライフサイクル

Result変更時は、旧Resultの定義、選択状態、下書き、取得・保存・件数状態を初期化し、
新しい`resultKey`で全Area取得を開始する。取得成功後に次の順で初期化する。

1. Backendの確定済み定義を`categoryDefinitions`へ反映
2. 対象カテゴリを全選択状態として`categorySelectionByArea`を生成
3. 確定済み定義から`draftCategoryDefinitions`を生成

新Resultの取得に失敗した場合は、定義・選択状態を未初期化のまま保持し、
既存のエラー表示を利用して再取得可能とする。旧Resultの状態は復元しない。

Category SettingのClose時は全Areaの未保存下書きを破棄する。
再Open時はBackendへ再取得せず、共有済みの確定済み定義から下書きを再生成する。
Apply成功時はBackend Responseを確定済み定義と現在値へ反映する。

全Area定義の取得中は一覧・Area切替・編集・Applyを無効化する。
保存中は保存対象Areaの編集・Applyを無効化し、Closeと他Areaの参照は許可する。

## 12. 未確定事項

以下は本書更新時点では未確定とする。
新たに要件担当または顧客の判断が必要な事項が判明した場合は、
明示的な依頼がなくても本節へ追加する。

確認前の暫定方針を置く場合は、その内容と、確認結果により更新する対象を併記する。

### 12.1 要件担当・顧客への確認事項

要件確認済みの事項は次のとおりである。

- AreaはInspection Areaを指す
- Category Settingは全Area × 全カテゴリを編集対象とする
- 特定Areaの欠陥のみを表示する場合は、そのAreaの必要カテゴリを選択する

#### 1. Categories一覧とCategory Settingの画面利用イメージ

案1・案2の記載だけでは、Categories一覧におけるAreaの扱いと、
Category Settingとの画面連携が確定できないため、次を確認する。

- Category SettingでAreaを選択した場合、Categories一覧には選択Areaのカテゴリだけを表示するのか
- Categories一覧に全Area × 全カテゴリを同時に表示し、Areaを明示してカテゴリを選択するのか
- 全Area × 全カテゴリは、設定上は扱えるが画面には同時表示しない
  （潜在的に取り扱う）のか、画面上でも明示的に取り扱うのか
- Categories一覧でAreaを選択する場合、Area選択はCategories一覧内で行うのか、
  Category Settingなどの別画面で行うのか
- Category Settingは表示定義を編集する子画面であり、Area選択がCategories一覧の
  表示範囲や絞り込み条件に影響するのか
- 特定Areaの欠陥だけを表示する操作は、どの画面で、どの操作により実行するのか
- Categories一覧とCategory Settingを開いた直後の初期表示範囲は何か

確認結果に応じて、Categories一覧の表示単位、Area選択状態、カテゴリ選択状態、
Category Settingとの連携境界を確定する。

#### 2. Areaごとの色パターン

- Area 1〜3の既定パターン（単色・縦ストライプ・横ストライプ）でよいか
- Area 4以降の既定パターンをどのように扱うか
  （パターン循環、追加パターン、任意選択など）
- 色パターンの具体的な表示方法で問題ないか

#### 3. CategoryName／Commentの入力制約

- 最大文字数
- 日本語・空白・記号の許可範囲
- 改行の可否
- Unicode文字の許容範囲

確認前の暫定値は、既存実装を踏襲し、最大40文字・英数字／`_`／`-`のみ・
改行不可とする。

### 12.2 実装・後続設計で確定する事項

- Area一覧の取得APIとCategories画面への接続方法
- Resultの永続化スコープと保存先の正式な契約
- 第4弾でのHistogram・Defect List・Wafer Mapとの実連携

