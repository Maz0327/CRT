import express from "express";
import request from "supertest";
import { problem } from "../server/utils/problem";

const app = express();
app.get("/boom", (_req, res) => {
  return problem(res, 400, "Bad input", "missing field x", "BAD_REQUEST", { field: "x" });
});

describe("problem helper", () => {
  it("returns standardized problem json", async () => {
    const res = await request(app).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: "Bad input",
      code: "BAD_REQUEST",
      details: "missing field x",
      field: "x",
    });
  });
});