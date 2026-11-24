export function getFirebaseAuthErrorMessage(error: unknown, fallback = 'Não foi possível concluir a autenticação.'): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
    case 'auth/invalid-email':
      return 'O endereço de e-mail informado não é válido.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Utilize pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar novamente.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta vinculada a este e-mail por outro método (ex.: Google). Entre usando o método original.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'A janela de login foi fechada antes da conclusão.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return fallback;
  }
}
