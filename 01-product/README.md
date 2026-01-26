# 01-product

产品侧文档：PRD、路线图、产品策略、功能设计。

## 与 07-modules 的重叠关系（刻意的）

同一主题会同时存在两份“视角文档”：

- `01-product/`：产品需求与设计（What/Why）
- `07-modules/`：模块/系统设计与跨端约束（How/Constraints）

规则：**在 `01-product/` 写需求与范围，在 `07-modules/` 写模型/API/实现边界**；两边互相链接，避免重复复制。

## 入口

- [PRD](./prd.md)
- [Roadmap](./roadmap.md)
- [功能设计（按模块分类）](./features/README.md)
- [订阅设计](./subscription-design.md)
- [v1 决策记录](./v1-release-decisions.md)

## 策略与分析

- [产品演进策略](./product-evolution-strategy.md)
- [内容扩展分析](./content-expansion-analysis.md)
- [GTM 策略](../00-market/gtm-strategy.md)
- [UI 语言策略](./ui-language-strategy.md)
- [Web 设计策略](./web-app-design-strategy.md)
- [React Native 设计策略](./react-native-design-strategy.md)
- [iPad 设计策略](./ipad-design-strategy.md)

## 业务与研究

- 业务与研究已集中到 MARKET：`docs/00-market/`
  - [business/](../00-market/business/)
  - [research/](../00-market/research/)

## 模块视角入口

- [跨平台模块与系统设计（07-modules）](../07-modules/README.md)
