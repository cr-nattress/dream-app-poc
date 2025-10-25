export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 p-6 transition-shadow duration-base ${className}`}>
      {children}
    </div>
  );
}
