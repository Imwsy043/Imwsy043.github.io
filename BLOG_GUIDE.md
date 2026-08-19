# akimio 博客：修改、预览和发布

这份说明只对应现在使用的本地项目和 GitHub Pages 网站：

```text
本地源码：C:\Users\HUAWEI\PycharmProjects\Myblog
源码分支：main
网页分支：gh-pages
网站地址：https://imwsy043.github.io/
```

以后不要再修改 `C:\Users\HUAWEI\Documents\my_blog_write\.reimu-theme`，也不需要上传腾讯云 ZIP。所有文章、图片和代码都从 `Myblog` 修改，再用命令行发布。

## 1. 在哪里输入命令

1. 用 PyCharm 打开：

```text
C:\Users\HUAWEI\PycharmProjects\Myblog
```

2. 点击 PyCharm 左下角的“终端”图标，也可以按 `Alt + F12`。
3. 终端提示符前面的目录应该是：

```text
PS C:\Users\HUAWEI\PycharmProjects\Myblog>
```

4. 如果不是这个目录，先输入：

```powershell
Set-Location -LiteralPath "C:\Users\HUAWEI\PycharmProjects\Myblog"
```

文档里的所有命令都在这个终端中执行。

## 2. 第一次使用

只需要在第一次使用、换电脑或删除过 `node_modules` 后执行：

```powershell
pnpm.cmd install
```

看到安装完成后就可以继续。平时写文章不需要重复安装。

如果提示找不到 `pnpm.cmd`，先安装 pnpm：

```powershell
npm.cmd install --global pnpm@9.6.0
```

关闭并重新打开终端，再运行 `pnpm.cmd install`。

## 3. 在本地查看网站

在 PyCharm 终端运行：

```powershell
pnpm.cmd dev
```

浏览器打开：

```text
http://localhost:4321/
```

修改文章、文字或样式并保存后，页面通常会自动刷新。检查结束后回到终端，按 `Ctrl + C` 停止本地网站。

本地预览只在自己的电脑上可见，还没有发布到网上。

## 4. 写一篇新博客

文章都放在：

```text
C:\Users\HUAWEI\PycharmProjects\Myblog\src\content\blog
```

1. 在这个文件夹中新建 Markdown 文件。
2. 文件名只用英文、数字和短横线，例如：

```text
summer-night.md
```

3. 将下面模板放进文件：

```markdown
---
title: "文章标题"
description: "一句话摘要。"
pubDate: "2026-08-19"
cover: "/images/summer-night.jpg"
categories: ["日记"]
tags: ["日常"]
---

这里开始写正文。

## 小标题

继续写正文。
```

注意：

- 开头和结尾的 `---` 都不能删除。
- `pubDate` 必须使用 `年-月-日`。
- 没有文章封面时可以整行删除 `cover`。
- 保存后先运行 `pnpm.cmd dev` 检查。

## 5. 给文章添加图片

1. 把图片放到：

```text
C:\Users\HUAWEI\PycharmProjects\Myblog\public\images
```

2. 图片名建议使用英文，例如：

```text
summer-night.jpg
```

3. 在文章正文里使用：

```markdown
![夏夜](/images/summer-night.jpg)
```

4. 想把它设为文章封面，在文章开头写：

```yaml
cover: "/images/summer-night.jpg"
```

图片路径前面不要写 `public`。

## 6. 修改首页轮播横幅

三张轮播图位于：

```text
public\images\home\banner-station.jpg
public\images\home\banner-seaside.jpg
public\images\home\banner-blue-night.png
```

最简单的换图方法：用新图片覆盖对应文件，文件名和扩展名保持不变。

轮播列表和切换时间位于：

```text
src\config.ts
```

找到：

```ts
home_banner_slideshow: {
  enable: true,
  interval: 6000,
  images: [
      "/images/home/banner-station.jpg",
      "/images/home/banner-seaside.jpg",
      "/images/home/banner-blue-night.png",
  ],
},
```

`6000` 表示每 6 秒切换一次。

横幅使用 `cover`：图片会裁掉一部分边缘来填满整个横幅，不会出现左右或上下空白。这是正常的目标效果，不是“显示完整图片”。

## 7. 修改头像和网站文字

主要配置文件：

```text
src\config.ts
```

头像：

```ts
sidebar: {
  avatar: "/images/akimio.jpg",
  position: "left",
},
```

网站标题、作者和简介位于同一文件顶部的 `site` 中。导航文字翻译位于：

```text
src\languages\zh-cn.ts
```

## 8. 发布到 GitHub Pages

发布前先保存所有文件，并用 `pnpm.cmd dev` 检查效果。然后按 `Ctrl + C` 停止预览，运行：

```powershell
pnpm.cmd run deploy
```

这一个命令会自动完成：

1. 构建网站。
2. 把完整源码提交并推送到 GitHub 的 `main` 分支。
3. 把生成的网站提交并推送到 `gh-pages` 分支。
4. 输出网站地址。

想给这次发布写清楚说明，可以改用：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\publish.ps1" -Message "发布新的日记"
```

看到下面这行表示命令执行完成：

```text
Published: https://imwsy043.github.io/
```

GitHub Pages 通常需要几十秒到几分钟更新。稍等后打开：

```text
https://imwsy043.github.io/
```

如果仍是旧页面，按 `Ctrl + F5` 强制刷新。

## 9. 以后每次更新的固定顺序

```text
在 Myblog 中修改文章或图片
-> pnpm.cmd dev
-> 浏览器检查
-> Ctrl + C
-> pnpm.cmd run deploy
-> 等待 GitHub Pages 更新
-> 打开线上网站并按 Ctrl + F5 检查
```

不需要手动压缩 ZIP，不需要把 `dist` 拖进网页，也不要直接修改 `gh-pages` 分支。

## 10. 常见错误

### `No package.json found`

终端目录不对。运行：

```powershell
Set-Location -LiteralPath "C:\Users\HUAWEI\PycharmProjects\Myblog"
```

### 构建提示文章标题或日期无效

检查文章开头是否有完整的两组 `---`，并确认包含：

```yaml
title: "标题"
description: "摘要"
pubDate: "2026-08-19"
```

### 图片不显示

确认：

- 图片位于 `public\images`。
- 文章路径以 `/images/` 开头。
- 文件名和扩展名完全一致。
- 发布前已经重新运行 `pnpm.cmd run deploy`。

### GitHub 要求登录

按照终端或系统弹窗登录 GitHub。登录成功后重新运行：

```powershell
pnpm.cmd run deploy
```

### 线上页面没有更新

先确认终端最后出现 `Published:`，再等待一两分钟并按 `Ctrl + F5`。如果发布命令中途显示红色错误，先解决错误，不要把它当成已经发布成功。
