package com.ourlittlestory.story;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ourlittlestory.IntegrationTestBase;
import org.junit.jupiter.api.Test;

class StoryIntegrationTest extends IntegrationTestBase {

    @Test
    void storyContentRequiresLogin() throws Exception {
        mvc.perform(get("/api/story")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/story/assets/dot.png")).andExpect(status().isUnauthorized());
    }

    @Test
    void servesStoryJsonAndAssetsToMembers() throws Exception {
        mvc.perform(get("/api/story").with(as(alice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.title").value("Fixture"));
        mvc.perform(get("/api/story/assets/dot.png").with(as(bob)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"));
    }

    @Test
    void assetNamesCannotEscapeTheAssetsFolder() throws Exception {
        mvc.perform(get("/api/story/assets/..%2Fstory.json").with(as(alice))).andExpect(status().is4xxClientError());
        mvc.perform(get("/api/story/assets/story.json").with(as(alice))).andExpect(status().isNotFound());
        mvc.perform(get("/api/story/assets/missing.png").with(as(alice))).andExpect(status().isNotFound());
    }
}
