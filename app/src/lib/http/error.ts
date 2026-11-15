import { ProblemDetail } from "@/lib/api/generated/jtd";
import { json } from "@/lib/json";
import type { JTD } from "@/lib/json/type";

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

/**
 * Problem Details の本文から detail と trace_id を取り出す。
 * 本文はバックエンドが生成した ProblemDetail のスキーマで解析し、形が合わなければ（プロキシの HTML など）何も返さない
 */
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
