export interface ErrorTextProps {
  id?: string;
  message?: string;
}

export function ErrorText({ id, message }: ErrorTextProps) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="text-small text-danger-600">
      {message}
    </p>
  );
}
