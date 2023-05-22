package cn.jja8.newbinggogo;

import fi.iki.elonen.NanoHTTPD;

import java.io.*;
import java.net.URL;

public class WebWork {
    static File serverConfig;
    static void init(){
        File serverConfig = new File("ServerConfig.json");
        try {
            URL url =  WebWork.class.getClassLoader().getResource("web/resource/config.json");
            if(url!=null && serverConfig.createNewFile()){
                try (InputStream in = url.openStream()){
                    try(OutputStream out = new FileOutputStream(serverConfig)){
                        byte[] buff = new byte[1024];
                        int len;
                        while ((len = in.read(buff))>=0){
                            out.write(buff,0,len);
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        if (serverConfig.isFile()&&serverConfig.canRead()) {
            WebWork.serverConfig = serverConfig;
        }
    }
    public static NanoHTTPD.Response getFile(String path) {
        if(path.startsWith("/")){
            path = path.substring(1);
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


        InputStream inputStream;
        if(serverConfig!=null && path.equals("web/resource/config.json")){
            try {
                NanoHTTPD.Response response = NanoHTTPD.newFixedLengthResponse(
                        NanoHTTPD.Response.Status.OK,
                        mimeType,
                        new FileInputStream(serverConfig),
                        -1
                );
                response.addHeader("cache-control","max-age=14400");
                return response;
            } catch (FileNotFoundException e) {
                throw new RuntimeException(e);
            }
        }

        URL url = WebWork.class.getClassLoader().getResource(path);
        if(url==null){
            return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND,"text/html; charset=utf-8","页面不存在！");
        }
        try{
            inputStream = url.openStream();
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
