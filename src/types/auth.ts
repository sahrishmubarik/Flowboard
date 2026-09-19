export type RegisterBody = {
  action: "register";
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  action: "login";
  email: string;
  password: string;
};

export type VerifyEmailBody = {
  action: "verify-email";
  token: string;
};

export type ForgotPasswordBody = {
  action: "forgot-password";
  email: string;
};

export type ResetPasswordBody = {
  action: "reset-password";
  token: string;
  password: string;
};
