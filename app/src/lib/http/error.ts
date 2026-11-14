/**
 * API がエラーを返したとき（4xx / 5xx）の例外。
 * 本文が RFC 9457 Problem Details なら detail と trace_id を持つ。
 */
export class HttpError extends Error {
  override readonly name = "HttpError";

  constructor(
    readonly status: number,
    /** 利用者向けの説明（例: 既に登録されています） */
    readonly detail?: string,
    /** サーバー側のログと突き合わせるための ID */
    readonly traceId?: string,
  ) {
    super(detail ?? `HTTP ${status}`);
  }
}

/** Problem Details の本文から detail と trace_id を取り出す（読めなければ undefined） */
export const parseProblem = async (
  response: Response,
): Promise<{ detail?: string; traceId?: string }> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) return {};
  try {
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) return {};
    const { detail, trace_id } = body as Record<string, unknown>;
    return {
      detail: typeof detail === "string" ? detail : undefined,
      traceId: typeof trace_id === "string" ? trace_id : undefined,
    };
  } catch {
    return {};
  }
};
