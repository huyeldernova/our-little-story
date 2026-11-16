package com.ourlittlestory;

import com.ourlittlestory.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class OurLittleStoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(OurLittleStoryApplication.class, args);
    }
}
