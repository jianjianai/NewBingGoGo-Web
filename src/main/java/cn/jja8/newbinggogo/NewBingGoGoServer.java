package cn.jja8.newbinggogo;

import cn.jja8.config.tool.YamlConfig;
import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

public class NewBingGoGoServer extends NanoWSD {
    ScheduledExecutorService scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();
    public static void main(String[] args) {
        if(args.length<1){
            System.err.print("需要指定运行端口号！");
            return;
        }
        //加载配置文件
        new YamlConfig()
                .load(new File("Cookies.yml"))
                .as(Config.class)
                .save(new File("Cookies.yml"));
        WebWork.init();
        //启动
        try{
            int porint = Integer.parseInt(args[0]);
            System.out.println("程序已在"+porint+"端口上启动.");
            new NewBingGoGoServer(porint).start(5000,false);
        }catch(Throwable s){
            s.printStackTrace();
        }
    }
    public NewBingGoGoServer(int port) {
        super(port);
    }

    @Override
    public Response serveHttp(IHTTPSession session) {
        String ip = new Date()+":"+getIp(session);
        String url = session.getUri();

        if(url.equals("/challenge")){//过cf验证的接口
            System.out.println(ip+":请求通过验证");
            List<String> pars = session.getParameters().get("redirect");
            if(pars!=null&&pars.size()>0){
                return redirectTo(pars.get(0));
            }
            return NanoHTTPD.newFixedLengthResponse(Response.Status.OK,"text/html","验证成功");
        }
        if(url.equals("/turing/conversation/create")){//创建聊天
            System.out.println(ip+":请求创建聊天");
            return goUrl(session,"https://www.bing.com/turing/conversation/create",Map.of(
                    "referer","https://www.bing.com/search?q=Bing+AI"
            ));
        }
        if(url.equals("/edgesvc/turing/captcha/create")){//请求验证码图片
            System.out.println(ip+":请求验证码图片");
            return goUrl(session,"https://edgeservices.bing.com/edgesvc/turing/captcha/create",Map.of(
                    "referer","https://edgeservices.bing.com/edgesvc/chat?udsframed=1&form=SHORUN&clientscopes=chat,noheader,channelstable,&shellsig=709707142d65bbf48ac1671757ee0fd1996e2943&setlang=zh-CN&lightschemeovr=1"
            ));
        }
        if(url.equals("/edgesvc/turing/captcha/verify")){//提交验证码
            System.out.println(ip+":提交验证码");
            return goUrl(session,"https://edgeservices.bing.com/edgesvc/turing/captcha/verify?"+session.getQueryParameterString(),Map.of(
                    "referer","https://edgeservices.bing.com/edgesvc/chat?udsframed=1&form=SHORUN&clientscopes=chat,noheader,channelstable,&shellsig=709707142d65bbf48ac1671757ee0fd1996e2943&setlang=zh-CN&lightschemeovr=1"
            ));
        }
        if(url.equals("/msrewards/api/v1/enroll")){//加入候补
            System.out.println(ip+":请求加入候补");
            return goUrl(session,"https://www.bing.com/msrewards/api/v1/enroll?"+session.getQueryParameterString());
        }
        if(url.equals("/images/create")){
            System.out.println(ip+":请求AI画图");
            Response re =  goUrl(session,"https://www.bing.com/images/create?"+session.getQueryParameterString(),Map.of(
                    "referer","https://www.bing.com/search?q=bingAI"
            ));
            re.setMimeType("text/html");
            return re;
        }
        if(url.startsWith("/images/create/async/results")){
            System.out.println(ip+":请求AI画图图片");
            String gogoUrl = url.replace("/images/create/async/results","https://www.bing.com/images/create/async/results");
            gogoUrl = gogoUrl+"?"+session.getQueryParameterString();
 //           /641f0e9c318346378e94e495ab61a703?q=a+dog&partner=sydney&showselective=1
            return goUrl(session, gogoUrl,Map.of(
                    "referer","https://www.bing.com/images/create?partner=sydney&showselective=1&sude=1&kseed=7000"
            ));
        }

        if(url.startsWith("/rp")){
            System.out.println(ip+":请求AI画图错误图片");
            String gogoUrl = url.replace("/rp","https://www.bing.com/rp");
            gogoUrl = gogoUrl+"?"+session.getQueryParameterString();
            return goUrl(session, gogoUrl,Map.of(
                    "referer","https://www.bing.com/search?q=bingAI"
            ));
        }

        //用于测试
        if(url.startsWith("/test/")){
            String gogoUrl = url.replace("/test/","");
            return goUrl(session, gogoUrl);
        }
        //返回页面
        if(url.startsWith("/web/")||url.equals("/favicon.ico")){
            if (!Config.joinStats) {
                if(url.equals("/web/js/other/stats.js")){
                    return NanoHTTPD.newFixedLengthResponse(
                            Response.Status.OK,
                            "application/x-javascript; charset=utf-8",
                            "console.log(\"未加入统计\");"
                    );
                }
            }
            return WebWork.getFile(url);
        }
        return redirectTo("/web/NewBingGoGo.html");
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        String ip = new Date()+":"+getIp(handshake);
        String url = handshake.getUri();
        if(url.equals("/sydney/ChatHub")){
            System.out.println(ip+":创建魔法聊天连接");
            Map<String,String> httpHeaders = new HashMap<>();
            String[] b = {"Accept-Language","Accept-Encoding"};//保留请求头
            Map<String, String> header = handshake.getHeaders();
            for (String s : b) {
                String v = header.get(s.toLowerCase());
                httpHeaders.put(s,v);
            }
            httpHeaders.put("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57");
            httpHeaders.put("Host","sydney.bing.com");
            httpHeaders.put("Origin","https://www.bing.com");
            List<String> ls = handshake.getParameters().get("randomAddress");
            String add = null;
            if(ls!=null){
                if(ls.size()>0){
                    add = ls.get(0);
                }
            }
            if(add!=null){
                httpHeaders.put("X-forwarded-for",add);
            }
            return new NewBingGoGoServerWebSocket(handshake,httpHeaders,scheduledExecutorService);
        }
        return getReturnErrorWebSocket(handshake,"请求接口错误！");
    }

    public static String getIp(IHTTPSession session){
        String ip = session.getHeaders().get("x-forwarded-for");
        if (ip==null){
            ip = session.getRemoteIpAddress();
        }else {
            ip = ip.split(",")[0];
        }
        return ip;
    }

    /**
     * 返回302重定向
     * */
    public static Response redirectTo(String stringUrl){
        Response response = NanoHTTPD.newFixedLengthResponse(
                Response.Status.FOUND,
                "application/json",
                "正在重定向到"+stringUrl
        );
        response.addHeader("Location",stringUrl);
        return  response;
    }

    /*
     * 转发请求
     */
    public static Response goUrl(IHTTPSession session, String stringUrl){
        return goUrl(session,stringUrl,new HashMap<>(1));
    }


    public static Response goUrl(IHTTPSession session, String stringUrl, Map<String,String> addHeaders){
        URL url;
        try {
            url = new URL(stringUrl);
        } catch (MalformedURLException e) {
            return getReturnError(e);
        }

        HttpURLConnection urlConnection;
        try{
            urlConnection = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
           return getReturnError(e);
        }
        try {
            urlConnection.setRequestMethod("GET");
        } catch (ProtocolException e) {
            return getReturnError(e);
        }
        urlConnection.setDoOutput(false);
        urlConnection.setDoInput(true);
        urlConnection.setUseCaches(true);
        urlConnection.setInstanceFollowRedirects(true);
        urlConnection.setConnectTimeout(3000);

        //拷贝头信息
        Map<String,String> header = session.getHeaders();
        String[] b = {"accept", "accept-language","accept-encoding"};
        for (String s : b) {
            String v = header.get(s.toLowerCase());
            urlConnection.addRequestProperty(s,v);
        }

        urlConnection.addRequestProperty("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57");

        //添加指定的头部信息
        addHeaders.forEach(urlConnection::addRequestProperty);

        int cookieID = 0;
        //如果是NewBingGoGoWeb版本
        if(header.get("newbinggogoweb")!=null){
            //添加配置的随机cookie
            if(Config.cookies.length == 0){
                return getReturnError("没有任何可用cookie，请前往Cookies.yml添加cookie");
            }
            cookieID  = (int) (Math.random()* Config.cookies.length);;
            String cookieIDString = header.get("cookieid");
            if(cookieIDString!=null){
                try{
                    cookieID = Integer.parseInt(cookieIDString);
                    if (cookieID<0||cookieID>= Config.cookies.length){
                        return getReturnError("cookieID '"+cookieID+"' 不存在，请刷新cookieID！<a href=\"?\">点击刷新</a>");
                    }
                }catch (NumberFormatException e){
                    return getReturnError("cookieID错误，请刷新cookieID！<a href=\"?\">点击刷新</a>",e,false);
                }
            }
            String cookie = Config.cookies[cookieID];
            System.out.println("web版使用第"+cookieID+"个"+cookie);
            urlConnection.addRequestProperty("cookie",cookie);
        }else {//如果不是
            System.out.println("插件版无需cookie");
            urlConnection.addRequestProperty("cookie",header.get("cookie"));
        }

        //客户端指定的随机地址
        String randomAddress = header.get("randomaddress");
        if(randomAddress==null){
            randomAddress = "12.24.144.227";
        }
        //添加X-forwarded-for
        urlConnection.addRequestProperty("x-forwarded-for", randomAddress);

        //建立链接
        try {
            urlConnection.connect();
        } catch (IOException e) {
            return getReturnError(e);
        }
        int code;
        try{
            code = urlConnection.getResponseCode();
        } catch (IOException e) {
            return getReturnError(e);
        }
        //获取请求状态代码
        if(code!=200){
            urlConnection.disconnect();
            return getReturnError("此魔法链接服务器请求被bing拒绝！请稍后再试。错误代码:"+code,null,false);
        }

        Map<String, java.util.List<String>> responseHeader = urlConnection.getHeaderFields();

        //将数据全部读取然后关闭流和链接
        int len = urlConnection.getContentLength();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream(Math.max(len, 0));
        try(InputStream inputStream = urlConnection.getInputStream()){
            for (int i = 0; i < len; i++) {
                byteArrayOutputStream.write(inputStream.read());
            }
        }catch (FileNotFoundException e){
            urlConnection.disconnect();
            return getReturnError("此魔法链接服务器无法正常工作，请求被bing拒绝！",e,false);
        }catch (IOException e) {
            urlConnection.disconnect();
            return getReturnError(e);
        }
        String contentType = urlConnection.getContentType();
        urlConnection.disconnect();

        //创建用于输出的流
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(byteArrayOutputStream.toByteArray());
        Response response = NanoHTTPD.newFixedLengthResponse(
                Response.Status.OK,
                contentType,
                byteArrayInputStream,
                len
        );
        //保留返回头
        responseHeader.forEach((s, strings) -> {
            if(s!=null
                    && !s.equals("Content-Length")
                    && !s.equals("Content-Type")
            ){
                for (String string : strings) {
                    response.addHeader(s, string);
                }
            }
        });
        response.addHeader("cookieID", String.valueOf(cookieID));
        return response;
    }

    public static WebSocket getReturnErrorWebSocket(IHTTPSession session,String error){
        return new WebSocket(session) {
            @Override
            protected void onOpen(){
                String errorMessage = "{\"type\": 2,\"result\":{\"value\":\"Error\",\"message\":\""+escapeJsonString(error)+"\"}}";
                try{
                    this.send(errorMessage);
                    this.close(WebSocketFrame.CloseCode.NormalClosure,"error",false);
                } catch (IOException ignored) {}
            }
            @Override
            protected void onClose(WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {}
            @Override
            protected void onMessage(WebSocketFrame message) {}
            @Override
            protected void onPong(WebSocketFrame pong) {}
            @Override
            protected void onException(IOException exception) {}
        };
    }

    /**
     * 获取返回的错误
     * */
    public static Response getReturnError(Throwable error){
        return getReturnError("服务器内部发生未知错误!",error,true);
    }
    public static Response getReturnError(String error){
        return getReturnError(error,null,true);
    }
    /**
     * @param all 是否全部打印
     * */
    public static Response getReturnError(String message,Throwable error,boolean all){
        String r;
        if (error==null){
            r = "{\"value\":\"error\",\"message\":\""+escapeJsonString(message)+"\"}";
        }else if(all){
            r = "{\"value\":\"error\",\"message\":\""+escapeJsonString(message+"详情:"+printErrorToString(error))+"\"}";
        }else {
            r = "{\"value\":\"error\",\"message\":\""+escapeJsonString(message+"详情:"+error)+"\"}";
        }
        Response res = NanoHTTPD.newFixedLengthResponse(Response.Status.OK,"application/json",r);
        res.addHeader("NewBingGoGoError","true");
        return res;
    }

    /**
     * 转义成json字符串
     * */
    public static String escapeJsonString(String input) {
        return input
                .replace("\\","\\\\")
                .replace("\n","\\n")
                .replace("\r","\\r")
                .replace("\t","\\t")
                .replace("\"","\\\"");
    }

    public static String printErrorToString(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw, true));
        return  sw.getBuffer().toString();
    }

}
