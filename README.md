# NewBingGoGo-web

一个基于微软OpenAI ChatGPT GPT4的New Bing接口的Web服务。
提供了好看的对话页面。
实现了微软New Bing的大多数功能，还添加了一些自己的特色功能。
开源免费。

![](./docs/img/1.png)

演示站点：
- java https://chat.jja8.cn/
- cloudflareWorker.js https://bingweb.jja8.cn/

## 功能介绍
此服务可直接通过网页访问也可以作为NewBingGoGo插件的魔法链接服务使用。

#### **直接访问** 
直接访问需要在配置文件中设置共享账号，可以设置多个共享账号随机访问。

#### **作为魔法链接**
作为魔法链接使用时，不会使用配置文件中的共享账号。用户需要登录自己的微软账号。


## 部署方法

[快速入门 wiki](https://github.com/jianjianai/NewBingGoGo-Web/wiki/%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8)

### 一件部署到免费的云服务器
|服务商 点击图标一件部署|简介|
|---|---|
|[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/GE_YVq?referralCode=s40fic)|Railway|
|[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jianjianai/NewBingGoGo-Web)|Render|
|[![Deploy to Replit]()](https://replit.com/@jianjianai/NewBingGoGo-Web)|replit|








## 更加强大的插件版
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
一个好消息和一个坏消息
### 好消息
我获得了蓝桥杯省赛一等奖
### 坏消息
因为准备参加国赛，所以暂时停更一段时间，6月10日之后继续更新。
