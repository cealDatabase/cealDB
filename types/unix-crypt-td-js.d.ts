declare module 'unix-crypt-td-js' {
  export function crypt(password: string, salt: string): string;
}
