import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body as { name?: string; email?: string; message?: string };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'お名前、メールアドレス、お問い合わせ内容は必須です。' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください。' },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('[contact] SMTP not configured');
      return NextResponse.json(
        { error: 'メール送信の設定がありません。しばらくしてから再度お試しください。' },
        { status: 500 }
      );
    }

    const fromName = 'AI CAREER COMPASS';
    const subject = '【AI CAREER COMPASS】お問い合わせありがとうございます';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #3d2c1e; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 1.25rem;">AI CAREER COMPASS</h1>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;">${escapeHtml(name)} 様</p>
    <p style="margin: 0 0 16px;">この度はお問い合わせいただき、ありがとうございます。</p>
    <p style="margin: 0 0 16px;">以下の内容でお受けいたしました。確認のうえ、折り返しご連絡いたします。</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="margin: 0 0 8px; font-weight: 600; color: #5c4033;">【お問い合わせ内容】</p>
    <div style="background: #fffbf5; padding: 16px; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(message)}</div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="margin: 0; font-size: 0.875rem; color: #78716c;">※このメールは自動送信です。このメールに直接返信いただいてもお答えできません。</p>
  </div>
</body>
</html>
`;

    await transporter.sendMail({
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to: email.trim(),
      subject,
      html,
      text: `${name} 様\n\nこの度はお問い合わせいただき、ありがとうございます。\n以下の内容でお受けいたしました。確認のうえ、折り返しご連絡いたします。\n\n【お問い合わせ内容】\n${message}\n\n※このメールは自動送信です。`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact]', error);
    return NextResponse.json(
      { error: 'メール送信に失敗しました。しばらくしてから再度お試しください。' },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
