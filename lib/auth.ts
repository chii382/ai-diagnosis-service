import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// 環境変数の検証
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not set');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is not set');
}
if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not set');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.role = (token.role as 'admin' | 'user') ?? 'user';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      const email = (user?.email ?? token.email) as string | undefined;
      if (email && (user || !token.role)) {
        const { getUserRoleByEmail } = await import('@/lib/getUserRole');
        token.role = await getUserRoleByEmail(email);
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
});
