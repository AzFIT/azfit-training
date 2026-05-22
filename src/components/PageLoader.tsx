/**
 * PageLoader — Loading fallback for React.lazy() code-split pages.
 * Shows a centered AzFIT-branded spinner with a subtle pulse animation.
 */

export default function PageLoader() {
  return (
    <div className="min-h-[50dvh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00AEEF] to-[#33BFF2] flex items-center justify-center shadow-lg shadow-[#00AEEF]/25 animate-pulse">
        <span className="text-white text-xl font-bold">A</span>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
    </div>
  );
}
