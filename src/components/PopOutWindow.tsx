"use client";

export default function PopOutWindow({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-20 bg-transparent"
        onClick={onClose}
      />

      <aside
        className="fixed right-0 top-0 bottom-0 z-30 flex w-80 flex-col bg-white shadow-xl"
        aria-modal
        aria-label="Menu"
      >
        <div className="flex flex-1 flex-col p-4">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded border-0 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            onClick={onClose}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="mt-10 flex-1">{children}</div>
        </div>
      </aside>
    </>
  );
}
