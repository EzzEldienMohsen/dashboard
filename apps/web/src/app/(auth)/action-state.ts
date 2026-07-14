export interface AuthActionState {
  status: "idle" | "error";
  fieldErrors?: Partial<Record<string, string>>;
  formError?: string;
}

export const initialAuthActionState: AuthActionState = { status: "idle" };
