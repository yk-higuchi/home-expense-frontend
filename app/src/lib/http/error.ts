import { ProblemDetail } from "@/lib/api/generated/jtd";
import { json } from "@/lib/json";
import type { JTD } from "@/lib/json/type";

export class HttpError extends Error {
  override readonly name = "HttpError";

  constructor(
    readonly status: number,
    readonly detail?: string,
    readonly traceId?: string,
  ) {
    super(detail ?? `HTTP ${status}`);
  }
}

export const parseProblem = async (
  response: Response,
): Promise<{ detail?: string; traceId?: string }> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) return {};
  try {
    const { detail, trace_id: traceId } = json.parse<JTD<typeof ProblemDetail>>(
      ProblemDetail,
      await response.text(),
    );
    return { detail, traceId };
  } catch {
    return {};
  }
};
