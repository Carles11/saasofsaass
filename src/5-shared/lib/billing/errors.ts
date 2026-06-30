/**
 * Typed error code consumers can branch on (translation-independent).
 *
 * NOTE: When thrown from a server action, only `.message` and `.name`
 * survive serialization — the `code` property is server-side only.
 * Client code should check `err.message` for the sentinel prefix.
 */
export type AddExtraSiteErrorCode =
  | "NOT_PRO_PLAN"
  | "NO_ACTIVE_SUBSCRIPTION"
  | "SOFT_CAP_REACHED"
  | "UNKNOWN_CADENCE";

export class AddExtraSiteError extends Error {
  constructor(
    public code: AddExtraSiteErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AddExtraSiteError";
  }
}
