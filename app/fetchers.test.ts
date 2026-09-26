import { expect, test } from "vitest";
import { retrieveArticleFromSlug } from "./fetchers";

test("test retrieving one article", async () => {
  const testSlug = "tiny-kitchens-big-advocacies";

  const expectedData = {
    title: "Tiny kitchens, big advocacies",
  };

  const articleData = await retrieveArticleFromSlug(testSlug);

  expect(articleData.title).toBe(expectedData.title);
});
