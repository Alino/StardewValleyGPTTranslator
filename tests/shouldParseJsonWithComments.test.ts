import { loadFile } from "../jsonParser";
import { describe, it , expect } from "vitest";

describe("shouldParseJsonWithComments", () => {
    it("should parse json with comments", () => {
        try {
            const parsedJson = loadFile("./tests/1_invalidJson.json");
            expect(parsedJson).not.toBe(null);
        } catch (err) {
            console.error(err);
            expect(err).toBe(null);
        }
    });

    it("should parse invalid json without quotes on keys", () => {
        try {
            const parsedJson = loadFile("./tests/2_invalidJson.json");
            expect(parsedJson).not.toBe(null);
        } catch (err) {
            console.error(err);
            expect(err).toBe(null);
        }
    });
});


