# Analysis Viewer 各種連携 共通条件統合・変換 詳細設計書（ドラフト）

## 1. 文書の位置付け

本書は、Analysis Viewerの絞り込み条件エリアにおける第4弾「各種連携」のうち、
Categories、Filters、Histogramが保持する条件を統合し、各Featureの取得処理へ渡す
共通条件モデルと変換境界を整理するドラフトである。

本書は、各条件機能の個別詳細設計書から共通部分を分離して管理する。

- Categoriesのカテゴリ定義・選択UI・設定保存はCategories詳細設計書で扱う
- Histogramの行・Slider・集計処理はHistogram詳細設計書で扱う
- Filtersの条件入力・演算子・入力検証はFilters詳細設計書で扱う
- 各Featureへの条件反映、Query変換、同期は本書で扱う

本書は第4弾の実装前に、責務境界と共通モデルを確定するためのたたき台であり、
具体的なBackend EndpointやFeatureごとのQuery実装は後続設計で詳細化する。

## 2. 親機能の役割

絞り込み条件エリアの親機能は、Categories、Filters、Histogramを直接結合するのではなく、
各子機能と各Featureの間に位置するハブとして機能する。

```text
Categories ─┐
Filters ────┼→ 絞り込み条件エリア（親機能）
Histogram ──┘      ├─ 共通条件を統合
                   ├─ 条件世代を管理
                   ├─ 共通条件を解決・変換
                   └─ 各Featureへ条件を配布
```

親機能は、次の責務を持つ。

- 各子機能から条件を受け取る
- `DefectFilterConditionSet`を共通条件の正本として組み立てる
- 条件変更時の`conditionVersion`を更新する
- 条件の妥当性・適用可否を判定する
- カテゴリ条件などの意味モデルをBackend Query向け条件へ変換する
- Histogram、Defect List、Wafer Mapなどへ条件を配布する
- 条件変更に伴う再取得・再集計の開始契機を管理する
- 複数FeatureのLoading／Error同期を管理する

子機能同士が、他の子機能のAtomやHookを直接参照する構成は採用しない。

## 3. 共通条件モデル

### 3.1 DefectFilterConditionSet

`DefectFilterConditionSet`は、絞り込み条件エリア全体で共有する条件モデルである。
各子機能の状態をそのまま統合して二重保持するのではなく、親機能が各機能の公開値から
構成する。

```ts
type DefectFilterConditionSet = {
  filterConditions: DefectFilterCondition[];
  categoryConditions: DefectCategoryCondition[];
  sliderConditions: SliderCondition[];
};
```

このモデルは条件を表現・保持する共通定義であり、Backend Queryへの変換処理を内包しない。

### 3.2 Categoriesの公開条件

Categoriesは、カテゴリ固有の選択状態と、共通条件として正規化した
`categoryConditions`を公開する。

```ts
type DefectCategoryCondition = {
  areaKey: AreaKey;
  categoryNo: CategoryNo;
};
```

```text
categorySelectionByArea
  └─ Categories UI向けの状態

categoryConditions
  └─ 親機能へ公開する正規化済み条件
```

`categorySelectionByArea`はCategories内部のUI操作に適した表現であり、
親機能は`categoryConditions`を参照する。

`defectClass`はCategoriesの公開モデルには含めない。
`categoryNo`から`defectClass`への変換は親機能の共通条件解決層で一元管理する。

### 3.3 Filtersの公開条件

Filtersは、入力・検証済みの条件を`filterConditions`として公開する。
条件行の編集状態、未適用入力、入力エラーはFilters内部で管理し、
未確定の入力値を共通条件へ含めない。

### 3.4 Histogramの公開条件

Histogramは、Value Range Filterで確定した有効な条件を`sliderConditions`として公開する。
全範囲のSliderは条件なしとして扱い、`sliderConditions`へ含めない。

Histogram自身の行状態・Slider操作状態・集計結果は、共通条件モデルには含めない。

## 4. 条件の統合

親機能は、各子機能から取得した条件を次のように統合する。

```text
DefectFilterConditionSet
├─ filterConditions
├─ categoryConditions
└─ sliderConditions
```

現時点の基本方針は、条件グループ間をANDで合成することである。

```text
Filter条件
  AND Category条件
  AND Slider条件
```

ただし、Categories内部の複数条件については、全Area × 全カテゴリの画面取扱いと
密接に関係するため、同一Area内・Area間のAND／OR規則は別途確定する。

## 5. 条件解決・Query変換

### 5.1 変換境界

条件変換は次の2段階に分ける。

```text
DefectFilterConditionSet
  ↓ 共通条件解決
Backend向けの意味条件
  ↓ Feature別Adapter
各FeatureのQuery／Request形式
```

共通条件解決層は、次を一元管理する。

- `categoryNo`からBackendの`defectClass`への対応付け
- Area条件を含むカテゴリ条件の論理構造
- Filter、Category、Slider条件の合成
- 空条件の扱い
- 条件の正規化
- 条件モデルの妥当性検証

各Featureは、共通条件解決層が作成した条件を、自FeatureのAPIまたはQuery形式へ
変換する。各Featureが個別に`categoryNo`から`defectClass`へ変換する方式は採用しない。

### 5.2 空条件

次の場合、カテゴリ条件はSnapshotへの追加絞り込みを行わない。

- 全対象カテゴリが選択されている
- Categoriesの選択条件が空である

全解除状態もカテゴリ条件なしとして扱う。カテゴリ条件なしは、Snapshotへの追加絞り込みを
行わないことを意味する。

### 5.3 条件世代

条件が変更された場合、親機能は`conditionVersion`を更新する。
非同期処理から返ったResponseは、開始時の条件世代と一致する場合だけ状態へ反映する。

```text
条件変更
  → conditionVersion更新
  → 各Featureの再取得・再集計
  → 旧conditionVersionのResponseは破棄
```

Snapshot自体を更新するかどうかは、条件の種類と既存Histogram設計に従う。
Filter、Category、Slider条件の変更だけではSnapshotを再作成しない方針を基本とする。

## 6. 状態と責務の所有

| 状態・情報 | 所有者 | 親機能への公開 |
|---|---|---|
| カテゴリ表示定義 | Categories | 確定済み定義を参照可能 |
| カテゴリ選択状態 | Categories | `categoryConditions` |
| Filter入力・検証状態 | Filters | 確定済み`filterConditions` |
| Slider操作・行状態 | Histogram | 確定済み`sliderConditions` |
| 共通条件集合 | 親機能 | `DefectFilterConditionSet` |
| `categoryNo`から`defectClass`への変換 | 共通条件解決層 | 変換済み条件 |
| Feature固有のQuery | 各Feature Adapter | Feature内部 |
| 各Featureの取得結果 | 各Feature | 必要な表示状態のみ |

共通条件モデルを、各子機能のAtomへ複製して保持しない。
親機能が公開値から統合モデルを構成し、各Featureへ必要な条件を配布する。

## 7. Loading／Error同期

条件変更後の処理は、親機能が条件世代を管理し、各Featureの状態を追跡する。

- 条件統合中：共通条件を確定し、Query開始前の短時間状態を管理する
- Feature取得中：各FeatureのLoadingを管理する
- 一部Feature失敗：失敗FeatureのErrorを保持し、他Featureの成功結果を不必要に破棄しない
- 条件世代不一致：古いResponseを破棄する
- Categoriesの定義取得・保存状態：Categories内部の状態として管理する
- Categoriesの件数取得状態：カテゴリ定義状態と分離する

複数Featureの表示上のLoading／Errorを一つにまとめるか、Feature別に表示するかは、
画面要件と既存Featureの表示規約に合わせて後続設計で確定する。

## 8. React／Frontendの責務境界

第4弾の親機能は、Categories、Filters、HistogramのComponentを直接操作するのではなく、
各FeatureのCustom Hookが公開する条件・操作境界を利用する。

```text
Feature Component
  ↓
Feature Custom Hook
  ↓
親機能の条件統合
  ↓
DefectFilterConditionSet
  ↓
共通条件解決／Feature Adapter
```

Categories第2弾では、既存実装に合わせてThin Component／Fat Hookを採用し、
React Context Providerは導入しない。

第4弾で親機能の状態スコープが複雑化した場合に限り、親機能でのProvider導入を再検討する。

## 9. 未確定事項

以下は本書更新時点で未確定とする。

### 9.1 要件・業務仕様に依存する事項

- Categories一覧とCategory SettingにおけるAreaの表示・選択方式
- `AreaKey`の正式な共通業務概念としての契約
- 同一Area内の複数カテゴリのAND／OR
- 複数Areaにまたがるカテゴリ条件のAND／OR
- 全解除状態を「条件なし」とするか、結果0件とするか
- 特定Areaのみを対象とするUI操作と条件表現

### 9.2 第4弾の実装設計で確定する事項

- 共通条件解決層の配置（親Feature内のDomain／Service／Utility等）
- `categoryNo`から`defectClass`への具体的な対応表・変換規則
- Backend Query形式とFeature別Adapterの構造
- Filter条件とCategory条件の具体的な組合せ
- 条件変更時の再取得・再集計対象
- `conditionVersion`の管理方法
- 複数FeatureのLoading／Error同期
- 共通条件解決エラーの通知方法
- 共通条件モデルのテスト方針

## 10. 個別詳細設計書との関係

Categories、Histogram、Filtersの個別詳細設計書では、共通条件モデルの定義を重複して
再定義しない。

各個別設計書では、次の範囲を記載する。

- 自機能が所有する状態
- 共通条件として公開する項目
- 親機能から受け取る条件
- 自機能に固有の操作・表示・取得処理

`DefectFilterConditionSet`、`DefectCategoryCondition`、条件解決境界、
各Featureへの条件配布は、本書を共通正本として参照する。
