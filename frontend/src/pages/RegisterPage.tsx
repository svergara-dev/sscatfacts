import { AuthTemplate } from '@/templates/AuthTemplate/AuthTemplate';
import { RegisterForm } from '@/organisms/RegisterForm/RegisterForm';

export function RegisterPage() {
  return (
    <AuthTemplate>
      <RegisterForm />
    </AuthTemplate>
  );
}
