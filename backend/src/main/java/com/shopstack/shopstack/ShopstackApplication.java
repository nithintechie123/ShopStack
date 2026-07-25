package com.shopstack.shopstack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class ShopstackApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(ShopstackApplication.class, args);
	}

	public static void loadEnv() {
		// Check for .env in current, parent, or backend sub-directory
		Path envPath = Paths.get(".env");
		if (!Files.exists(envPath)) {
			envPath = Paths.get("..", ".env");
		}
		if (!Files.exists(envPath)) {
			envPath = Paths.get("backend", ".env");
		}

		if (Files.exists(envPath)) {
			try {
				List<String> lines = Files.readAllLines(envPath);
				for (String line : lines) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIdx = line.indexOf('=');
					if (eqIdx > 0) {
						String key = line.substring(0, eqIdx).trim();
						String value = line.substring(eqIdx + 1).trim();
						// Strip potential surrounding quotes
						if ((value.startsWith("\"") && value.endsWith("\"")) ||
								(value.startsWith("'") && value.endsWith("'"))) {
							value = value.substring(1, value.length() - 1);
						}
						// Register as system property if not already defined
						if (System.getProperty(key) == null && System.getenv(key) == null) {
							System.setProperty(key, value);
						}
					}
				}
				System.out.println("Successfully loaded environment variables from: " + envPath.toAbsolutePath());
			} catch (IOException e) {
				System.err.println("Failed to read .env file: " + e.getMessage());
			}
		} else {
			System.out.println(".env file not found. Proceeding with existing environment/properties.");
		}
	}

}

