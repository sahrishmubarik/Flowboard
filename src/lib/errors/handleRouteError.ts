import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";

const DEFAULT_MESSAGE = "Internal server error. Please try again.";

// Postgres "invalid_text_representation", e.g. "abc" where a uuid is
// expected. Drizzle wraps the driver error, so the code can sit on `cause`.
function isInvalidValueError(error: unknown) {
  let current: unknown = error;

  for (let depth = 0; depth < 3 && current; depth++) {
    if (
      typeof current === "object" &&
      "code" in current &&
      current.code === "22P02"
    ) {
      return true;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}

// One answer for every API route's catch block:
// - AppError: its own message and status (401, 403, 404, 409, 402, ...)
// - a request body that is not valid JSON: 400
// - an id or value in the wrong format: 400 instead of a database 500
// - anything else: logged with `label`, then a generic 500 with no details
export function handleRouteError(
  error: unknown,
  label: string,
  fallbackMessage = DEFAULT_MESSAGE,
) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { message: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  if (isInvalidValueError(error)) {
    return NextResponse.json(
      { message: "Invalid ID or value in the request." },
      { status: 400 },
    );
  }

  console.error(label, error);

  return NextResponse.json({ message: fallbackMessage }, { status: 500 });
}
