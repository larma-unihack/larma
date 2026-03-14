import SceneBackground from "@/components/SceneBackground";

export default function DashboardPage() {
  return (
    <SceneBackground>
      {/* Dashboard content goes here — same sky/ground as opening page */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-[family-name:var(--font-irish-grover)] text-2xl text-black">
          Dashboard
        </p>
      </div>
    </SceneBackground>
  );
}
