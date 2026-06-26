import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';
export declare const httpRequestDurationMicroseconds: client.Histogram<"method" | "route" | "status_code">;
export declare const httpRequestsTotal: client.Counter<"method" | "route" | "status_code">;
export declare const activeBattlesGauge: client.Gauge<string>;
export declare const totalSubmissionsCounter: client.Counter<string>;
export declare const judge0LatencyHistogram: client.Histogram<string>;
export declare const metricsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const getMetrics: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=prometheus.d.ts.map