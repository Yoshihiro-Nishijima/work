# Analysis Viewer カテゴリ機能 方針整理

## 1. 文書の位置付け

本書は、Analysis Viewerの「絞り込み条件エリア」におけるカテゴリ機能について、
共有済み資料・既存ソース・Histogram設計書の調査結果を記録するための文書である。

本書は調査・方針検討中の文書であり、未確認事項を実装仕様として確定しない。
確定事項が増えた場合は、本書へ追記・更新する。

## 2. 調査対象資料

### 2.1 既存リポジトリ

- `doc/AI_RULES/AI_IMPLEMENTATION_RULES.md`
- `doc/AI_RULES/PROJECT_ARCHITECTURE.md`
- `doc/defect_histogram/Defect_Histogram詳細設計書.md`
- `doc/value_range_list/AnalysisViewerヒストグラム詳細設計書.md`
- IntegratedViewer版Histogram関連Frontend／Backendソース

### 2.2 今回共有された資料

- モック版ソース
  - `web_tools_project-main.zip`
- IntegratedViewerの現行Frontend
  - `01_frontend.zip`
- IntegratedViewerの現行Backend
  - `02_backend.zip`

### 2.3 画面資料

- Analysis Viewer全体
- 絞り込み条件エリア：Categories
- 検査情報エリア：カテゴリ案

## 3. Histogram設計書から引き継ぐ共通前提

カテゴリ機能固有の設計を検討する際、Histogram設計書で定義済みの次の事項は
共通前提として扱う。これらをカテゴリ機能の調査対象として最初からやり直さない。

- Feature First構成
- Layout、Component、Custom Hook、APIの責務分離
- ComponentからAtom・APIを直接利用しない構成
- `DefectFilterConditionSet`による絞り込み条件の統合
- `filterConditions`、`categoryConditions`、`sliderConditions`の命名
- 親Featureが条件を統合し、機能別Queryへ変換する責務分担
- Snapshotを再作成せず、条件変更時に再Queryする方針
- Frontend条件モデルとBackend DTOの分離
- Loading／Empty／Errorの状態分離
- IntegratedViewer暫定Hostから正式Analysis Viewerへ移行する境界

ただし、Histogram設計書における`categoryConditions`はカテゴリ機能の具体仕様を
定義したものではない。カテゴリの選択対象・選択値・合成規則は別途調査・検討する。

## 4. 画像資料から読み取れる要求候補

現時点で画像から読み取れる内容を、実装仕様として確定せず要求候補として整理する。

### 4.1 Categories表示エリア

- `categories`を押下すると開閉する。
- 画面を開くと全カテゴリが表示される。
- 1カテゴリについて、次の情報を表示する。
  - チェックボックス
  - アイコン
  - カテゴリ名
  - カテゴリに属する欠陥数
- チェックボックスがONのカテゴリを、絞り込み条件として扱う。
- Mapのデータ絞り込みと、取得済みMapレイヤーの表示ON／OFFは分離する。
- `Category Setting`を押下するとカテゴリ設定画面が開く。

### 4.2 Category Setting画面

- カテゴリ名とCommentを設定できる。
- カテゴリは10種類固定とする。
- 色とアイコンはAppendixを母集団とする選択式とする。
- 色・アイコンの重複は許可し、排他制御は行わない。
- `Area1`、`Area2`、`Area3`はサンプル上の表示であり、実際のArea数に応じて
  切り替え対象を生成する可能性がある。
- 画像上では、カテゴリごとに設定欄と、設定を確定する操作が存在する。

### 4.3 アイコン・色

検査情報エリアのカテゴリ案では、10種類のアイコンと10色を基本とし、
Areaごとに色の濃淡を変える案が示されている。色とアイコンはAppendixの
選択肢から設定し、同じ選択肢を複数カテゴリで使用できるものとする。

画像から読み取れる色コードは次のとおり。

| カテゴリ番号 | 色 |
|---:|---|
| 1 | `#1f77b4` |
| 2 | `#ff7f0e` |
| 3 | `#2ca02c` |
| 4 | `#d62728` |
| 5 | `#9467bd` |
| 6 | `#8c564b` |
| 7 | `#e377c2` |
| 8 | `#7f7f7f` |
| 9 | `#bcbd22` |
| 10 | `#17becf` |

画像資料だけでは、Areaごとの濃淡生成式、境界値、表示時の色決定規則までは確定できない。

## 5. 既存Frontendの調査結果

### 5.1 共通カテゴリ定義

現行Frontendには次のカテゴリ関連実装がある。

- `src/features/misc/types/CategoryDefinition.ts`
- `src/features/misc/utils/getCategoryDefinition.ts`
- `src/features/misc/utils/CategorySymbolSvg.tsx`

`CategoryDefinition`は、次の表示属性を持つ。

```ts
type CategoryDefinition = {
  categoryNo: number;
  categoryName: string;
  symbolType: CategorySymbolType;
  color: string;
  displayOrder: number;
};
```

10種類のシンボル描画関数が存在する。

- Circle
- Triangle
- Square
- Diamond
- Pentagon
- Hexagon
- Star
- Cross
- Plus
- Hourglass

この実装は、カテゴリ番号から名称・アイコン・色・表示順を得るための表示定義であり、
Analysis Viewerのチェック状態、Area、Comment、Map絞り込み条件は保持しない。

### 5.2 ADC関連カテゴリ実装

`features/adc-annotation`には、カテゴリの編集・再マッピングに関する実装がある。

- `useEditCategories`
  - 選択した欠陥IDとカテゴリ値の編集中Mapを保持する
- `RemapCategoriesDialog`
  - カテゴリ値のFrom／To変更を受け付ける
- `useRemapCategories`
  - API呼び出し、Abort、成功／失敗通知を管理する

これは欠陥データ自体のカテゴリ編集・再マッピング機能であり、
Analysis Viewerのカテゴリ表示選択とは責務が異なる。
ただし、Hookへ状態管理・API制御・エラー処理を集約する実装例として参照できる。

### 5.3 Histogramカテゴリ定義

`features/defect-histogram/hooks/useDefectHistogramCategories.ts`には、次の表示定義がある。

- `categoryNo`
- `label`
- `color`
- `order`

この定義はHistogramの凡例・積み上げグラフ・Tooltip・詳細表示のための定義である。
カテゴリ選択状態やAnalysis Viewerの`categoryConditions`を表現するものではない。

したがって、既存の`useDefectHistogramCategories`をカテゴリ機能の状態管理へ
そのまま流用することはできない。表示定義の再利用可否と、選択状態・Area・Commentを
管理するモデルは分けて検討する必要がある。

## 6. 既存Backendの調査結果

### 6.1 欠陥データのカテゴリ項目

Backendの欠陥モデルには`defectClass`が存在する。

- `mbmmi/result/image.py`
  - DB列`defectClass`
- `mbmmi/result/engine.py`
  - 結果データから`defectClass`を読み出す
  - `DefectClass`が存在しない場合は`0`を設定

Histogram Backendでは、`defectClass`をカテゴリ系列用の値として取得している。
数値Histogramのカテゴリ別件数を作るための値であり、カテゴリ選択条件を受け取る
API仕様にはなっていない。

### 6.2 Histogram APIの現状

現行HistogramのRequestは、概ね次の構造である。

```text
field
filter
```

現行Histogram Providerは、対象数値fieldと`defectClass`を取得する。
`categoryConditions`をBackendへ渡して適用する処理は、共有された現行ソースには存在しない。

### 6.3 `defectClass`との関係

現時点で確認できる関係は次のとおり。

- Histogramでは`defectClass`をカテゴリ系列として表示する。
- Histogram設計書では、`defectClass`は横軸の数値fieldではなくカテゴリ系列専用とする。
- `NULL`、`-1`、未知値などの扱いについて、Histogram側のカテゴリ表示規則が定義されている。
- しかし、Analysis ViewerのCategoriesで選択するカテゴリが、同じ`defectClass`を意味するかは未確定である。

## 7. モック版ソースの調査結果

今回共有されたモック版ソースについて、ファイル名およびソース文字列から
カテゴリ関連実装を調査した。

現時点では、画像にある次の名称に直接一致する実装は特定できていない。

- `Ramp Categories`
- `Category Setting`
- `Area1`
- `Area2`
- `Area3`

一方、既存モックソースにはADC分析画面のクラス選択・比較グループ等、
カテゴリ／クラスに関係する別機能の実装は存在する。
これらはAnalysis Viewer Categoriesと同一機能であると判断せず、参考情報として扱う。

この調査結果だけでは、モック版のカテゴリ選択挙動・条件適用タイミング・
カテゴリ設定の保存方法を確定できない。

### 7.1 追加調査結果：5論点との対応

今回共有された`web_tools_project-main.zip`を対象に、次のキーワードおよび関連処理を
調査した。

- `Ramp Categories`
- `Category Setting`
- `Area1`、`Area2`、`Area3`
- `category`、`class`、`filter`
- Wafer Mapのカテゴリ／クラス表示

現時点では、画像にあるAnalysis ViewerのCategories機能に直接対応する画面・操作処理は
特定できていない。確認できたカテゴリ／クラス関連処理は、主にADC分析、ADC比較、
Recipe Matchingなど別機能のものである。

したがって、次の5論点については、現在共有されているモック版ソースからは
「既存実装に倣う仕様」として確定できない。

| 論点 | モック版ソースでの直接確認 |
|---|---|
| `defectClass`・Area・カテゴリ番号の対応 | 未確認 |
| 複数カテゴリ選択時のAND／OR | 未確認 |
| Category Settingの確定・保存タイミング | 未確認 |
| Histogramへ反映する範囲 | 未確認 |
| Map／Defect Listへの反映境界 | 未確認 |

なお、別機能のクラス選択・比較グループ処理が存在しても、
Analysis Viewer Categoriesと同じ仕様とはみなさない。
画面資料に対応するモックの実ファイルまたは実行可能な画面が特定できた段階で、
操作を再調査する。

### 7.2 モック版に存在する部分機能

モック版全体を追加調査した結果、画像にある30カテゴリの設定画面は確認できないが、
カテゴリ／クラスを条件として扱う部分機能は存在する。

主な実装箇所は次のとおり。

- `blueprints/defect_filter_gui/services/defect_filters.py`
- `blueprints/defect_filter_gui/services/defect_pos_visualize.py`
- `blueprints/defect_filter_gui/__init__.py`
- `blueprints/defect_filter_gui/templates/defect_filter_gui/recipe_result.html`

確認できた内容は、Analysis Viewer Categoriesの完成実装ではなく、
既存のFilters・Wafer Map・Histogram・Defect Listを利用したクラス絞り込みである。

## 15. モック版の5論点別調査結果

### 15.1 `defectClass`・Area・カテゴリ番号の対応

モック版では、欠陥データに次の項目が存在する。

- `defectClass`
- `area`
- Wafer Map上の`area_no`

`defectClass`は、次の用途で使用される。

- Filtersの`Defect Class`項目
- Histogramのカテゴリ系列
- Wafer Mapのクラス別欠陥点
- Wafer Mapのクラス別密度レイヤー

一方、`Area`は欠陥の数値項目またはWafer MapのArea情報として扱われているが、
`Area × カテゴリ番号`を30種類のカテゴリとして組み合わせる処理は確認できない。

したがって、モック版から確認できる範囲では次の対応である。

```text
クラス／カテゴリ番号 → defectClass
Area                  → areaまたはarea_no
Area × カテゴリ番号   → 未実装・未確認
```

### 15.2 複数カテゴリ選択時のAND／OR

画像のCategories一覧に相当する、複数カテゴリをチェックボックスで選択するUIは
確認できない。

ただし、モック版の汎用Filtersには次の処理が存在する。

- `is any of`：入力値をカンマ区切りで受け取り、SQLの`IN`へ変換
- 複数Filter行：各行の`conjunction`により`And`または`Or`を指定
- 条件は追加順に、左から右へ括弧付きで連結

したがって、モック版の既存実装から確認できる合成規則は次のとおり。

```text
同一項目の is any of → OR相当（SQL IN）
複数Filter行          → 行ごとのAnd／Or
```

ただし、Analysis Viewer Categoriesのチェックボックス複数選択が
この`is any of`へ変換される実装は存在しない。
ただし、モック版のクラス選択は、選択したクラスだけをFilter条件へ加える動作である。
Analysis Viewer Categoriesでは、検討用の仮方針として、同一Area内の複数カテゴリを
OR相当とする。Areaをまたぐ条件は、Areaの実体・対応が確定していないため、
現時点ではAND／ORで合成せず、複合条件として扱わない。

### 15.3 Category Settingの確定・保存タイミング

`Ramp Categories`、`Category Setting`、Area1〜3を切り替えてカテゴリ名・Commentを
編集する処理は、今回のモック版ソースから確認できない。

したがって、次の事項はモック既存仕様として引き継げない。

- 編集中状態
- Close時の破棄
- Apply時の確定
- Backend保存
- 画面再表示後の保持

Categoriesの方針としては、名称・色・Comment・アイコン等の表示定義を永続化し、
選択状態は絞り込み条件として一時的に保持する。Category SettingのArea切り替えと、
Categories一覧での絞り込み選択状態は別状態として管理する。

Category Settingの編集値は、Apply成功時に確定済み表示定義へ反映する。
Apply前の編集値は設定画面内の下書きとして扱い、Categories一覧へ反映しない。
保存に失敗した場合は編集値を破棄せず、エラーを表示して再試行可能な状態を保つ。

### 15.4 Histogramへ反映する範囲

モック版のHistogram APIは、Filtersで組み立てた条件を受け取り、
その条件をHistogram集計へ適用する。

`Defect Class`を選択した場合、Map上のクラス選択処理は次の動作を行う。

1. 既存の`Defect Class` Filter行を削除する
2. 選択クラスに対応する`Defect Class = 値`のFilter行を追加する
3. `Unclassified`の場合は`Defect Class is empty`を追加する
4. `applyFilters`を実行する
5. Histogramを再読み込みする

このため、モック版で確認できる範囲では、クラス選択はHistogramへ反映される。
ただし、これはCategories条件の専用連携ではなく、既存Filtersを経由した反映である。

なお、モック版のクラス選択は条件なしの状態から選択クラスを追加する動作である。
Analysis Viewer Categoriesの初期選択値は画面未実装のため確定していないが、
検討用の仮方針として、初期は未選択（カテゴリ条件なし）とする。

### 15.5 Map／Defect Listへの反映境界

モック版のクラス選択は、Mapだけの表示切り替えではない。
`applyDensityClassSelection`から`applyFilters`を呼び出し、
同じ条件で次の処理を更新する。

- Wafer Map再取得
- Defect List再取得
- Histogram再読み込み

一方、次の操作はMap表示だけを変更する。

- Defect Points表示／非表示
- Chip Density表示／非表示
- Images表示／非表示
- 現在取得済みMap内のクラス表示状態

したがって、モック版では次の2種類が区別されている。

```text
クラス選択         → 共通Filterへ変換し、Map・List・Histogramへ反映
Map表示レイヤー操作 → 取得済みMapの表示状態だけを変更
```

これは、将来の④各種連携を検討する際の重要な参考になる。ただし、
Analysis Viewer Categoriesのチェックボックス操作を同じ動作にするかは、
Categoriesの要求仕様として別途確定する。

Analysis Viewerでも、カテゴリ選択によるQuery条件と、Map Featureが管理する
表示レイヤーのON／OFFは分離する。

## 16. モック版から引き継げる範囲

現時点で、モック版の実装に倣える候補は次のとおり。

- 欠陥カテゴリの実データ項目として`defectClass`を使用すること
- Histogramのカテゴリ系列に`defectClass`を使用すること
- 選択条件を共通Filterへ変換する考え方
- Histogram・Map・Defect Listへ同じ条件を適用する考え方
- `Unclassified`を空値条件として扱う考え方
- 同一項目の複数値を`IN`条件として表現する考え方
- Map専用の表示切り替えと、データ再取得を伴う条件変更を分離すること

## 17. モック版からは引き継げない範囲

次の事項は、モック版に直接対応する実装がないため、画像資料・追加要件を基に
新たに設計する必要がある。

- Area × 10種類のカテゴリモデル
- カテゴリ名・Commentの編集
- Appendixを母集団とするアイコン・色・Area別設定
- Categories一覧のチェックボックス
- Category SettingのApply／Close動作
- カテゴリ設定の保存スコープ・保存先
- Area間のカテゴリ条件のAND／OR
- Categoriesから共通条件への正式なDTO変換仕様

## 8. 現時点で確認できた分類

### 8.1 カテゴリ表示定義

既存実装で確認できるもの。

- カテゴリ番号
- 表示名
- 色
- アイコンまたはシンボル
- 表示順

### 8.2 カテゴリ状態

Analysis Viewerで新たに必要になる可能性があるもの。

- Area
- カテゴリ単位のチェック状態
- カテゴリ名の編集値
- Commentの編集値
- 設定画面の編集中状態
- Apply／Close時の確定状態
- Map表示対象のカテゴリ集合
- Histogram条件へ渡すカテゴリ条件

### 8.3 カテゴリ条件

現時点では、次の意味が確定していない。

- チェックONによるQuery条件の具体的な適用先
- 選択なしを初期状態とする仮方針の正式化
- Area内の複数カテゴリ選択はOR相当とする仮方針の正式化
- Area間のカテゴリ条件の扱い
- Areaをまたぐ選択はORかANDか
- Area内のカテゴリ条件とArea間の条件をどのように合成するか
- `defectClass`と別のカテゴリ項目を使用する可能性があるか

## 9. 未確定事項

以下は、カテゴリ固有の追加資料または仕様確認が必要な事項である。

### 9.1 選択対象

- Areaが何を指すか
- Areaとカテゴリ番号の組み合わせを一意な選択キーとするか
- `Area × categoryNo`と`defectClass`の対応
- `defectClass`解決済み条件をどの型で公開するか

### 9.2 選択UI

- Categories開閉時の初期状態
- 全カテゴリ表示時の並び順
- Areaの表示方法
- チェックボックスの初期値
- 全選択・全解除操作の有無
- カテゴリ名が未設定の場合の表示
- 欠陥数の集計対象と更新タイミング

### 9.3 設定画面

- カテゴリ表示定義の保存スコープ・保存先
- Close時に未保存編集を破棄するか
- Apply／Save操作の名称と確定タイミング
- Commentの最大長・空文字許可・改行可否
- Area切り替え時の編集状態保持
- 設定変更後にCategories一覧へ即時反映するか
- 設定変更をBackendへ保存するか

### 9.4 条件合成

- 同一Area内の複数カテゴリをOR相当とする仮方針の正式化
- Area間の条件を合成するか
- 条件モデルのBackend DTO上の具体表現
- 選択条件の順序を意味のあるものとして扱うか

### 9.5 他エリアへの反映

- Mapだけに反映するか
- Histogramへ反映するか
- Defect Listへ反映するか
- Recipe／Inspection Condition／Inspection Resultタブに反映するか
- 操作直後に反映するか、Apply操作後に反映するか
- 反映処理中のLoading表示・操作制御

### 9.6 Backend契約

- `categoryConditions`をBackend DTOへ変換する具体形式
- `defectClass`の`isAnyOf`相当へ変換するか
- AreaをBackendへ送る必要があるか
- Category名・Comment・表示定義をBackendから取得するか
- 条件なしを空配列で表すか、未指定で表すか
- 未知カテゴリ番号・未知Areaのエラー形式

### 9.7 状態異常

- Loading中のチェック操作可否
- Empty時の表示
- Error時に直前の選択状態を維持するか
- 条件変更中に前回データを表示し続けるか
- 通信競合時の旧Response破棄

## 10. 現時点の方針

現段階では、共通基盤に加えて、Categoriesの保持・選択・条件境界について
次の方針を置く。

1. Histogram設計書の共通条件モデルと責務分離を前提にする。
2. 既存Histogramカテゴリ定義を、Analysis Viewerカテゴリ条件の根拠として直接使用しない。
3. カテゴリ表示定義、カテゴリ選択状態、カテゴリ設定値、Backend条件を別責務として整理する。
4. `defectClass`との関係は、モック挙動または追加仕様で確認するまで確定しない。
5. 同一Area内の複数カテゴリはOR相当、Categories条件とFilter／Slider条件はANDとする
   仮方針で検討する。Area間の合成、適用タイミング、保存スコープは未確定とする。
6. 表示定義は永続化し、カテゴリ選択状態は一時的な絞り込み条件として扱う。
7. Mapの表示レイヤーON／OFFは、カテゴリQuery条件から分離する。
8. 実装着手は、カテゴリ固有の未確定事項を整理し、必要な仕様確認を終えてから行う。

## 11. 次の調査対象

次回以降は、次の順で追加資料を確認する。

1. モック版でカテゴリ画面を実際に構成しているファイルの特定
2. カテゴリのチェック操作・Category Setting操作・Apply操作の挙動確認
3. 欠陥数の算出元と更新契機の確認
4. `defectClass`、Area、カテゴリ番号の対応確認
5. CategoriesからMap／Histogram／Defect Listへの反映範囲確認
6. 保存期間・Backend API・エラー時挙動の確認
7. その結果を基に、カテゴリ機能単体の詳細設計へ移行

## 20. モック版・Histogram設計・要件資料の整理

Categories開発では、既存実装をそのまま移植するのではなく、次の3分類で扱う。

1. モック版から引き継ぐ内容
2. Histogram設計との接続調整が必要な内容
3. 要件資料にはあるが、モック版に未実装の内容

### 20.1 モック版から引き継ぐ内容

| 項目 | モック版の確認内容 | Categoriesでの扱い |
|---|---|---|
| カテゴリ値 | `defectClass`をクラス／カテゴリ値として利用 | 基本的なデータ項目の候補として引き継ぐ |
| Histogramカテゴリ | `defectClass`ごとに集計・系列化 | Histogramのカテゴリ系列との接続根拠として引き継ぐ |
| 選択条件の共通化 | クラス選択をFilter条件へ変換 | Categoriesも共通条件へ変換する方向を引き継ぐ |
| 条件の適用先 | 共通FilterでMap・Defect List・Histogramへ反映 | 将来の各種連携の参考とする |
| 未分類 | `is empty`相当で未分類を扱う | Analysis Viewer Categoriesの対象外 |
| 複数値条件 | `is any of`をSQLの`IN`へ変換 | 複数カテゴリ選択のBackend表現候補とする |
| 条件結合 | Filter行を`And`／`Or`で結合 | CategoriesとFiltersの条件合成検討の参考とする |
| Map専用操作 | レイヤー表示切り替えとデータ条件変更を分離 | 条件変更と表示制御を分離する考え方を引き継ぐ |

### 20.2 Histogram設計との接続調整が必要な内容

この節の内容は、主として④各種連携で実装する事項である。
Categories第2弾では、実連携処理を実装せず、後続連携のための入力モデル・
公開境界・変換契約だけを定義する。

#### 20.2.1 `defectClass`の二つの用途

Histogram設計では、`defectClass`は主にカテゴリ系列表示用である。
一方、モック版では、クラス選択時のFilter条件としても使用される。

```text
Histogram設計：
defectClass → Histogramのカテゴリ別系列・凡例・Tooltip

モック版：
defectClass → 選択条件としてFilter・Map・List・Histogramへ適用
```

Categoriesでは、この2用途を同じ値体系で扱えるかを確認する必要がある。
表示用カテゴリ定義と、絞り込み条件としてのカテゴリ選択状態は、
同一状態として二重管理しない。

#### 20.2.2 `categoryConditions`の具体化

Histogram設計書では、親Featureが次の条件を統合する。

```text
DefectFilterConditionSet
├─ filterConditions
├─ categoryConditions
└─ sliderConditions
```

Categoriesの選択結果は`categoryConditions`へ変換する想定である。
ただし、モック版ではクラス選択を既存Filter行へ変換しているため、
次のどちらを採用するかを調整する必要がある。

```text
案A：CategoriesをcategoryConditionsとして独立管理する
案B：モック版と同じくDefect ClassのFilter条件へ変換する
```

現時点では、Histogram設計書の条件責務分離を優先し、
CategoriesのUI状態と`categoryConditions`を分離する方向が適切である。
`categoryConditions`の意味とBackend DTOへの変換境界は、Categories段階で定義する。
ただし、共通条件へ組み込み、各Featureへ実際に適用する処理は④各種連携の対象とする。

#### 20.2.3 条件合成

Histogram設計書では、Filter条件・Category条件・先行Slider条件をANDで合成する。
一方、モック版では、同一Filter内の行同士に`And`／`Or`を指定できる。

検討用の仮方針として、同一Area内の複数カテゴリをOR相当とし、
Categories条件全体とFilter条件・Slider条件をANDで結合する場合、
次の構造が候補になる。

```text
(Area内の選択カテゴリ1 OR Area内の選択カテゴリ2)
AND Filter条件
AND 先行Slider条件
```

Areaをまたぐ条件のAND／ORは、Areaの実体確認後に決定する。
現時点ではArea間の条件を合成しない。

#### 20.2.4 Histogram再集計

モック版ではクラス選択後にHistogramを再読み込みする。
Histogram設計書では、条件変更時にSnapshotを再作成せず、
Query世代を更新して旧Responseを破棄する。

Categories接続時は、④各種連携で次の共通方針を引き継ぐ。

- Snapshotは再作成しない
- Categories変更時は共通条件を更新する
- Histogram Queryを再生成する
- 旧世代のResponseは破棄する
- Loading／Error中も選択状態と取得状態を分離する

#### 20.2.5 カテゴリ表示定義

既存Histogram実装にはカテゴリ番号・名称・色・表示順の表示定義がある。
一方、要件資料には10種類のアイコン、10色、Area別の色の濃淡がある。

そのため、次を分離して調整する必要がある。

- Histogramの系列表示定義
- Categories一覧のアイコン・色表示
- Category Settingで編集する名称・Comment
- Areaに応じたカテゴリ識別

既存Histogramの表示定義は、10カテゴリ固定・カテゴリ番号・名称・色・表示順の
基準として参照する。ただし、Categoriesの名称・色・アイコン・Commentは、
Area単位の永続設定として別モデルで管理する。

### 20.3 要件資料にはあるが、モック版に未実装の内容

| 要件資料上の内容 | モック版の状況 | 対応 |
|---|---|---|
| Categoriesの開閉 | 対応する画面未確認 | 新規UI設計 |
| 全カテゴリ一覧 | 対応する画面未確認 | 新規UI設計 |
| チェックボックスによる複数選択 | 未確認 | 新規状態モデル・UI設計 |
| アイコン表示 | Analysis Viewer用は未確認 | 既存シンボル実装との整合確認 |
| Area1〜3 | 30カテゴリとしての処理は未確認 | 新規モデル設計 |
| カテゴリ名設定 | 未確認 | 新規編集状態設計 |
| Comment設定 | 未確認 | 新規編集状態設計 |
| Category Setting画面 | 未確認 | 新規Dialog／Panel設計 |
| Apply／Close動作 | 未確認 | 操作仕様の決定が必要 |
| 設定保存 | 未確認 | 表示定義は永続化。保存単位・保存先は要確認 |
| カテゴリごとの欠陥数 | モックのクラス集計は存在 | Areaを含む集計単位を調整 |
| Mapへのカテゴリ表示 | クラス表示は存在 | Categories選択との接続を設計 |

### 20.4 3分類を踏まえた現時点の境界

Categories開発の初期段階では、次を対象とする。

- Categories一覧の表示モデル
- カテゴリ選択状態
- 表示定義との接続
- `categoryConditions`へ変換するためのCategories側データ境界
- 後続連携へ公開するための入力契約

次を初期Categories単体の対象外とする。

- Histogramの再Query
- Wafer Mapの実再取得・再描画
- Defect Listの実再取得
- 全画面のLoading／Error同期
- 共通条件のBackend適用

ただし、後続の④各種連携で実装できるよう、
Categoriesが保持する選択状態と、連携側が取得する条件モデルの境界は先に定義する。

### 20.5 開発単位ごとの論点分類

#### Categories第2弾で主に検討する内容

要件資料に存在し、モック版に未実装または直接対応する実装を確認できなかった
Categories固有機能を主対象とする。

- Categories一覧の開閉
- 全カテゴリ一覧の表示
- チェックボックスによる選択・解除
- カテゴリ番号、Area、表示名、Comment、アイコン、色、表示順の表示モデル
- Area切り替え対象の動的生成
- Category Setting画面
- カテゴリ名・Commentの編集状態
- Apply／Close／Cancel等の画面操作
- 設定値の保持期間を決めるための状態境界
- 選択状態を後続連携へ渡すためのHook／型の境界

Categories第2弾では、10カテゴリ固定の選択状態を保持し、後続連携で利用可能な形にする。
さらに、Categories側の責務として、選択されたカテゴリを`defectClass`として
解釈できる状態までを定義する。

Categories側に含める接続点は次のとおり。

- カテゴリ定義から`defectClass`値を解決すること
- 選択中カテゴリの集合を保持すること
- 選択カテゴリを`defectClass`解決済みの条件情報へ変換し、その状態を保持すること
- 選択操作をAtom状態へ反映すること
- Atom状態をCustom Hook経由でComponentへ提供すること
- 選択中カテゴリを、後続連携が利用できる条件モデルまたは変換前モデルとして公開すること
- 選択状態と表示定義（名称・色・アイコン・順序）を分離して保持すること
- 選択状態は永続化せず、条件セットの初期化時に初期状態へ戻すこと
- 同一Area内の複数カテゴリをOR相当として扱うこと（仮方針）
- Area間のカテゴリ条件を現時点では合成しないこと
- Filter条件・Slider条件とのAND合成規則とBackend DTO変換境界を定義すること
- 定義取得・保存のLoading／Empty／Errorを分離して扱うこと
- 保存中の二重操作を防止し、保存失敗時に再試行可能な状態を保つこと

一方、Categories側では次を実施しない。

- `defectClass`条件を使ったHistogramの再Query
- `defectClass`条件を使ったDefect Listの再取得
- `defectClass`条件を使ったWafer Mapの再取得
- 複数Featureの条件を統合した最終的なBackend Queryを発行すること
- 条件変更に伴う画面全体のLoading／Error同期

#### 第4弾「各種連携」で主に検討する内容

Categories・Filters・Value Range条件を共通条件として、
各表示Featureへ反映する処理を主対象とする。

- Categoriesが公開する選択状態を、共通条件へ組み込む実装
- `categoryConditions`を既存Filter条件・Slider条件と合成する実装
- 条件変更時のHistogram再Query
- Histogram表示定義とCategories表示定義の統合・変換
- 共通条件によるHistogram再集計
- Defect List再取得
- Wafer Map再取得
- 条件変更時のLoading／Error同期
- Backend Query DTOへの変換と条件適用

Categories第2弾では、`defectClass`として解釈可能なカテゴリ選択状態、
条件の合成規則、Backend DTOへの変換境界を定義する。
それを共通条件へ組み込み、各Featureへ反映する処理は④で実装する。

### 20.6 次の検討順序

Categories第2弾では、UIの詳細より先に、後続連携との境界を検討する。

1. Categoriesが所有する責務と、第4弾が所有する責務を確定する
2. Categories内部のカテゴリ識別方法を確定する
3. 選択状態をAtomで保持する範囲を確定する
4. Custom Hookが公開する型・操作を確定する
5. `defectClass`として後続連携へ渡す変換境界を確定する
6. 要件資料にあるCategories固有UIを棚卸しする
7. Category Settingの画面状態・操作・保持境界を整理する
8. 第4弾へ引き渡す未確定論点を一覧化する

## 21. 最初に検討する責務境界

### 21.1 Categories第2弾が所有する責務

Categories Featureは、カテゴリに関する表示定義と選択状態を所有する。

- カテゴリ一覧の表示
- カテゴリの選択・解除
- カテゴリ定義の参照
- `Area`とカテゴリ番号の管理
- 選択状態のAtom管理
- 選択操作を行うCustom Hook
- 選択状態を`defectClass`として解釈する変換
- 後続連携が利用する出力型

### 21.2 第4弾が所有する責務

各種連携Featureは、Categoriesが公開した選択状態を共通条件へ組み込み、
各表示Featureへ反映する。

- Categories・Filters・Value Range条件の統合
- 条件のAND／OR合成
- Histogram Queryの生成・再Query
- Defect Listの再取得
- Wafer Mapの再取得
- Backend DTOへの変換
- 複数FeatureのLoading／Error同期

### 21.3 境界で定義する出力

Categoriesは、少なくとも次の情報を後続連携へ提供できる必要がある。

```text
選択中カテゴリ
├─ Area
├─ categoryNo
└─ defectClass
```

表示名、Comment、色、アイコン、表示順は表示用情報であり、
条件適用処理へ直接混在させない。

Categoriesの出力を、次のどちらの形にするかは境界検討で確定する。

```text
案A：選択カテゴリのDomain Modelを公開し、第4弾でcategoryConditionsへ変換する
案B：CategoriesがcategoryConditions相当の条件モデルまで生成して公開する
```

### 21.4 Areaと`defectClass`の境界論点

要件資料では、カテゴリはAreaごとの10種として示されている。
一方、モック版のデータ条件は`defectClass`を中心としている。

そのため、次を最初に確認する。

- `Area1`のカテゴリ1と`Area2`のカテゴリ1が同じ`defectClass`か
- Areaごとに異なる`defectClass`値を持つか
- Categories内部の選択キーを`categoryNo`だけにするか、`Area + categoryNo`にするか
- 後続連携へ渡す条件にAreaを含めるか
- Areaは表示上の分類だけで、Backend条件には含めないか

この論点が未確定のままでは、Atomのキー、選択状態の型、
`defectClass`変換の正しさを確定できない。

### 21.5 境界検討後に行うこと

責務境界とArea・`defectClass`の対応を確認した後に、次を設計する。

- CategoriesのDomain Model
- Atomの状態モデル
- Custom Hookの戻り値と操作
- Categories一覧ComponentのProps
- Category Settingの編集状態
- 第4弾へ渡す入力契約

## 22. 既存実装におけるAreaの調査結果

既存実装を調査した結果、`Area`という名称は存在するが、
画像資料の`Area1`〜`Area3`と同一概念であるとは確認できなかった。

### 22.1 Result DBの検査Area（`areaNo`）

現行Frontend／Backendおよびモック版には、検査対象のAreaを表す`areaNo`が存在する。

主な実装例：

- Result DBの`mps.areaNo`
- `msrs.areaNo`
- `fovs.areaNo`
- `images`相当データの`areaNo`
- Frontendの`getAreaNos`
- Frontendの`selectedAreaNoAtom`
- Backendの`GET /results/{name}/areas`
- 指定AreaのRecipe Mode取得
- Wafer MapのROI、検査済みチップ、FOV情報

この`areaNo`は、Result DBに実際に存在する検査Areaの識別子である。
値の個数はResultごとに変わり得るため、既存実装から「常に3つ」とは言えない。

既存Frontendでは、対象Result名を指定して次のAPIからArea一覧を取得する。

```text
GET results/{jobName}/areas
```

Backendの`read_areas`は、対象ResultのImages DBに対して
`mps.areaNo`、`mps.fovWidth`、`mps.fovHeight`を取得し、
Area情報として返す。Frontendの`getAreaNos`は、そのレスポンスから
`areaNo`だけを抽出して`areaNosAtom`で管理する。

したがって、CategoriesのArea切り替え対象を既存実装に合わせる場合、
第一候補の取得元はこのResult単位のArea一覧APIとなる。

### 22.2 モック版のArea

モック版でも、次の用途で`areaNo`を扱う。

- Wafer Mapの検査済みチップ情報
- ROIのArea別表示
- FOV・チップ・欠陥の関連付け
- Recipe MatchingのArea別グループ化
- Area別の密度・対応結果

モック版のAreaも、DBおよび検査結果に基づく動的な検査Areaである。
画像資料のCategory Settingにある3つの固定タブを実装したものではない。

### 22.3 欠陥情報の`Area`

今回共有された欠陥詳細表示エリアの資料では、
`Area`は`Size X`、`Size Y`等と並ぶ欠陥情報の数値項目として定義されている。
この項目に対応する既存実装は確認できた。

```text
area
  欠陥の面積値。欠陥マスクの面積を表す数値field。
```

確認できた対応関係は次のとおり。

| 層 | 対応 |
|---|---|
| Backend DB | `defects.area` |
| Backend ORM | `Defect.area` |
| Backend Histogram | Histogramの数値fieldとして`area`を登録 |
| Frontend型 | `DefectRecord.area` |
| Frontend欠陥一覧 | `field: "area"`、表示名`Area` |
| モックBackend | `defects`ビューの`area`、`FILTER_COLUMNS["Area"] = "area"` |
| モックUI | 欠陥一覧・詳細表示の`Area`列、Filter対象 |

モック版では、`Area`は欠陥のピクセル面積として扱われ、
単位は`px^2`と説明されている。したがって、今回の資料にある
欠陥情報の`Area`は、既存実装上の`defects.area`に対応すると判断できる。

これは検査領域を表す`areaNo`とは別項目である。

### 22.4 CategoriesのAreaとの現時点の関係

現時点で確認できる事実は次のとおり。

- 既存システムには検査Areaという概念がある。
- 検査Areaは`areaNo`としてResult DBから取得される。
- 既存実装では、検査Areaの個数は固定3ではない。
- 欠陥情報には、別途`area`という面積値がある。
- 欠陥情報の`Area`は既存実装上の`defects.area`に対応する。
- 画像資料では、Category Settingに`Area1`、`Area2`、`Area3`が表示される。
- 画像資料の3つのAreaが既存Result DBの`areaNo`を指すかは未確認。
- `Area × 10カテゴリ`を`defectClass`へ変換する既存実装は未確認。

共有されたADCアノテーション画面の資料では、`Area`が「モデル単位」
「Result単位」「Area別のレシピ設定」という文脈で使われている。
この`Area`は欠陥の面積値ではなく、検査・レシピ設定上のArea番号を
指すと解釈するのが自然である。

したがって、Category Settingに表示される`Area1`〜`Area3`は、
既存実装の検査Area識別子である`areaNo`に対応する可能性が高い。
少なくとも、欠陥情報の数値項目`area`とは区別して扱う必要がある。

したがって、Categories設計では、画像資料のAreaを直ちに既存の`areaNo`へ
結び付けない。まず、次のどちらかを確認する必要がある。

```text
案A：Category SettingのArea1〜3は、Result DBの検査Area（areaNo）を指す
案B：Category SettingのArea1〜3は、カテゴリ機能内だけの論理グループである
```

現時点の第一候補は案Aとする。ただし、次の点は要件またはCategory Setting仕様で
最終確認する。

- サンプルの`Area1`〜`Area3`が、実際の`areaNo`の値（1〜3）を意味するか
- Resultごとに異なるArea数に応じて、Area切り替えを動的に生成するか
- `areaNo`ごとにカテゴリ定義・カテゴリ名・Commentを持つか
- `areaNo`と`defectClass`の対応が固定か、Resultごとに変わるか

### 22.5 Area切り替え数の暫定方針

サンプル画面では`Area1`〜`Area3`が表示されているが、
既存実装の検査AreaはResultごとに個数が変わり得る。
そのため、これは固定3個の設定枠ではなく、
設定された検査Areaの数だけ切り替えられるUIを示したサンプルである可能性が高い。

Categoriesでは、次の動作を第一候補とする。

1. 対象Resultの検査Area一覧を取得する。
2. 取得した各`areaNo`をArea切り替え対象として表示する。
3. 選択中のAreaについて、カテゴリ定義・選択状態・Commentを表示する。
4. Areaを切り替えても、他Areaの設定状態を保持する。

```text
areaNos = [1, 2, 3, ...]
             ↓
Area1 | Area2 | Area3 | ...
             ↓
選択中 areaNo のカテゴリ設定を表示
```

Areaが1つしかない場合は切り替えUIを省略または無効化し、
Areaが存在しない場合はCategoriesのEmpty状態として扱う候補とする。
ただし、これらの表示仕様はCategory Settingの正式要件で確定する。

### 22.6 境界設計への影響

Areaの意味が確定するまで、Categories側の選択キーは次のように暫定扱いとする。

```text
第一候補：categoryKey = { areaNo, categoryNo }
```

Categories第2弾では、既存の`areaNo`をカテゴリ定義・選択状態の属性として
扱えるようにする。`areaNo`と`defectClass`の条件変換、およびBackend Queryへの
反映は第4弾の連携設計で確定する。

## 23. IntegratedViewerでの`areaNo`の利用箇所

IntegratedViewerでは、`areaNo`は主に「検査Areaを選択する値」または
「選択中の画像・FOVが属する検査Areaを示すメタデータ」として使用されている。

### 23.1 Recipe画面：Area一覧とArea別パラメータ

`features/recipe/components/area/AreaList.tsx`では、画面左側に`Area`一覧を表示する。

- `useAreaNos()`で対象ResultのArea番号一覧を取得
- `areaNo`ごとにリスト項目を生成
- クリックした`areaNo`を`selectedAreaNoAtom`へ設定
- 選択中のAreaに対応するRecipe Modeパラメータを表示・編集
- `Apply All`でArea間のパラメータ一括適用を実行

この画面が、既存Frontendで最も明確に「Areaを切り替える」画面である。
表示項目は`Area`、各行の値は実際の`areaNo`である。

### 23.2 Recipe画面：Area別パラメータ

`selectedAreaNoAtom`は、次のようなArea別パラメータHookから参照される。

- Inspection
- ADC
- Matching
- Correction
- Recipe Mode

各パラメータはArea番号をキーとするAtom familyで管理される。
つまり、既存Recipe画面では「Areaを切り替える」と
「そのAreaの設定値を切り替える」が同じ操作として成立している。

### 23.3 IntegratedViewerの情報表示画面

選択中の画像・FOVに属するAreaは、次の情報項目で表示される。

| 画面・コンポーネント | 表示項目 |
|---|---|
| TestRunの画像情報 | `Area No` |
| sFOV情報 | `Area No.` |
| sFOV一覧 | `Area`（内部値は`areano`） |
| 欠陥情報 | `Area No`を直接持たず、画像・FOV側のArea情報と分離 |

これらはAreaを切り替える操作ではなく、
現在選択している画像・FOVの所属Areaを確認するための表示である。

### 23.4 IntegratedViewer Map

Mapでは、`areaNo`は次の用途で使われる。

- mFOVと検査Areaの関連付け
- IDWの`inspectionArea[].no`との対応
- Area境界の描画
- AreaごとのFOVサイズ・座標計算
- 選択FOVのAreaに対応したMPS情報の取得

Map上では、Area番号を一覧テキストとして常に表示するのではなく、
Area境界やFOVの配置として視覚的に表現している。
したがって、MapはAreaの「形状・位置」を表現する画面であり、
Recipe画面のArea一覧とは役割が異なる。

### 23.5 Categories設計への示唆

既存実装との整合性から、CategoriesのArea切り替えは次の構成が最も自然である。

```text
対象Result
  ↓
areaNo一覧（GET results/{jobName}/areas）
  ↓
Area一覧／タブ
  ↓
選択中areaNoのカテゴリ設定
```

画像資料の`Area1`〜`Area3`は、Recipe画面のArea一覧と同じく、
検査Area番号を切り替えるUIとして解釈するのが第一候補である。
一方、欠陥一覧の`Area`列は欠陥面積値であり、
CategoriesのArea切り替えには使用しない。

### 23.6 Areaの概念モデル

現時点では、`areaNo`を次のような検査単位として捉えるのが妥当である。

```text
Recipe
  └─ areaNoごとに検査条件・Recipeパラメータを設定

Result
  └─ areaNoごとに検査結果を保持
       ├─ FOV / sFOV
       ├─ mFOV
       ├─ 欠陥画像
       └─ 欠陥情報との位置関係

IntegratedViewer Map
  └─ areaNoごとの検査領域・FOV・mFOVを配置して表示
```

つまり、Areaは単なる画面上の分類名ではなく、
Recipe設定、検査Result、画像・sFOV情報、Map上の検査領域を結び付ける
識別単位である。

Categoriesでは、この既存の検査単位を前提に、
`areaNo`ごとのカテゴリ定義・カテゴリ選択状態を管理する方向が自然である。
ただし、Area単位のカテゴリ条件をどのように`defectClass`へ対応付け、
後続Featureへ渡すかは第4弾の連携設計で確定する。

## 24. Area×カテゴリ単位の表示定義と永続化

Areaの概念を踏まえると、Categoriesのユーザ要望は次のように解釈できる。

```text
Areaごとに、カテゴリを色分けして確認したい。
カテゴリ名称や色は、Areaごとに変更したい。
```

カテゴリは10種類固定である。一方、Areaごとに名称・色・Comment・アイコン等を
変更する要件を想定すると、カテゴリ表示定義は`categoryNo`だけでは一意にならず、
少なくとも次の組み合わせを識別キーとして扱う必要がある。

```text
categoryDefinitionKey = { areaNo, categoryNo }
```

この単位で、少なくとも次の情報を管理する候補となる。

- カテゴリ名称
- Comment
- 色
- アイコンまたはシンボル
- 表示順
- `defectClass`との対応

### 24.1 表示定義と選択状態の保持を分離する

色や名称などの表示定義をReact stateやAtomだけで保持すると、画面を閉じた時点で設定が失われる。
ユーザがAreaごとのカテゴリ分類を行う機能であれば、毎回再設定が必要となり、
実用上の利便性が低い。

したがって、Category Settingの編集内容は永続保持する。

Categoriesでは、次の状態を分けて管理する。

```text
編集中の値
  └─ Component／Atom上の一時状態

Apply後の確定値
  └─ 永続ストレージから再取得可能な設定
```

画面を閉じて再表示した場合は、確定済みのカテゴリ名称・色・Commentを
永続ストレージから復元する想定を第一候補とする。

一方、Categories一覧のチェック状態は永続化しない。
チェック状態は絞り込み条件として扱い、画面・Snapshot・条件セットの初期化時に
初期状態へ戻す。初期選択値は画面未実装のため確定していないが、
検討用の仮方針として未選択（カテゴリ条件なし）とする。

名称・色・アイコン等の表示定義が未設定でも、カテゴリ自体は有効である。
Categories一覧および他Featureでは、Appendixの既定値を用いて表示する。

### 24.2 永続化のスコープは未確定

共有された資料には、カテゴリ定義を次のどの単位で保持するかという論点がある。

- モデル単位
- Result単位
- 全Result共通
- `common`単位
- ユーザ単位またはユーザ設定

既存の`areaNo`はResultに紐付く検査単位であるため、
`Area × categoryNo`の表示定義をそのまま全Result共通にすると、
同じ`areaNo`でも検査内容が異なる場合に意図しない表示となる可能性がある。

現時点では、次の保存キー候補を比較する。

```text
案A：{ resultName, areaNo, categoryNo }
案B：{ modelId, areaNo, categoryNo }
案C：{ common, areaNo, categoryNo }
```

保存スコープは、`defectClass`の意味がResultごとに変わるか、
カテゴリ名称・色を別Resultでも共有したいかによって決まる。
したがって、永続化そのものはCategoriesの重要な設計対象とし、
保存スコープとBackend契約は追加要件確認後に確定する。

### 24.3 Categories第2弾と第4弾の境界

Categories第2弾では、次を定義対象に含める。

- `Area × categoryNo`を一意に扱えるDomain Model
- 編集中値と確定値の状態分離
- Apply／Close時の状態遷移
- 永続化HookまたはRepositoryとの接続点
- 後続Featureが確定済み表示定義を参照する契約

一方、保存先APIの実装、共通条件への変換、
保存設定をHistogram・Defect List・Wafer Mapへ反映する処理は、
第4弾の各種連携で確定する。

## 25. Area確定前に決められる保持方針

Areaが既存の`areaNo`であるか、Categories固有の論理Areaであるかは、
別途確認して確定する。その確認を待たずに、カテゴリ設定の保持方式については
次の方針を決められる。

### 25.1 Areaは設定レコードの識別属性として扱う

カテゴリ設定は、カテゴリ番号だけでなく、Areaを識別する情報を持つ。
ただし、Areaの具体的な型・名称・取得元は未確定とする。

```text
CategorySetting
├─ areaKey       // Area確定後に型を決定
├─ categoryNo
├─ categoryName
├─ comment
├─ color
├─ symbolType
└─ displayOrder
```

この段階では、`areaKey`を`areaNo`と断定せず、
Areaを表す識別子を受け取れる抽象的な境界として設計する。

### 25.2 編集中・確定済み・保存済みを分離する

画面上のカテゴリ設定は、次の3状態を分けて扱う。

```text
保存済み設定
  ↓ 編集開始
編集中設定
  ├─ Apply → 保存済み設定を更新
  └─ Close／Cancel → 編集前の保存済み設定へ戻す
```

- 保存済み設定：画面を閉じても復元できる確定値
- 編集中設定：Category Setting画面内で変更中の値
- 未保存変更：保存済み設定との差分として判定可能にする

Applyの成功前に、編集中の値を他Featureの表示条件や共有Atomへ
確定値として公開しない。これにより、未保存の名称・色変更と
カテゴリ選択条件を混同しない。

### 25.3 表示定義と選択状態を分離する

カテゴリの色・名称は表示定義であり、チェック状態は操作状態である。
そのため、同じ`CategorySetting`に保持できる場合でも、内部の責務は分離する。

```text
CategoryDefinition
  └─ areaKey, categoryNo, name, color, symbol, displayOrder

CategorySelection
  └─ areaKey, categoryNo, selected
```

表示定義を変更しても、選択状態を意図せず解除しない。
逆に、チェック操作だけでは名称・色の保存値を変更しない。

### 25.4 Area未確定のまま確定できる設計事項

次の事項は、Areaの具体的な意味に依存せず確定できる。

- Areaとカテゴリ番号の組を一意に扱えること
- カテゴリ名称・色・Commentを編集可能な値として扱うこと
- 編集中値と保存済み値を分離すること
- Apply成功時だけ保存済み値を更新すること
- Close／Cancel時に未保存変更を破棄できること
- 表示定義と選択状態を分離すること
- 保存・取得処理をHookまたはRepository境界の外へ漏らさないこと
- 保存失敗を成功扱いにせず、画面へエラーとして通知すること

### 25.5 Area確定後に決める事項

次の事項は、Areaの実体確認後に決定する。

- `areaKey`の具体型
- Area一覧の取得API
- Areaの保存スコープ
- Areaごとのカテゴリ定義の初期生成方法
- `areaKey`と`defectClass`の対応
- AreaをBackend Query条件へ含めるか
- Result・モデル・共通設定のどの単位で再利用するか

したがって、現時点では「Area×カテゴリ単位で永続化可能なモデルを設計する」
ところまでを確定し、具体的なArea識別子と保存スコープは保留する。

## 26. 既存実装における編集破棄確認と更新情報

### 26.1 未保存編集の確認Dialog

Frontendには汎用の`ConfirmDialog`が存在する。

- `isOpen`
- `onConfirm`
- `onCancel`
- ダイアログタイトル・本文
- OK／Cancelボタン表示

既存画面では削除確認などに利用されている。
今回確認した範囲では、Category Settingのような
「未保存編集を破棄してCloseするか」を専用に扱う実装は確認できなかった。

Categoriesでは、既存実装に未保存変更専用の確認Dialogがないこと、
および確認操作が利用者の負担になることを踏まえ、
未保存変更の検知・破棄確認Dialogは設けない。
Close／Cancel時は編集中の値を破棄して画面を閉じる。

### 26.2 Backendの更新情報管理

既存Backendには、更新情報を管理する複数のパターンがある。

#### Recipeの`version`／`revision`

RecipeのCommon／Modeモデルには`version`と`revision`がある。
ただし、現行実装ではPydantic Validatorにより最新値へ固定される。
確認できた範囲では、これらを同時編集検知のための楽観ロック値として
比較するAPI実装は確認できなかった。

#### Datasetの`lastModifiedDate`

Dataset管理では、次の更新情報をDBに保持する。

- `createdDate`
- `lastModifiedDate`

Annotation更新時には現在時刻で`lastModifiedDate`を更新する。
DB初期化時のUPSERTでは、既存値と日時を比較し、
変更がある場合だけレコードを更新する。
ただし、更新リクエストに取得時の日時を添えて一致を検証する
楽観的同時実行制御までは確認できない。

#### Result／ToolDataの排他ロック

ResultやToolDataには、処理中の排他ロックがあり、
ロック中は`409 Conflict`を返す実装がある。
これは同時編集のバージョン管理ではなく、
処理中データへの操作を拒否する仕組みである。

### 26.3 Categoriesへの参考方針

既存実装から直接流用できるのは次の考え方である。

- 保存対象には作成日時・更新日時を持たせる
- 更新処理はDBトランザクション内で実行する
- 保存失敗時は確定済み状態を変更しない
- 必要に応じて`409 Conflict`で競合を明示する
- Frontendでは保存中の二重操作を抑止する

一方、Categories用の更新日時比較による楽観ロック、
整数型の更新バージョン、最終更新者の保持については、
既存の直接的な実装がないため、Backend設計時に追加決定する。

## 27. 追加確定事項（2026-11-19）

本節は、これまでの検討で確定した方針を集約したものである。
本文中の「仮方針」「未確定」と記載された内容と矛盾する場合は、
Areaの正式な意味や上位所有スコープに関する事項を除き、本節を優先する。

### 27.1 カテゴリの対象と条件

- Categoriesの選択対象は通常カテゴリ1〜10とする。
- `defectClass = -1`相当のUnknownと、`defectClass = 0`相当のUnclassifiedは、
  Categoriesの選択対象外とする。
- 通常カテゴリの表示定義が未設定でも、カテゴリ番号自体は有効とし、
  Histogram・Map・Defect Listなど他機能で利用可能とする。
- 現時点では通常カテゴリの`categoryNo`と`defectClass`を同じ数値で対応させる。
- ただし、将来Areaごとなどで対応が変わる可能性を考慮し、
  `categoryNo`から`defectClass`への変換責務はCategories側に置く。
- 未選択はカテゴリ条件なしとする。
- 通常カテゴリを全て選択した場合も、モック版の`All classes`の扱いを踏襲し、
  カテゴリ条件なしとする。
- 同一Area内で複数カテゴリを選択した場合はOR条件とする。
- カテゴリ条件とFilter／Slider条件はAND条件で合成する。
- 複数Areaにまたがるカテゴリ条件は、単一のAND／OR条件へ合成せず、
  Areaごとに独立したクエリ条件として扱う。

### 27.2 Categoriesと第4弾の境界

- Categoriesは、選択されたカテゴリをAreaごとの解決済み`defectClass`一覧へ変換する。
- Categoriesは、選択状態と解決済み条件を状態として保持し、Custom Hook経由で公開する。
- Categoriesは最終的な`DefectFilterConditionSet`を生成しない。
- Areaごとのカテゴリ条件を共通の`DefectFilterConditionSet`へ組み込む処理は、
  第4弾「各種連携」の責務とする。
- SQLや最終的なBackend Query DTOの生成も、Categoriesの責務外とする。
- Mapのデータ絞り込み条件と、取得済みMapレイヤーの表示ON／OFFは分離する。

### 27.3 表示定義と既定値

- カテゴリの存在・`categoryNo`／`defectClass`と、名称・色・アイコン等の
  表示定義を分離する。
- 表示定義が未登録または項目単位で未設定でも、既存の固定10カテゴリ定義を
  既定値として利用する。
- 設定前は既定値を表示し、設定保存後はArea固有設定を優先する。
- Area固有設定がない項目は既定値へフォールバックする。
- 既定値とArea固有設定の解決はCategories側に集約する。
- Histogram・Map・Defect Listなど各Featureは、個別のフォールバック処理を持たず、
  Categoriesが公開する解決済み表示定義を利用する。
- 名称・Commentは未設定時に既定値を`placeholder`で表示する。
- 色・アイコンは既定値を選択可能な状態で表示し、変更時だけArea固有設定として保存する。

### 27.4 色パターン

- 基本色はAppendixを母集団とする。
- 色パターンは単色、縦ストライプ、横ストライプ等のシステム定義された
  パターン母集団から選択する。
- 色の濃淡を固定する方式ではなく、色パターンでArea間を識別する。
- Area数は3に固定しない。
- パターン数もArea数も固定せず、各Areaが母集団から任意に選択できる。
- 同じパターンを複数Areaで再利用できる。
- 同一Area内のカテゴリはAreaに設定された同じ色パターンを使用する。
- パターンはカテゴリ表示定義の一部として永続化対象に含める。
- 利用者が新しい塗り方を作成する機能は、今回の対象に含めない。

### 27.5 Category Settingの表示・操作

- Category Setting画面は開閉可能な構成とし、Apply成功後も画面を開いたままにする。
- Category Settingを開いた状態では、後続のCategoriesやFilter等の項目は下へ移動し、
  必要に応じてスクロールして確認できる構成とする。
- Apply前の編集値は設定画面内の下書きとして扱う。
- Apply成功後に保存済み表示定義として確定する。
- 未保存変更の検知・破棄確認Dialogは設けない。
- Close／Cancel時は未保存の編集値を破棄する。
- 設定取得中は編集項目とApplyを無効化する。
- 設定取得に失敗した場合はエラーを表示し、編集項目とApplyを無効化する。
- 取得失敗時の専用再取得ボタンは設けず、画面再表示や対象再選択など、
  既存の取得契機で再取得する。
- 保存中は編集項目とApplyを無効化し、二重操作を防止する。
- 通常の保存失敗時は編集内容を保持し、エラー表示後に再試行可能とする。
- 楽観ロック競合時も編集内容を保持し、画面を閉じずに最新設定を再取得して
  内容を確認・再編集できるようにする。

### 27.6 設定APIと永続化

- Category SettingのAPIは画面単位ではなく、対象スコープのカテゴリ定義セットを
  リソース単位として扱う。
- 対象スコープの全カテゴリ定義を一括で取得・保存する。
- 10カテゴリ固定をAPIの呼び出し単位にはせず、対象スコープに属する全カテゴリを
  一括処理する。
- 一括保存は全件成功または全件失敗の原子更新とする。
- 未登録の対象スコープを取得した場合は、既定値でカテゴリ定義を返す。
- 初回のApplyで、その定義セットを新規作成する。
- 取得結果には`createdAt`と`updatedAt`を含める。
- 保存時は取得時の`updatedAt`を送信し、Backendで一致を確認する。
- `updatedAt`が一致しない場合は`409 Conflict`を返し、通常の保存失敗と区別する。
- 作成日時・更新日時を保持する。
- バージョン番号や`version`／`revision`による管理は必須としない。
- Backendでは原子的更新のためにDBトランザクションを使用する。
- Frontendでは保存中の操作を無効化する。

### 27.7 他Featureへの反映

- Category Settingで確定した名称・色・アイコン・色パターン等は、
  保存成功直後にHistogram・Map・Defect Listへ反映しない。
- 他Featureは、画面再読み込み時に確定済みの表示定義を取得して反映する。
- カテゴリ設定の変更はデータ絞り込み条件を変更しないため、
  設定保存のためのデータ再取得は行わない。

### 27.8 Areaに関する継続保留

次の事項は、Areaの正式な意味・取得元・保存対象が確認できるまで未確定とする。

- Areaが既存Resultの`areaNo`と同一概念か
- カテゴリ表示定義の上位所有スコープ
  （Result、モデル、Recipe、共通など）
- `areaNo × categoryNo`の正式な保存キー
- Areaごとの`defectClass`対応が将来どのように変更されるか
- Area条件をBackend Queryへ含める正式な形式

現時点では、Areaとカテゴリ番号を組み合わせて扱えるモデルを用意し、
上位の所有スコープと正式なArea契約は保留する。

## 28. 追加確定事項（2026-11-19 継続）

### 28.1 Categoriesエリアと選択状態

- Categoriesエリアの初期表示は閉じる。
- Categoriesエリアを閉じても、同一画面・同一条件セット内ではチェック状態を保持する。
- Category SettingをCloseしても、Categoriesのチェック状態は維持する。
- 画面再読み込み、対象ResultまたはSnapshotの切り替え時には、チェック状態を初期化する。
- Areaごとのチェック状態を復元する方式は、Areaの正式な識別単位が未確定のため保留する。
- Categories第2弾では、Areaを`AreaKey`として受け渡し・保持できる境界だけを用意する。

### 28.2 Category Settingの保存操作

- Category SettingのApplyは、保存済み状態との差分がある場合だけ有効にする。
- Applyは現在表示中のAreaだけを保存対象とする。
- Areaタブを切り替えても自動保存しない。
- 非表示Areaの編集内容をApply対象に含めない。
- Apply成功後は、保存済み状態へ遷移し、編集状態を解除する。
- Close／Cancel時は未保存の編集値を破棄する。
- Reset専用ボタンは追加しない。
- 既定値へ戻す場合は、名称・Commentを既定値へ入力し、色・アイコンを既定値に
  選択してApplyする。

### 28.3 保存対象と既定値

- Category Settingで永続化するのは、名称、Comment、色、アイコン、色パターンとする。
- 表示順、カテゴリ番号、欠陥数、チェック状態は永続化しない。
- 表示順は既存の固定順とし、Category Settingで変更できない。
- Commentは永続化する補足情報だが、Categories一覧・Histogram・Map・Defect Listの
  通常表示や絞り込み条件では使用しない。
- 既定値の正本は今回のAppendixとする。
- 初回Apply時は、利用者が変更していない項目も既定値を含む完全な定義として保存する。
- 既存データや欠損項目については、互換性のため既定値へフォールバックする。

### 28.4 色パターンとArea

- 色パターンは、単色・縦ストライプ・横ストライプ等の母集団から選択する。
- 未設定Areaでも、色パターンはCategory Settingで選択・変更できる。
- Area順の循環割り当ては初期候補として表示するが、利用者が選択した値を優先する。
- Area数・パターン数・Areaとパターンの固定対応は設けない。
- 同じパターンを複数Areaで使用できる。
- 同一Area内のカテゴリはAreaに設定された同じ色パターンを使用する。

### 28.5 カテゴリ件数

- CategoriesはSnapshotを独自取得・集計せず、親Featureまたは後続連携から集計結果を受け取る。
- 件数は、SnapshotにFilter／Slider条件を反映した母集団からカテゴリ別に集計する。
- Categories自身のチェック状態は件数集計条件に含めない。
- カテゴリ定義の取得状態とカテゴリ件数の取得状態は分離する。
- 正常取得した件数が0件の場合は`0`を表示する。
- 件数が未取得または取得失敗の場合は`—`などの未確定表示とする。
- 件数の状態にかかわらず、カテゴリの選択・設定操作は継続可能とする。
- 件数は表示用の集計値であり、永続化しない。

### 28.6 既存実装の利用

- 入力項目の検証・エラー表示は、既存プロジェクトの共通コンポーネントと流儀を
  優先して利用する。
- 取得失敗・保存失敗・409競合は、既存のエラー抽出処理とToast等の通知方式を利用する。
- Categories専用のエラーDialogやLoading Dialogは追加しない。
- Loading中・保存中は、既存のLoading表示と操作無効化を利用する。

## 12. 開発単位と本機能の位置付け

Analysis Viewerの絞り込み条件エリアは、次の4単位に分けて段階的に開発する。

| 区分 | 主な開発内容 | Histogram比の規模感 |
|---|---|---:|
| ① Histogram | Value Range Filter、初期6行、追加・削除・並べ替え、Slider、複数行連鎖、Provider、Snapshot、DuckDB WASM対応境界 | 1.0 |
| ② Categories | カテゴリ一覧、選択・解除、カテゴリ定義・色・順序、Histogram内カテゴリ表示との接続、共通条件への変換 | 0.3〜0.5 |
| ③ Filters | 条件行、項目・演算子・値入力、AND／OR、入力検証、適用・リセット、未適用状態、共通条件モデル化 | 0.8〜1.2 |
| ④ 各種連携 | 共通条件の公開、Histogram再集計、Defect List再取得、Wafer Map再取得、条件変更時の同期、Loading／Error整合 | 0.8〜1.3 |

Histogramを1.0とした場合、全体の相対規模は約2.9〜4.0を目安とする。
これは厳密な工数ではなく、機能間の相対的な複雑度を示す指標である。

本スレッドの対象は、①Histogramに続く②Categoriesである。
Categories単体で完結する仕様と、④各種連携で実装する仕様を分けて検討する。

### 12.1 各開発単位の責務

- **Histogram**：Value Range Filterと複数Histogramの連鎖を成立させる
- **Categories**：カテゴリを表示・選択し、共通条件へ変換できる状態を持つ
- **Filters**：主条件を入力・検証・管理する
- **各種連携**：Categories・Filters・Value Range条件を各表示機能へ反映する

Filtersの条件モデルやAtomの境界は、後続の各種連携を見越して設計する。
ただし、Defect List・Wafer Mapへの実反映は、Categories単体の開発範囲には含めない。

### 12.2 開発順序

```text
① Histogram
  ↓
② Categories
  ↓
③ Filters
  ↓
④ 各種連携
```

## 13. Categories設計の着手方針

Categoriesでは、Histogramで検討・確定した共通部分を再利用する。
一方、Categories固有の未確定事項を解消するため、次の順序で進める。

### Step 1：Histogramからの引き継ぎ境界を確認する

次の項目をCategoriesの前提として固定する。

- `DefectFilterConditionSet`
- `categoryConditions`
- 親Featureによる条件統合
- Component、Hook、Atom、APIの責務分離
- Frontend条件モデルとBackend DTOの分離
- 条件変更時のQuery世代管理
- Loading／Empty／Errorの状態分離

このStepでは、Categories固有の選択仕様をまだ決定しない。

### Step 2：カテゴリの表示定義と選択条件を分離して調査する

次の2種類を混同しない。

1. 表示定義
   - カテゴリ番号
   - 表示名
   - 色
   - アイコン
   - 表示順
2. 選択条件
   - Area
   - チェック状態
   - 選択されたカテゴリ集合
   - Histogram・Map・Defect Listへの適用対象

既存Histogramのカテゴリ定義は1に該当するが、2の仕様根拠にはしない。

### Step 3：Categories単体の画面操作を確定する

次の操作を、モックと画面資料で確認する。

- Categoriesの開閉
- カテゴリ一覧の初期表示
- チェックON／OFF
- Category Settingの開閉
- Area切り替え
- Category Name／Comment編集
- Close、Apply、Resetなどの操作
- 設定変更後の一覧表示更新

ここでは、Mapなど外部Featureへの実反映はまだ決定せず、
Categories内部の状態遷移と確定タイミングを整理する。

### Step 4：共通条件への変換を設計する

Categoriesの選択状態を、Histogram設計書の`categoryConditions`へ変換する。
この段階で初めて、次の事項を確定する。

- 条件の単位
- `defectClass`との対応
- 複数カテゴリのOR／AND
- Areaをまたぐ場合の合成
- 選択なしの意味
- 条件変更時のQuery更新

### Step 5：Histogramとの接続を設計する

Categories単体で保持する選択状態と、Histogramへ渡す条件を接続する。

- Categories変更時にHistogramを再Queryするか
- Histogramのカテゴリ系列表示と選択条件をどう区別するか
- 前回Responseの破棄条件
- Loading／Error時の表示と選択状態維持

### Step 6：④各種連携へ引き渡す境界を記録する

Categoriesの開発では、将来の連携に必要なモデルとHook境界を用意する。
ただし、次の実処理は④へ残す。

- Wafer Mapの再取得・再描画
- Defect Listの再取得
- 複数Feature間のLoading同期
- 共通条件変更時の画面全体同期

## 14. 現時点での推奨着手点

次に着手すべき作業は、**Step 1とStep 2をまとめた「Categories固有調査」**である。

具体的には、次の3点を優先する。

1. モック版でCategories画面を構成する実ファイルを特定する
2. `defectClass`、Area、カテゴリ番号、欠陥数の対応を確認する
3. 既存Frontendのカテゴリ表示定義を、Analysis Viewerで再利用できる範囲を確認する

この調査結果が得られるまで、以下は確定しない。

- `DefectCategoryCondition`の具体型
- チェック条件のAND／OR
- Category Settingの保存方式
- Histogram以外への反映時期
- Backend APIのRequest形式


