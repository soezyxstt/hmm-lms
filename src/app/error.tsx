'use client';

import type { Metadata } from 'next';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-col gap-4 min-h-dvh w-full justify-center items-center bg-background text-red-600'>
      <div className='text-center flex flex-col gap-2'>
        <p className='text-2xl md:text-4xl font-medium'>Error</p>
        <p
          className=''>{error.message.includes("PWAError") ?
            error.message.replace("(PWAError)", "") : 'Oops... an Error occurred'}</p>
      </div>
      <button
        onClick={reset}
        className='p-2 text-blue-600 rounded-sm '
      >
        Try Again
      </button>
    </div>
  );
}

export const metadata: Metadata = {
  title: '500 - Error',
};
