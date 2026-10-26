---
tags: [工具]
---

:::warning

目前（2023.10.26）目前zou的网站已改版

:::

# 解除Zou网页的禁止粘贴

从26届开始，Zou布置作业喜欢用他用AI搓的网站http://10.1.11.101:5088

但是此网站不仅强制LaTex输入，还禁止粘贴

作为解除方法，按F12打开控制台在下方输入

```
document.addEventListener('paste', function(e) {
    e.stopImmediatePropagation();
}, true);
```

回车即可

此方法虽然简单，但是每次重新打开需要重新输入