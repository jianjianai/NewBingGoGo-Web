let cookies = [
    
]

export default {
    async fetch(request, _env) {
        return await handleRequest(request);
    }
}

/**
 * Respond to the request
 * @param {Request} request
 */
let startReg = new RegExp("^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+");
async function handleRequest(request) {
    if (isEquals(request, "/sydney/ChatHub")) { //魔法聊天
        return bingChatHub(request)
    }
    if (isEquals(request, "/turing/conversation/create")) { //创建聊天
        return goUrl(request, "https://www.bing.com/turing/conversation/create");
    }
    if (isEquals(request, "/msrewards/api/v1/enroll\\?(.*)")) { //加入候补
        let a = request.url.split("?");
        return goUrl(request, "https://www.bing.com/msrewards/api/v1/enroll?" + a[1]);
    }
    if (isEquals(request, "/images/create\\?(.*)")) { //AI画图
        let a = request.url.split("?");
        return goUrl(request, "https://www.bing.com/images/create?" + a[1], {
            "sec-fetch-site": "same-origin",
            "referer": "https://www.bing.com/search?q=bingAI"
        });
    }
    if (isEquals(request, "/images/create/async/results(.*)")) { //请求AI画图图片
        let reg = new RegExp("^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+(/images/create/async/results)");
        let a = request.url.replace(reg, "https://www.bing.com/images/create/async/results");
        return goUrl(request, a, {
            "sec-fetch-site": "same-origin",
            "referer": "https://www.bing.com/images/create?partner=sydney&showselective=1&sude=1&kseed=7000"
        });
    }
    //用于测试
    if (isEquals(request, "/test/(.*)")) {
        let reg = new RegExp(`^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+(${"/test/(.*)"})$`);
        let a = request.url.replace(reg, "$5");
        return goUrl(request, a);
    }
    if (isEquals(request, "/web/(.*)")||isEquals(request, "/favicon.ico")) { //web请求
        let reg = new RegExp("^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+(/)");
        let a = request.url.replace(reg, "https://raw.githubusercontent.com/jianjianai/NewBingGoGo-Web/master/src/main/resources/");
        return await goWeb(a);
    }
    return getRedirect('/web/NewBingGoGo.html');
}

//匹配url
function isEquals(request, path) {
    let reg = new RegExp(`^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+(${path})$`);
    return reg.test(request.url);
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
            "content-type": mimeType
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
    let reqHeaders = new Headers(request.headers);
    let dropHeaders = ["user-agent", "accept", "accept-language"];
    let he = reqHeaders.entries();
    for (let h of he) {
        let key = h[0],
            value = h[1];
        if (dropHeaders.includes(key)) {
            fp.headers[key] = value;
        }
    }
    if (addHeaders) {
        //添加头部信息
        for (let h in addHeaders) {
            fp.headers[h] = addHeaders[h];
        }
    }

    //添加配置的随机cookie
    if (cookies.length == 0) {
        return getReturnError("没有任何可用cookie，请前在第一行代码cookies变量中添加cookie");
    }
    let cookieID =0;
    if(reqHeaders.get('NewBingGoGoWeb')){//如果是web版
        cookieID = Math.floor(Math.random() * cookies.length);
        let userCookieID = reqHeaders.get("cookieID");
        if (userCookieID) {
            if (userCookieID >= 0 && userCookieID < cookies.length) {
                cookieID = userCookieID;
            } else {
                return getReturnError("cookieID不存在，请刷新页面测试！");
            }
        }
        fp.headers["cookie"] = cookies[cookieID];
    }else {//如果是插件版
        fp.headers["cookie"] = reqHeaders.get('cookie');
    }

    //添加X-forwarded-for
    fp.headers['X-forwarded-for'] = `${getRndInteger(3,5)}.${getRndInteger(1,255)}.${getRndInteger(1,255)}.${getRndInteger(1,255)}`;

    let res = await fetch(url, fp);
    let headers = new Headers(res.headers);
    headers.set("cookieID",cookieID);
    return new Response(res.body,{
        status:res.status,
        statusText:res.statusText,
        headers:headers
    });
}

//随机数生成
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//获取用于返回的错误信息
function getReturnError(error) {
    return new Response(JSON.stringify({
        result: {
            value: 'error',
            message: error
        }
    }), {
        status: 200,
        statusText: 'ok',
        headers: {
            "content-type": "application/json"//,
            //"Access-Control-Allow-Origin": "*"
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

//websocket
function bingChatHub(request) {
    // 如果请求包含 Upgrade 头，说明是 WebSocket 连接
    if (request.headers.get('Upgrade') === 'websocket') {
        const webSocketPair = new WebSocketPair()
        const serverWebSocket = webSocketPair[1]
        var bingws = new WebSocket('wss://sydney.bing.com/sydney/ChatHub')
        serverWebSocket.onmessage = event => {
            bingws.send(event.data);
        }
        bingws.onmessage = event => {
            serverWebSocket.send(event.data)
        }
        bingws.onopen = event => {
            serverWebSocket.accept();
        }
        bingws.onclose = event => {
            serverWebSocket.close(event.code, event.reason);
        }
        bingws.onerror = event => {
            serverWebSocket.send(JSON.stringify({
                type: 'error',
                mess: "workers接到bing错误：" + event
            }));
            serverWebSocket.close();
        }
        serverWebSocket.onerror = event => {
            serverWebSocket.close();
        }
        serverWebSocket.onclose = event => {
            bingws.close(event.code, event.reason);
        }

        return new Response(null, { status: 101, webSocket: webSocketPair[0] })
    } else {
        return new Response('这不是websocket请求！')
    }
}
