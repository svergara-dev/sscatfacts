interface ErrorMessageProps {
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export function ErrorMessage({ message, details }: ErrorMessageProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {message}
      {details?.map((detail, i) => (
        <p key={i} className="text-sm mt-1">
          {detail.message}
        </p>
      ))}
    </div>
  );
}
