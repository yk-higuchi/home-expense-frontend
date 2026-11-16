import { json } from "@/network/schema";

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
    const { detail, trace_id: traceId } = json.validate(
      "ProblemDetail",
      await response.json(),
    );
    return { detail, traceId };
  } catch {
    return {};
  }
};
