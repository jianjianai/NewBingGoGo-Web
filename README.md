# NewBingGoGo-web

NewBingGoGo的web精简版。可用设置多个bing账号轮询。部署后可直接通过网页访问。
适用于自己搭建一个NewBing服务分享给他人使用。

提供了好看的对话页面。
实现了NewBing的大多数功能，还添加了一些自己的特色功能。
开源免费，国内可用！

完整版本：https://gitee.com/jja8/NewBingGoGo

![](./docs/img/1.png)

## 安装和运行
### ubuntu
#### 从源代码编译运行
准备好jdk17环境
~~~
sudo apt install openjdk-17-jdk
~~~

安装git
~~~
sudo apt install git
~~~

克隆源代码
~~~
git clone https://github.com/jianjianai/NewBingGoGo-Web
cd NewBingGoGo-Web
~~~

编译并生成jar包
~~~
./gradlew shadow
~~~

运行 (最后的80代表服务使用的端口号)
~~~
java -jar ./build/libs/NewBingGoGo-web-1.0-SNAPSHOT-all.jar 80
~~~

#### 下载jar包运行

准备好jdk17环境
~~~
sudo apt install openjdk-17-jdk
~~~

运行 (最后的80代表服务使用的端口号)
~~~
java -jar 下载的jar文件.jar 80
~~~

## 配置文件
Cookies.yml 按照格式添加cookie即可
~~~ yaml
cookies: 
    - "你的cookie" 
    - "xxx=xxx; xxx=xxx"
    - "aaa=bbb"
~~~
