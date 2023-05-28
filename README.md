# NewBingGoGo-web

一个基于微软OpenAI ChatGPT GPT4的New Bing接口的Web服务。
提供了好看的对话页面。
实现了微软New Bing的大多数功能，还添加了一些自己的特色功能。
开源免费。

## 主要功能展示
### 聊天功能
聊天实现了NewBing的大多数功能，搜索，画图，天气，地图等等。
![1](https://github.com/jianjianai/NewBingGoGo-Web/assets/59829816/f951030f-7941-4ec7-887c-355d003a67be)

### 创作功能
创作实现了NewBing侧边栏的撰写的大多数功能，可更具需求生成文章。
![1 2](https://github.com/jianjianai/NewBingGoGo-Web/assets/59829816/c6469529-0571-4a5d-8161-1a9707f52592)

### 小窗功能 (插件专属)
小窗实现了NewBing侧边栏的根据当前页面信息问答的功能，可以在同一个页面中同时打开多个小窗同时问答，高效地查阅资料和完成文章编辑工作。
![1 1](https://github.com/jianjianai/NewBingGoGo-Web/assets/59829816/09d6cf75-f870-4c04-8809-70a3d7bc9817)


演示站点：
- repl java https://newbinggogo-web--jianjianai.repl.co (没配置账号)
- java https://chat.jja8.cn/ (加了一个我小号，轻掠)
- cloudflareWorker.js https://bingweb.jja8.cn/  (没配置账号)

## 功能介绍
此服务可直接通过网页访问也可以作为NewBingGoGo插件的魔法链接服务使用。

#### **直接访问** 
直接访问需要在配置文件中设置共享账号，可以设置多个共享账号随机访问。

#### **作为魔法链接**
作为魔法链接使用时，不会使用配置文件中的共享账号。用户需要登录自己的微软账号。


## 部署方法

[快速入门 wiki](https://github.com/jianjianai/NewBingGoGo-Web/wiki/%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8)

### 一键部署到免费的云服务器
|服务商 点击图标一键部署|简介|
|---|---|
|[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/GE_YVq?referralCode=s40fic)|Railway|
|[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jianjianai/NewBingGoGo-Web)|Render|
|[![Deploy to Replit]()](https://replit.com/@jianjianai/NewBingGoGo-Web)|replit|


## 注意区分
### NewBingGoGo-web
NewBingGoGo-web是一个网页服务，用户可以直接打开网页，在网页上聊天。
但是由于网页的限制，用户是不能在网页上登录自己的微软账号的，必须使用服务端上配置的共享账号。

### NewBingGoGo
NewBingGoGo是一个浏览器插件，浏览器插件不同于网页，浏览器插件的权限更高。
所以在使用NewBingGoGo插件的时候，NewBingGoGo插件会从浏览器中自动获取当前登录的微软账号。

### NewBingGoGo-web 作为 NewBingGoGo 的魔法链接
NewBingGoGo-web既可以是一个网页服务，也可以是NewBingGoGo的魔法链接服务。当NewBingGoGo设置好魔法链接之后，就可以通过NewBingGoGo-web来代理聊天。
这个时候NewBingGoGo-web不会使用服务端上配置的共享账号，而是使用用户浏览器中当前登录的微软账号。

### 总结
搭建NewBingGoGo-web服务后，如果想直接打开网页使用则需要配置共享账号。如果仅仅作为NewBingGoGo的魔法链接使用则不需要配置共享账号。


## 关于
交流群：601156371


## 更加强大的NewBingGoGo插件
浏览器插件版的NewBingGoGo不受到网页的限制，更加强大。可以登录自己的微软账号，速度更快，更稳定。

[NewBingGoGo : 简单开始和NewBing聊天 gitee](https://gitee.com/jja8/NewBingGoGo)

| 功能     | 插件版 | web版 | 描述                                     |
|--------|-----|------|----------------------------------------|
| 聊天     | ✔   | ✔    | 和New Bing对话，提出问题。                      |
| 生成图片   | ✔   | ✔    | 在有更创造力选项中让New Bing生成图片                 |
| 提示词    | ✔   | ✔    | 使用提示词使AI更好地理解需求                        |
| 免登录    | ❌   | ✔    | 无需登录，直接使用。                             |
| 创作     | ✔   | ✔    | 使用New Bing生成文章，Edge浏览器New Bing侧边栏的撰写功能 |
| 小窗     | ✔   | ❌    | 在页面中打开小窗，可根据当前页面内容对话。Edge浏览器侧边栏的聊天功能   |
| 聊天记录   | ✔   | ✔    | 保存聊天记录，可查看或继续聊天                        |
| 登录微软账号 | ✔   | ❌    | 登录微软账号，使用自己的账号访问New Bing               |
| 内容卡片   | ✔   | ✔    | 显示天气，查找图片，地图等等。                        |
| 通过机器人验证| ✔ | ✔  | 当请求频繁时，微软要求通过机器人验证，就是输入验证码|


## 其他
暂时停更一段时间，6月10日之后继续更新。
