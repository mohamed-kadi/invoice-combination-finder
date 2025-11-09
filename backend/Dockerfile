FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

COPY backend/mvnw mvnw
COPY backend/pom.xml pom.xml
COPY backend/.mvn .mvn
RUN chmod +x mvnw

COPY backend/src src
RUN ./mvnw -q package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
