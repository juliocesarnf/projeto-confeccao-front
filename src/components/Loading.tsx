// ─── Component ────────────────────────────────────────────────────────────────

type LoadingProps = {
  fullScreen?: boolean;
};

export default function Loading({ fullScreen = false }: LoadingProps) {
  const spinner = (
    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}