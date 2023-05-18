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
        return bingChatHub(request)
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
    if (path.startsWith("/web/")||path === "/favicon.ico") { //web请求
        let a = `https://raw.githubusercontent.com/jianjianai/NewBingGoGo-Web/master/src/main/resources${path}`;
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
    let reqHeaders = new Headers(request.headers);
    let dropHeaders = ["user-agent", "accept", "accept-language"];
    for (let h of dropHeaders) {
        fp.headers[h] = reqHeaders.get(h);
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
