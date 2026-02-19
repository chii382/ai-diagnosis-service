import Header from '@/app/components/Header';

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
