import { notFound, unstable_rethrow } from "next/navigation";
import { HttpError } from "@/lib/http/error";

export type Loaded<T> = { ok: true; value: T } | { ok: false };

export const load = async <T>(
  task: () => Promise<T>,
  options: { notFoundOn404?: boolean } = {},
): Promise<Loaded<T>> => {
  try {
    return { ok: true, value: await task() };
  } catch (error) {
    unstable_rethrow(error);
    if (
      options.notFoundOn404 &&
      error instanceof HttpError &&
      error.status === 404
    )
      notFound();
    console.error(error);
    return { ok: false };
  }
};
