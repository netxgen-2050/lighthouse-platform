const FORMATO = /^LH27-[A-Z0-9]{4}-[A-Z0-9]{2}$/;

export function normalizarCodigo(entrada: string): string {
  return entrada.trim().toUpperCase();
}

export function esCodigoValido(entrada: string): boolean {
  return FORMATO.test(normalizarCodigo(entrada));
}
