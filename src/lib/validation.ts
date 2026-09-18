/**
 * Validasi username dan password
 * Username: minimal 3 karakter, hanya huruf (a-z, A-Z)
 * Password: min 6 karakter, kombinasi huruf dan angka
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];

  if (!username) {
    errors.push('Username tidak boleh kosong');
    return { isValid: false, errors };
  }

  if (username.length < 3) {
    errors.push('Username minimal 3 karakter');
  }

  // Check hanya huruf (tidak boleh angka atau karakter khusus)
  const hasOnlyLetters = /^[a-zA-Z]+$/.test(username);

  if (!hasOnlyLetters) {
    errors.push('Username hanya boleh mengandung huruf (a-z, A-Z)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password tidak boleh kosong');
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  // Check kombinasi huruf dan angka
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter) {
    errors.push('Password harus mengandung minimal 1 huruf');
  }

  if (!hasNumber) {
    errors.push('Password harus mengandung minimal 1 angka');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
