import pinoHttp from "pino-http";
import { logger } from "../logger";

export const httpLogger = pinoHttp({
  logger,
  customProps: (req, _res) => ({
    requestId: (req as any).requestId,
  }),
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        requestId: (req as any).requestId,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});