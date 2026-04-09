import type { HTMLAttributes } from "react";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// HTMLAttributes 상속 — PDF 가이드 원칙
// className, style 등 기본 HTML 속성 외부에서 사용 가능
interface AdminPageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export const AdminPageHeader = ({ title, ...props }: AdminPageHeaderProps) => {
  return (
    <div className="mb-6 flex items-center gap-3" {...props}>
      {/* 블루 포인트 라인 — 팀 시안 컬러 통일 */}
      <div className="w-1 h-6 bg-blue-700" />
      <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
        {title}
      </h1>
    </div>
  );
};