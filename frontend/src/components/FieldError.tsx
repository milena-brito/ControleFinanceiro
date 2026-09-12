export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <span id={id} className="text-sm text-red-600" role="alert">
      {message}
    </span>
  );
}
