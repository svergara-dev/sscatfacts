import type { ReactNode } from 'react';

interface AuthTemplateProps {
  children: ReactNode;
}

export function AuthTemplate({ children }: AuthTemplateProps) {
  return <div className="min-h-screen flex items-center justify-center bg-gray-50">{children}</div>;
}
