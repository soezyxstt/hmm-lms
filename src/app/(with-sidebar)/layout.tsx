import { Suspense } from 'react';
import { InstallPrompt } from '~/components/install-prompt';
import MainNavbar from '~/components/main/navbar';
import { NotificationPromptModal } from '~/components/notif-prompt-modal';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainNavbar>
      <Suspense fallback={<div className='w-full h-full grid place-items-center'>Fetching data...</div>}>
        <InstallPrompt />
        <NotificationPromptModal />
        {children}
      </Suspense>
    </MainNavbar>
  )
}