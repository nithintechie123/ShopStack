# Stage 1: Build the Maven application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached step)
RUN mvn dependency:go-offline -B
COPY src ./src
# Build package skipping test execution
RUN mvn package -DskipTests -B

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/shopstack-0.0.1-SNAPSHOT.jar /app/shopstack.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/shopstack.jar"]
