import { AuthTemplate } from '@/templates/AuthTemplate/AuthTemplate';
import { LoginForm } from '@/organisms/LoginForm/LoginForm';

export function LoginPage() {
  return (
    <AuthTemplate>
      <LoginForm />
    </AuthTemplate>
  );
}
