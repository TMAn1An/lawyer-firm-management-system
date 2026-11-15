"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="prose-page py-24 text-center">
      <h1 className="h1">Something went wrong · কিছু একটা ভুল হয়েছে</h1>
      <button onClick={reset} className="btn btn-primary mt-8">Try again · আবার চেষ্টা করুন</button>
    </main>
  );
}
