let joinStats = true;  //可选加入统计。 加入统计不会收集任何隐私信息，仅统计访问量。
let webPath = 'https://raw.githubusercontent.com/jianjianai/NewBingGoGo-Web/master/src/main/resources'; //web页面地址，可以修改成自己的仓库来自定义前端页面
let serverConfig = {
    "h1": "jianjian’s NewBingGoGo 此服务正在测试！",
    "h2": "欢迎使用‘简简aw’的超高速聊天服务！",
    "p": "鼓励大家自己搭建聊天服务，于是就安排了自定义标题,自定义消息和自定义建议功能。如果朋友使用你的魔法链接就可以看见你设置的标题,消息和建议哦！",
    "firstMessages":[
        "欢迎使用‘简简aw’NewBingGoGo聊天服务！那么我们愉快地开始吧！",
        "‘简简aw’NewBingGoGo聊天服务稳定又好用，那么开始愉快地聊天吧！",
        "你想了解‘简简aw’吗？那么开始愉快地聊天吧！"
    ],
    "firstProposes":[
        "‘简简aw’是谁？",
        "我想了解‘简简aw’",
        "‘简简aw’有多少粉丝？",
        "‘简简aw’的b站主页是什么？",
        "‘简简aw’是学生吗？",
        "‘简简aw’发过哪些视频？",
        "NewBingGoGo的作者是‘简简aw’吗？"
    ]
}
let cookies = [
    ""
]


export default {
    async fetch(request, _env) {
        return await handleRequest(request);
    }
}
let serverConfigString = JSON.stringify(serverConfig);
/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
    let url = new URL(request.url);
    let path = url.pathname;

    if(path === '/challenge'){//过验证的接口
        let r = url.searchParams.get('redirect');
        if (r){
            return getRedirect(r);
        }
        return new Response(`验证成功`,{
            status: 200,
            statusText: 'ok',
            headers: {
                "content-type": "text/html; charset=utf-8"
            }
        })
    }

    if (path === '/sydney/ChatHub') { //魔法聊天
        return await websocketHandler(request)
    }
    if (path === "/turing/conversation/create") { //创建聊天
        return goUrl(request, "https://www.bing.com/turing/conversation/create");
    }

    if(path==="/edgesvc/turing/captcha/create"){//请求验证码图片
        return goUrl(request,"https://edgeservices.bing.com/edgesvc/turing/captcha/create");
    }
    if(path==="/edgesvc/turing/captcha/verify"){//提交验证码
        return goUrl(request,"https://edgeservices.bing.com/edgesvc/turing/captcha/verify?"+ url.search);
    }

    if (path.startsWith('/msrewards/api/v1/enroll')) { //加入候补
        return goUrl(request, "https://www.bing.com/msrewards/api/v1/enroll" + url.search);
    }
    if (path === '/images/create') { //AI画图
        return goUrl(request, "https://www.bing.com/images/create" + url.search, {
            "sec-fetch-site": "same-origin",
            "referer": "https://www.bing.com/search?q=bingAI"
        });
    }
    if (path.startsWith('/images/create/async/results')) { //请求AI画图图片
        url.hostname = "www.bing.com";
        return goUrl(request, url.toString(), {
            "sec-fetch-site": "same-origin",
            "referer": "https://www.bing.com/images/create?partner=sydney&showselective=1&sude=1&kseed=7000"
        });
    }
    if (path.startsWith('/rp')) { //显示AI画图错误提示图片
        url.hostname = "www.bing.com";
        return goUrl(request, url.toString(), {
            "sec-fetch-site": "same-origin",
            "referer": "https://www.bing.com/search?q=bingAI"
        });
    }
    //用于测试
    if (path.startsWith("/test/")) {
        let a = path.replace("/test/",'');
        return goUrl(request, a);
    }
    //请求服务器配置
    if(path==='/web/resource/config.json'){
        return new Response(serverConfigString,{
            status: 200,
            statusText: 'ok',
            headers: {
                "content-type": "application/x-javascript; charset=utf-8",
                "cache-control":"max-age=14400"
            }
        })
    }
    if (path.startsWith("/web/")||path === "/favicon.ico") { //web请求
        if(!joinStats){
            if(path==="/web/js/other/stats.js"){
                return new Response("console.log(\"未加入统计\");",{
                    status: 200,
                    statusText: 'ok',
                    headers: {
                        "content-type": "application/x-javascript; charset=utf-8",
                        "cache-control":"max-age=14400"
                    }
                })
            }
        }
        let a = `${webPath}${path}`;
        return await goWeb(a);
    }
    return getRedirect('/web/NewBingGoGo.html');
}


async function goWeb(path) {
    let res = await fetch(path);
    let mimeType;
    if (path.endsWith(".html")) {
        mimeType = "text/html; charset=utf-8";
    } else if (path.endsWith(".js")) {
        mimeType = "application/x-javascript; charset=utf-8";
    } else if (path.endsWith(".css")) {
        mimeType = "text/css; charset=utf-8";
    } else if (path.endsWith(".png")) {
        mimeType = "image/png";
    } else if (path.endsWith(".ico")) {
        mimeType = "image/png";
    }
    return new Response(res.body, {
        status: 200,
        statusText: 'ok',
        headers: {
            "content-type": mimeType,
            "cache-control":"max-age=14400"
        }
    });
}

//请求某地址
async function goUrl(request, url, addHeaders) {
    //构建 fetch 参数
    let fp = {
        method: request.method,
        headers: {}
    }
    //保留头部信息
    let reqHeaders = request.headers;
    let dropHeaders = ["user-agent", "accept", "accept-language"];
    for (let h of dropHeaders) {
        if (reqHeaders.has(h)) {
            fp.headers[h] = reqHeaders.get(h);
        }
    }
    if (addHeaders) {
        //添加头部信息
        for (let h in addHeaders) {
            fp.headers[h] = addHeaders[h];
        }
    }


    let cookieID = 0;
    if(reqHeaders.get('NewBingGoGoWeb')){//如果是web版
        //添加配置的随机cookie
        if (cookies.length === 0) {
            return getReturnError("没有任何可用cookie，请前在第一行代码cookies变量中添加cookie");
        }
        cookieID = Math.floor(Math.random() * cookies.length);
        let userCookieID = reqHeaders.get("cookieID");
        if (userCookieID) {
            if (userCookieID >= 0 && userCookieID <= cookies.length-1) {
                cookieID = userCookieID;
            } else {
                return getReturnError("cookieID不存在，请刷新页面测试！");
            }
        }
        fp.headers["cookie"] = cookies[cookieID];
    }else {//如果是插件版
        fp.headers["cookie"] = reqHeaders.get('cookie');
    }

    //客户端指定的随机地址
    let randomAddress = reqHeaders.get("randomAddress");
    if(!randomAddress){
        randomAddress = "12.24.144.227";
    }
    //添加X-forwarded-for
    fp.headers['X-forwarded-for'] = randomAddress;

    let res = await fetch(url, fp);
    let headers = new Headers(res.headers);
    headers.set("cookieID",cookieID);
    return new Response(res.body,{
        status:res.status,
        statusText:res.statusText,
        headers:headers
    });
}

//获取用于返回的错误信息
function getReturnError(error) {
    return new Response(JSON.stringify({
        value: 'error',
        message: error
    }), {
        status: 200,
        statusText: 'ok',
        headers: {
            "content-type": "application/json",
            "NewBingGoGoError":'true'
        }
    })
}

//返回重定向
function getRedirect(url) {
    return new Response("正在重定向到" + url, {
        status: 302,
        statusText: 'redirect',
        headers: {
            "content-type": "text/html",
            "location": url
        }
    })
}




/**
 * @param serverWebSocket {WebSocket}
 * */
async function handleSession(serverWebSocket) {
    let isAccept = false;
    let bingws = new WebSocket('wss://sydney.bing.com/sydney/ChatHub');
    serverWebSocket.addEventListener("message", event => {
        bingws.send(event.data);
    });
    bingws.addEventListener("message", event => {
        serverWebSocket.send(event.data)
    });
    bingws.addEventListener("open", event => {
        isAccept = true;
        serverWebSocket.accept();
    })
    bingws.addEventListener("close", event => {
        serverWebSocket.close(event.code, event.reason);
    })
    bingws.addEventListener("error", event => {
        if(!isAccept){
            serverWebSocket.accept();
        }
        serverWebSocket.send(JSON.stringify({
            type: 'error',
            mess: "workers接到bing错误：" + event.message
        }));
        serverWebSocket.close();
    });
    serverWebSocket.addEventListener("error", event => {
        serverWebSocket.close();
    })
    serverWebSocket.addEventListener("close",event => {
        bingws.close(event.code, event.reason);
    });
}

const websocketHandler = async request => {
    const upgradeHeader = request.headers.get("Upgrade")
    if (upgradeHeader !== "websocket") {
        return new Response("Expected websocket", { status: 400 })
    }

    const [client, server] = Object.values(new WebSocketPair())
    await handleSession(server)

    return new Response(null, {
        status: 101,
        webSocket: client
    })
}

