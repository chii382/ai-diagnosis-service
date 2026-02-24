import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');

    // 起動時に ADMIN_EMAILS に従い DB の users.role を登録・更新
    try {
      const { syncAdminRoles } = await import('./lib/syncAdminRoles');
      await syncAdminRoles();
    } catch (err) {
      console.error('[instrumentation] syncAdminRoles failed:', err);
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
