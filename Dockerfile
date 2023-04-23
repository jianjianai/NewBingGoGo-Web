FROM gradle:8.0.2-jdk17
ADD ./ ./
RUN gradle shadow
EXPOSE 80
ENV PORT=80
CMD sh -c  "java -jar ./build/libs/NewBingGoGo-web-1.0-SNAPSHOT-all.jar \$PORT"