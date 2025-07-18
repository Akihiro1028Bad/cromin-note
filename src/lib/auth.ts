import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { prisma } from './prisma';
import { withPrisma } from './prismaRetry';
import { logger } from './logger';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
// 動的にAPP_URLを取得する関数（リクエストから取得）
const getAppUrl = (request?: Request): string => {
  // リクエストが提供されている場合は、そこからドメインを取得
  if (request) {
    try {
      const url = new URL(request.url);
      const protocol = url.protocol;
      const host = url.host;
      const appUrl = `${protocol}//${host}`;
      console.log('Using request-based URL:', appUrl);
      return appUrl;
    } catch (error) {
      console.error('Failed to parse request URL:', error);
    }
  }
  
  // フォールバック: 環境変数から取得を試行（優先順位順）
  if (process.env.NEXT_PUBLIC_APP_URL) {
    console.log('Using NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Vercel環境では実際のドメインを使用
  if (process.env.VERCEL) {
    console.log('Vercel environment detected, using production URL');
    return 'https://cromin-note.vercel.app';
  }
  
  if (process.env.VERCEL_URL) {
    console.log('Using VERCEL_URL:', process.env.VERCEL_URL);
    // Vercel URLは通常プレビュー用なので、本番環境では使用しない
    if (process.env.NODE_ENV === 'production') {
      return 'https://cromin-note.vercel.app';
    }
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    console.log('Using NEXT_PUBLIC_VERCEL_URL:', process.env.NEXT_PUBLIC_VERCEL_URL);
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // 本番環境の場合は固定URL
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment, using fixed URL');
    return 'https://cromin-note.vercel.app';
  }
  
  // 開発環境の場合はlocalhost
  console.log('Development environment, using localhost');
  return 'http://localhost:3000';
};

// パスワードハッシュ化
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// パスワード検証
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// JWTトークン生成
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// JWTトークン検証
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

// 検証トークン生成
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// メール送信設定
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || 'noreply@cromin-note.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// メール送信設定の確認
console.log('Email configuration check:', {
  GMAIL_USER: process.env.GMAIL_USER ? 'set' : 'not set',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'set' : 'not set',
  NODE_ENV: process.env.NODE_ENV
});

// 確認メール送信
export const sendVerificationEmail = async (email: string, token: string, request?: Request): Promise<void> => {
  // メール設定が不完全な場合はスキップ
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email configuration incomplete, skipping email send');
    console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'set' : 'not set');
    console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'set' : 'not set');
    throw new Error('メール送信設定が不完全です。');
  }

  const appUrl = getAppUrl(request);
  const verificationUrl = `${appUrl}/api/auth/verify?token=${token}`;
  console.log('=== Email Verification URL Generation ===');
  console.log('App URL:', appUrl);
  console.log('Generated verification URL:', verificationUrl);
  console.log('Token length:', token.length);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel environment:', process.env.VERCEL ? 'true' : 'false');
  console.log('Available env vars:', {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL
  });
  console.log('==========================================');
  
  const mailOptions = {
    from: 'Cromin Note <ttmakhr1028@gmail.com>',
    to: email,
    subject: 'Cromin Note - メールアドレスの確認',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Cromin Note</h2>
        <p>メールアドレスの確認をお願いします。</p>
        <p>以下のリンクをクリックして、アカウントの登録を完了してください：</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
           メールアドレスを確認
        </a>
        <p>このリンクは24時間有効です。</p>
        <p>このメールに心当たりがない場合は、無視してください。</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send verification email to:', email);
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      verificationUrl: verificationUrl
    });
    
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Email sending failed:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      response: (error as any)?.response
    });
    throw error;
  }
};

// ユーザー登録
export const registerUser = async (email: string, nickname: string, password: string, request?: Request): Promise<{ success: boolean; message: string }> => {
  return withPrisma(async (prisma) => {
    try {
      // 既存ユーザーチェック
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return { success: false, message: 'このメールアドレスは既に登録されています。' };
      }

      // パスワードハッシュ化
      const passwordHash = await hashPassword(password);
      
      // 検証トークン生成
      const verificationToken = generateVerificationToken();

      // メール設定が不完全な場合は自動確認
      const emailVerified = !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD;

      // ユーザー作成
      await prisma.user.create({
        data: {
          email,
          nickname,
          passwordHash,
          verificationToken: emailVerified ? null : verificationToken,
          emailVerified
        }
      });

      // 確認メール送信（設定がある場合のみ）
      if (!emailVerified) {
        try {
          await sendVerificationEmail(email, verificationToken, request);
          return { success: true, message: '確認メールを送信しました。メールをご確認ください。' };
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // メール送信に失敗した場合はユーザーを削除してエラーを返す
          await prisma.user.delete({
            where: { id: (await prisma.user.findUnique({ where: { email } }))?.id }
          });
          return { success: false, message: 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。' };
        }
      } else {
        return { success: true, message: 'ユーザー登録が完了しました。ログインしてください。' };
      }
    } catch (error) {
      console.error('Registration error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code
      });
      return { success: false, message: `登録に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });
};

// ユーザーログイン
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: any; token?: string; message: string }> => {
  return withPrisma(async (prisma) => {
    const startTime = Date.now();
    
    try {
      // ユーザー取得
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        logger.logError({
          error: new Error('User not found'),
          context: {
            endpoint: 'loginUser',
            method: 'findUnique'
          },
          additionalInfo: {
            email,
            userFound: false
          }
        });
        return { success: false, message: 'メールアドレスまたはパスワードが正しくありません。' };
      }

      // メール確認チェック
      if (!user.emailVerified) {
        logger.logError({
          error: new Error('Email not verified'),
          context: {
            endpoint: 'loginUser',
            method: 'emailVerification'
          },
          additionalInfo: {
            email,
            userId: user.id,
            emailVerified: user.emailVerified
          }
        });
        return { success: false, message: 'メールアドレスの確認が完了していません。確認メールをご確認ください。' };
      }

      // パスワード検証
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        logger.logError({
          error: new Error('Invalid password'),
          context: {
            endpoint: 'loginUser',
            method: 'passwordVerification'
          },
          additionalInfo: {
            email,
            userId: user.id,
            passwordValid: false
          }
        });
        return { success: false, message: 'メールアドレスまたはパスワードが正しくありません。' };
      }

      // JWTトークン生成
      const token = generateToken(user.id);
      
      const duration = Date.now() - startTime;
      logger.logDatabaseOperation('loginUser', duration, {
        endpoint: 'loginUser',
        success: true,
        userId: user.id
      });

      return { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token,
        message: 'ログインしました。'
      };
    } catch (error) {
      console.error('Login error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        name: error instanceof Error ? error.name : undefined
      });
      
      // Prismaエラーの詳細な処理
      if (error instanceof Error) {
        if (error.message.includes('prepared statement') || error.message.includes('42P05')) {
          console.error('Prisma connection pool error detected');
          return { success: false, message: 'データベース接続エラーが発生しました。しばらく時間をおいて再度お試しください。' };
        }
      }
      
      return { success: false, message: `ログインに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });
};

// メール確認
export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
  return withPrisma(async (prisma) => {
    try {
      console.log('=== Email Verification Process Start ===');
      console.log('verifyEmail called with token:', token ? 'exists' : 'not found');
      console.log('Token length:', token ? token.length : 0);
      console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
      });
      
      // トークンでユーザー検索
      console.log('Searching for user with verification token...');
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          emailVerified: false
        }
      });
      console.log('User found:', user ? 'yes' : 'no');
      if (user) {
        console.log('User details:', {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          hasVerificationToken: !!user.verificationToken
        });
      }

      if (!user) {
        console.log('No user found with this verification token');
        // デバッグ用：トークンが存在するユーザーを検索
        const anyUserWithToken = await prisma.user.findFirst({
          where: { verificationToken: token }
        });
        console.log('Any user with this token:', anyUserWithToken ? 'yes' : 'no');
        if (anyUserWithToken) {
          console.log('User with token but already verified:', {
            id: anyUserWithToken.id,
            email: anyUserWithToken.email,
            emailVerified: anyUserWithToken.emailVerified
          });
        }
        return { success: false, message: '無効な確認リンクです。' };
      }

      // メール確認完了
      console.log('Updating user email verification status...');
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          updatedAt: new Date()
        }
      });
      console.log('User email verification updated successfully');
      console.log('Updated user details:', {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        hasVerificationToken: !!updatedUser.verificationToken
      });

      console.log('=== Email Verification Process Complete ===');
      return { success: true, message: 'メールアドレスの確認が完了しました。' };
    } catch (error) {
      console.error('=== Email Verification Error ===');
      console.error('Email verification error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        name: error instanceof Error ? error.name : undefined,
        constructor: error?.constructor?.name
      });
      console.error('===============================');
      return { success: false, message: `メール確認に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });
}; 

// 認証メール再送信
export const resendVerificationEmail = async (email: string, request?: Request): Promise<{ success: boolean; message: string }> => {
  return withPrisma(async (prisma) => {
    try {
      // ユーザー検索
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return { success: false, message: 'このメールアドレスで登録されたユーザーが見つかりません。' };
      }

      // 既にメール確認済みの場合
      if (user.emailVerified) {
        return { success: false, message: 'このメールアドレスは既に確認済みです。' };
      }

      // メール設定が不完全な場合
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return { success: false, message: 'メール送信機能が現在利用できません。管理者にお問い合わせください。' };
      }

      // 新しい検証トークン生成
      const newVerificationToken = generateVerificationToken();

      // ユーザーの検証トークンを更新
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: newVerificationToken,
          updatedAt: new Date()
        }
      });

      // 確認メール再送信
      try {
        await sendVerificationEmail(email, newVerificationToken, request);
        return { success: true, message: '確認メールを再送信しました。メールをご確認ください。' };
      } catch (emailError) {
        console.error('Email resend error:', emailError);
        return { success: false, message: 'メールの再送信に失敗しました。しばらく時間をおいて再度お試しください。' };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'メール再送信に失敗しました。' };
    }
  });
}; 