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
- Area間のカテゴリ条件のAND／OR確定
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

カテゴリ定義の一意な識別キーは、次の組み合わせとする。

```text
Result ＋ AreaKey（areaNo）＋ categoryNo
```

カテゴリ定義は対象Resultに紐づけて管理する。
同じ`categoryNo`であっても、ResultまたはAreaが異なれば別のカテゴリ定義として扱う。
したがって、Areaごとに次の表示属性を変更できる。

- カテゴリ名
- Comment
- 色・色パターン
- アイコン

カテゴリ番号、表示順、欠陥数、チェック状態は保存対象のカテゴリ定義には含めない。

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

- 全カテゴリ選択状態：カテゴリ条件なし
- 一部選択状態：選択されたカテゴリ集合を保持
- 全解除状態：カテゴリ条件なしとして扱う

全選択・全解除の専用操作の有無や配置は、カテゴリ一覧の表示単位・レイアウト確定後に決定する。

### 6.3 選択状態と表示定義の分離

カテゴリ表示定義とチェック状態は別状態として管理する。

- 表示定義：永続化対象
- チェック状態：画面内の一時状態。永続化しない

カテゴリの選択・解除はCategories第2弾のUI操作および状態管理の対象とする。

### 6.4 Area間の条件合成

Categories第2弾では、Area間のカテゴリ条件をAND／ORで合成しない。

たとえば、Area 1でカテゴリ1、Area 2でカテゴリ2が選択されている場合も、
第2弾では次のArea別選択状態として保持する。

```text
Area 1 → {1}
Area 2 → {2}
```

第4弾へはArea別の選択集合を公開し、Area間の論理演算やBackend Queryへの変換は
第4弾で決定する。

## 7. Category Setting

### 7.1 編集・保存単位

Category Settingは、選択中のInspection Areaについてカテゴリ群全体を編集する。

Apply時は、対象Areaの全カテゴリ定義を一括保存する。
変更されたカテゴリだけでなく、未変更カテゴリも既定値を含む完全な定義として保存する。

### 7.2 未設定カテゴリ名

未設定のカテゴリ名は、入力欄の実値を空欄とし、MUI TextFieldの`placeholder`として
既定名称を灰色表示する。

Apply時にカテゴリ名が空欄の場合は、既定名称へ補完して保存する。
Commentの空欄は空文字として保存する。

### 7.3 Apply後の反映

Apply成功後は、次の状態を即時更新する。

- Categories一覧の表示定義
- Category Settingの確定値
- 後続の各種連携が参照する共有カテゴリ定義・選択状態

ただし、Histogram・Defect List・レーダーマップの再Query・再取得・再描画は
第4弾「各種連携」で実装する。

### 7.4 編集状態とArea切り替え

Category Settingでは、Areaごとに編集下書きを保持する。

- Area切り替え時も、切り替え前Areaの未保存編集を保持する
- Apply対象は現在表示中のAreaだけとする
- 現在表示中Areaに未保存変更がある場合だけApplyを有効にする
- 非表示Areaの未保存変更は、そのApplyでは保存しない
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

### 7.6 未保存定義の既定値補完

保存済み定義が存在しないカテゴリは、既定値を補完して表示する。
カテゴリ名の入力値が空欄の場合は、初回・再編集を問わず既定名称へ補完して保存する。

- カテゴリ名：空欄時は既定名称
- Comment：空文字を許容
- アイコン：既定値を表示
- 基本色：既定値を表示
- 色パターン：Areaの既定値を表示

アイコン・基本色・色パターンは、候補から選択した値そのものを保存する。
`categoryNo`から保存値を再生成する方式にはしない。

## 8. API・永続化の設計方針

### 8.1 取得

取得APIは、対象Resultの全Areaについてカテゴリ定義一式を返す。
各Areaのカテゴリ定義には、楽観ロックに使用する`createdAt`と`updatedAt`を含める。

### 8.2 保存

ApplyのRequestは、現在表示中Areaのカテゴリ0〜10の全定義と、
取得時点の対象Areaの`updatedAt`を送信する完全置換形式とする。

保存はArea内のカテゴリ群を単位とする原子更新とする。
成功時は保存後の`updatedAt`を返す。

### 8.3 競合

保存時に、Requestの`updatedAt`と現在保存されている対象Areaの`updatedAt`が
一致しない場合は`409 Conflict`とする。

楽観ロックはArea単位で行い、別Areaの更新は競合させない。

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

## 12. 未確定事項

以下は本書更新時点では未確定とする。

- Categories一覧で複数Areaをどのように表示・切り替えるか
- 通常Categories一覧の「全カテゴリ」が`categoryNo`単位か`AreaKey＋categoryNo`単位か
- Categories一覧でAreaを選択するUIの有無
- 全選択・全解除の専用操作の有無と配置
- Area一覧の取得APIとCategories画面への接続方法
- Category Settingの保存先とAPIの具体的なRequest／Response
- `createdAt`／`updatedAt`および楽観ロックの具体仕様
- 保存失敗・409競合時のUI遷移
- Areaごとの色パターンの具体的な描画仕様
- Area4以降の色パターン
- `categoryNo`から`defectClass`への具体的な変換仕様
- 第4弾でのArea間条件の論理合成
- 第4弾でのHistogram・Defect List・Wafer Mapとの実連携

