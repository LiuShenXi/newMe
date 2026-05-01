1. 始终全程使用中文进行交流，包括回复和思考模式。
2. 产品原型修改后，要同步修改产品设计文档等。
3. 尽量使用 superpowers 进行全开发流程管理。
4. 若改完代码后需要重启才能看到更改效果，有必要重启你就直接重启，不需要问我，我需要实时看到更新效果。
5. 迭代完成后，进行收口时，如果实际开发和最开始的规划文档等不一样，需要一并改掉文档，保持文档和实际一致。
6. 原型：prototype/index.html，产品需求文档：产品需求设计文档.md
7. 用 npx playwright 做原型页面检查、截图、视觉验证等。
8. 大模型调用策略：优先使用本地服务（base_url: `http://127.0.0.1:4100/v1`，key: local-dev-key，model: local-qwen-coder），连不上时降级到智谱 GLM（base_url: `https://open.bigmodel.cn/api/paas/v4`，key: 3b825790587b48f78e9b138b0cc67bf4.I9nlaVSEsFZjngfU，model: glm-4-flash）。
