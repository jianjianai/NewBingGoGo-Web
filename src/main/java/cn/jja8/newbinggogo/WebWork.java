package cn.jja8.newbinggogo;

import fi.iki.elonen.NanoHTTPD;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

public class WebWork {
    public static NanoHTTPD.Response getFile(String path) {
        if(path.startsWith("/")){
            path = path.substring(1);
        }
        URL url = WebWork.class.getClassLoader().getResource(path);
        if(url==null){
            return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND,"text/html; charset=utf-8","页面不存在！");
        }
        //文件属性
        String mimeType = "text/html; charset=utf-8";
        if(path.endsWith(".html")){
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
        try{
            InputStream inputStream = url.openStream();
            NanoHTTPD.Response response = NanoHTTPD.newFixedLengthResponse(
                    NanoHTTPD.Response.Status.OK,
                    mimeType,
                    inputStream,
                    -1
            );
            response.addHeader("cache-control","max-age=14400");
            return response;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
