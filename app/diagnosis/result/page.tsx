'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

function ResultRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      router.replace(`/diagnosis/${id}`);
    } else {
      router.replace('/diagnosis/history');
    }
  }, [id, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fffbf5',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function DiagnosisResultRedirectPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fffbf5',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <ResultRedirectContent />
    </Suspense>
  );
}
