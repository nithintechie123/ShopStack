package com.shopstack.shopstack;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ShopstackApplicationTests {

	static {
		ShopstackApplication.loadEnv();
	}

	@Test
	void contextLoads() {
	}

}
