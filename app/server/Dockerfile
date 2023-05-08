FROM openjdk

WORKDIR /app/server

#add self signed certificate authority to java trust store, file should be in folder
COPY ca.crt $JAVA_HOME/lib/security

RUN \
    cd $JAVA_HOME/lib/security \
    && keytool -keystore cacerts -storepass changeit -noprompt -trustcacerts -importcert -alias localhost -file ca.crt
#--

COPY . ./

EXPOSE 8080

CMD ./mvnw spring-boot:run