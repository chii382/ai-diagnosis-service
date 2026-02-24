import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    role?: 'admin' | 'user';
  }

  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: 'admin' | 'user';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'admin' | 'user';
  }
}
