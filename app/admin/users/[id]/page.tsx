'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import Image from 'next/image';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

const AGE_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '20未満', label: '20代未満' },
  { value: '20代', label: '20代' },
  { value: '30代', label: '30代' },
  { value: '40代', label: '40代' },
  { value: '50代', label: '50代' },
  { value: '60代以上', label: '60代以上' },
];

const JOB_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '営業', label: '営業' },
  { value: 'エンジニア', label: 'エンジニア' },
  { value: 'マーケティング', label: 'マーケティング' },
  { value: '人事', label: '人事' },
  { value: '経理・財務', label: '経理・財務' },
  { value: 'デザイナー', label: 'デザイナー' },
  { value: 'マネージャー', label: 'マネージャー' },
  { value: '経営者・役員', label: '経営者・役員' },
  { value: 'その他', label: 'その他' },
];

const INDUSTRY_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: 'IT・テクノロジー', label: 'IT・テクノロジー' },
  { value: '金融', label: '金融' },
  { value: 'コンサルティング', label: 'コンサルティング' },
  { value: '製造', label: '製造' },
  { value: '小売・EC', label: '小売・EC' },
  { value: '医療・介護', label: '医療・介護' },
  { value: '教育', label: '教育' },
  { value: 'マスコミ・広告', label: 'マスコミ・広告' },
  { value: '官公庁', label: '官公庁' },
  { value: 'その他', label: 'その他' },
];

interface ProfileData {
  name: string;
  email: string;
  image?: string | null;
  gender?: string;
  ageGroup?: string;
  jobType?: string;
  industry?: string;
  other?: string;
  role?: string;
  createdAt?: string;
}

export default function AdminUserProfileViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/users/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('取得に失敗しました');
        return r.json();
      })
      .then((data) => {
        setProfileData({
          name: data.name ?? '',
          email: data.email ?? '',
          image: data.image ?? null,
          gender: data.gender ?? '',
          ageGroup: data.ageGroup ?? '',
          jobType: data.jobType ?? '',
          industry: data.industry ?? '',
          other: data.other ?? '',
          role: data.role ?? 'user',
          createdAt: data.createdAt,
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'エラーが発生しました'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  if (error || !profileData) {
    return (
      <Box>
        <Typography color="error" sx={{ mb: 2 }}>
          {error || 'プロフィールを取得できませんでした'}
        </Typography>
        <Link href="/admin/users" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />}>
            ユーザー管理へ戻る
          </Button>
        </Link>
      </Box>
    );
  }

  const ageLabel = AGE_OPTIONS.find((o) => o.value === profileData.ageGroup)?.label ?? profileData.ageGroup ?? '-';
  const jobLabel = JOB_OPTIONS.find((o) => o.value === profileData.jobType)?.label ?? profileData.jobType ?? '-';
  const industryLabel =
    INDUSTRY_OPTIONS.find((o) => o.value === profileData.industry)?.label ?? profileData.industry ?? '-';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
        pt: 3,
        pb: 6,
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '985 / 152',
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: '#fff7ed',
          }}
        >
          <Image
            src="/images/profile-header-banner.png"
            alt="プロフィール閲覧"
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            style={{ objectFit: 'contain', objectPosition: 'center center' }}
            priority
            unoptimized
          />
        </Box>

        <Box
          sx={{
            mt: 2,
            background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
            pt: 2,
            pb: 6,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <Card
            sx={{
              p: 4,
              boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)',
              borderRadius: 3,
              border: '1px solid rgba(139, 90, 43, 0.08)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="#3d2c1e">
                  プロフィール（閲覧のみ）
                </Typography>
                <Link href="/admin/users" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderColor: '#f97316',
                      color: '#f97316',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#ea580c',
                        backgroundColor: 'rgba(249, 115, 22, 0.08)',
                      },
                    }}
                  >
                    ユーザー管理へ戻る
                  </Button>
                </Link>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar
                    src={profileData.image ?? undefined}
                    alt={profileData.name || 'User'}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: '#f97316',
                      flexShrink: 0,
                    }}
                  >
                    {!profileData.image && <PersonIcon sx={{ fontSize: 60 }} />}
                  </Avatar>
                  {profileData.role && (
                    <Chip
                      label={profileData.role}
                      size="small"
                      color={profileData.role === 'admin' ? 'primary' : 'default'}
                    />
                  )}
                  {profileData.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      登録日: {new Date(profileData.createdAt).toLocaleDateString('ja-JP')}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    名前
                  </Typography>
                  <Typography variant="body1" sx={{ py: 0.5 }}>
                    {profileData.name || '-'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    メールアドレス
                  </Typography>
                  <Typography variant="body1" sx={{ py: 0.5 }}>
                    {profileData.email || '-'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  性別（任意）
                </Typography>
                <Typography variant="body1" sx={{ py: 0.5 }}>
                  {profileData.gender || '未選択'}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  年齢（年代・任意）
                </Typography>
                <Typography variant="body1" sx={{ py: 0.5 }}>
                  {ageLabel}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  今の職種（任意）
                </Typography>
                <Typography variant="body1" sx={{ py: 0.5 }}>
                  {jobLabel}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  今の業種（任意）
                </Typography>
                <Typography variant="body1" sx={{ py: 0.5 }}>
                  {industryLabel}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  その他（任意）
                </Typography>
                <Typography variant="body1" sx={{ py: 0.5, whiteSpace: 'pre-wrap' }}>
                  {profileData.other || '（未入力）'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
