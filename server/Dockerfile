FROM eclipse-temurin:21-jdk-noble
COPY . .
RUN chmod +x ./mvnw
RUN ./mvnw clean install -DskipTests
ENTRYPOINT ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]