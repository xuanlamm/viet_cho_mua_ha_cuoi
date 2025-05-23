import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

export function DecorativeCircle({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full opacity-10 ${className}`}
      style={{
        background: "radial-gradient(circle, rgba(255,138,138,0.5) 0%, rgba(138,198,255,0.3) 100%)",
      }}
    ></div>
  )
}

export function DecorativeDots({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        backgroundImage: "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
        backgroundSize: "200px 200px",
        opacity: 0.4,
      }}
    ></div>
  )
}

export function WavyLine({ className = "" }: { className?: string }) {
  return (
    <svg className={`${className}`} viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        fill="rgba(255,138,138,0.1)"
      ></path>
    </svg>
  )
}

export function FloatingHearts() {
  const [hearts, setHearts] = useState<
    { top: string; left: string; fontSize: string; animation: string; delay: string }[]
  >([]);

  useEffect(() => {
    const generatedHearts = [...Array(50)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 20 + 10}px`,
      animation: `float ${Math.random() * 6 + 2}s ease-in-out infinite`,
      delay: `${Math.random() * 3}s`,
    }));
    setHearts(generatedHearts);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((heart, i) => (
        <div
          key={i}
          className="absolute text-pink-200 opacity-30"
          style={{
            top: heart.top,
            left: heart.left,
            fontSize: heart.fontSize,
            animation: heart.animation,
            animationDelay: heart.delay,
          }}
        >
          <FaHeart className="text-pink-200" />
        </div>
      ))}
    </div>
  );
}
