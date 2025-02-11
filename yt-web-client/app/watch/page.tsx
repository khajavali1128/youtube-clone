'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WatchContent() {
  const searchParams = useSearchParams();
  const videoSrc = searchParams.get('v');
  const videoPrefix = 'https://storage.googleapis.com/11kvp1128-ytc-processed-videos/';
  return (
    <div>
      <h1>Watch Page</h1>
      <video controls src={videoPrefix + videoSrc} />
    </div>
  );
}

export default function Watch() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
}
