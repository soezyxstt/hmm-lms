import { Suspense } from 'react';
import MainNavbar from '~/components/main/navbar';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainNavbar>
      <Suspense fallback={<div className='w-full h-full grid place-items-center'>Fetching data...</div>}>
        {children}
      </Suspense>
    </MainNavbar>
  )
}