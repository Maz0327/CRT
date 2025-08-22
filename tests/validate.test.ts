import express from "express";
import request from "supertest";
import bodyParser from "body-parser";
import { z } from "zod";
import { validateBody, validateQuery } from "../server/middleware/validate";

const app = express();
app.use(bodyParser.json());

const bodySchema = z.object({ name: z.string().min(1) });
const querySchema = z.object({ limit: z.string().regex(/^\d+$/).optional() });

app.post("/validate-body", validateBody(bodySchema), (req: any, res) => {
  res.json({ ok: true, data: req.validated.body });
});

app.get("/validate-query", validateQuery(querySchema), (req: any, res) => {
  res.json({ ok: true, data: req.validated.query });
});

describe("validate middleware", () => {
  it("accepts valid body", async () => {
    const res = await request(app).post("/validate-body").send({ name: "maz" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe("maz");
  });

  it("rejects invalid body", async () => {
    const res = await request(app).post("/validate-body").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid body");
  });

  it("accepts valid query", async () => {
    const res = await request(app).get("/validate-query?limit=10");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.limit).toBe("10");
  });

  it("rejects invalid query", async () => {
    const res = await request(app).get("/validate-query?limit=ten");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid query");
  });
});