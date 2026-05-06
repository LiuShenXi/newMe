# NewMe 架构图谱预览

这个文件用于 VS Code / Cursor 的 Markdown Preview。`.mmd` 是 Mermaid 源文件，`assets/*.svg` 是已导出的预览图。

修改 `.mmd` 后，运行下面命令刷新 SVG：

```bash
for f in docs/architecture/diagrams/*.mmd; do
  b=$(basename "$f" .mmd)
  PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    pnpm dlx @mermaid-js/mermaid-cli \
    -i "$f" \
    -o "docs/architecture/diagrams/assets/$b.svg"
done
```

## 01 系统上下文

![系统上下文](assets/01-system-context.svg)

## 02 容器架构

![容器架构](assets/02-container-architecture.svg)

## 03 移动端架构

![移动端架构](assets/03-mobile-architecture.svg)

## 04 后端组件

![后端组件](assets/04-backend-components.svg)

## 05 核心业务闭环

![核心业务闭环](assets/05-core-business-loop.svg)

## 06 冷启动三路径

![冷启动三路径](assets/06-cold-start-flows.svg)

## 07 AI 生成时序

![AI 生成时序](assets/07-ai-generation-sequence.svg)

## 08 离线同步时序

![离线同步时序](assets/08-offline-sync-sequence.svg)

## 09 领域 ER

![领域 ER](assets/09-domain-er.svg)

## 10 API 契约映射

![API 契约映射](assets/10-api-contract-map.svg)

## 11 部署拓扑

![部署拓扑](assets/11-deployment-topology.svg)

## 12 鉴权会话时序

![鉴权会话时序](assets/12-auth-session-sequence.svg)

## 13 周结算到成长树时序

![周结算到成长树时序](assets/13-settlement-tree-sequence.svg)

## 14 原型还原映射

![原型还原映射](assets/14-prototype-parity-map.svg)

## 15 状态机

![状态机](assets/15-state-machines.svg)

## 16 UML 用例图

![UML 用例图](assets/16-uml-use-case.svg)

## 17 UML 组件图

![UML 组件图](assets/17-uml-component.svg)

## 18 UML 领域类图

![UML 领域类图](assets/18-uml-domain-class.svg)

## 19 UML 部署图

![UML 部署图](assets/19-uml-deployment.svg)
