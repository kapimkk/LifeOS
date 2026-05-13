export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
} from '@/lib/validators/auth';

export {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
} from '@/lib/validators/user';
