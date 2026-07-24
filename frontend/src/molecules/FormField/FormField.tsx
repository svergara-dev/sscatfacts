import { forwardRef } from 'react';
import { Input } from '@/atoms/Input/Input';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    return <Input ref={ref} id={id} label={label} error={error} {...props} />;
  },
);

FormField.displayName = 'FormField';
