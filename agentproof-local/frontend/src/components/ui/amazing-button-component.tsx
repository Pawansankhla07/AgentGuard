import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

const TARGET_TEXT = "SECURED DATA";
const CYCLES_PER_LETTER = 3;
const SHUFFLE_TIME = 30;
const CHARS = "!@#$%^&*():{};|,.<>/?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const EncryptButton = ({
  targetText = TARGET_TEXT,
  onClick,
  className = "",
  monochrome = true,
}: {
  targetText?: string;
  onClick?: () => void;
  className?: string;
  monochrome?: boolean;
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [text, setText] = useState(targetText);
  const [isHovered, setIsHovered] = useState(false);

  const scramble = () => {
    let pos = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const scrambled = targetText
        .split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }
          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          return CHARS[randomCharIndex];
        })
        .join("");
      setText(scrambled);
      pos++;
      if (pos >= targetText.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setText(targetText);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scramble();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    stopScramble();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect background */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-xl opacity-75"
        animate={{
          background: isHovered
            ? monochrome
              ? "linear-gradient(45deg, #ffffff, #94a3b8, #cbd5e1, #ffffff)"
              : "linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981, #8b5cf6)"
            : "linear-gradient(45deg, #18181b, #27272a, #3f3f46, #18181b)",
        }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundSize: "300% 300%",
        }}
      />

      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative group overflow-hidden rounded-2xl ${
          monochrome
            ? "bg-[#0B0D13]/95 border border-white/20 hover:border-white/50"
            : "bg-slate-800/90 border border-slate-600/50"
        } backdrop-blur-md px-8 py-4 shadow-2xl transition-all duration-300 w-full`}
        style={{
          boxShadow: isHovered
            ? "0 0 50px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
            : "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: monochrome
              ? "linear-gradient(45deg, #ffffff, #94a3b8, #e2e8f0, #ffffff)"
              : "linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981, #f59e0b)",
            backgroundSize: "300% 300%",
            padding: "1px",
          }}
          animate={{
            backgroundPosition: isHovered ? "0% 0%" : "100% 100%",
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-full h-full bg-[#0B0D13]/95 rounded-2xl" />
        </motion.div>

        {/* Main content */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          {/* Lock icon with animation */}
          <motion.div
            animate={{
              rotateY: isHovered ? 180 : 0,
            }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className={`transition-colors duration-300 ${
                isHovered ? "text-white" : "text-neutral-400"
              }`}
            >
              <path
                d="M6 10V8C6 5.79 7.79 4 10 4H14C16.21 4 18 5.79 18 8V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 10H19C20.1 10 21 10.9 21 12V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 12V12C3 10.9 3.9 10 5 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="15"
                r="2"
                fill="currentColor"
                className={`transition-all duration-300 ${
                  isHovered ? "opacity-100" : "opacity-60"
                }`}
              />
            </svg>
          </motion.div>

          {/* Text with improved typography */}
          <span
            className={`font-mono text-base md:text-lg font-bold tracking-wider transition-all duration-300 ${
              isHovered
                ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                : "text-neutral-300"
            }`}
            style={{ fontFamily: "JetBrains Mono, Consolas, monospace" }}
          >
            {text}
          </span>
        </div>

        {/* Particle effect overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: isHovered
              ? "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, transparent 70%)"
              : "transparent",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
            animate={{
              y: isHovered ? [0, 80, 0] : 0,
              opacity: isHovered ? [0, 1, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.button>

      {/* Additional glow particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-0 pointer-events-none"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            opacity: isHovered ? [0, 1, 0] : 0,
            scale: isHovered ? [0, 1, 0] : 0,
            y: isHovered ? [0, -20, 0] : 0,
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

export interface EncryptNavButtonProps {
  label: string;
  desc?: string;
  icon?: LucideIcon;
  onClick: () => void;
  className?: string;
  badge?: string;
}

export const EncryptNavButton = ({
  label,
  desc,
  icon: Icon,
  onClick,
  className = "",
  badge,
}: EncryptNavButtonProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [text, setText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);

  const scramble = () => {
    let pos = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const scrambled = label
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }
          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          return CHARS[randomCharIndex];
        })
        .join("");
      setText(scrambled);
      pos++;
      if (pos >= label.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setText(label);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scramble();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    stopScramble();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background glow halo in textured monochromatic white/silver */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-xl opacity-60 pointer-events-none"
        animate={{
          background: isHovered
            ? "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(160,160,160,0.15), rgba(255,255,255,0.3))"
            : "linear-gradient(135deg, rgba(20,20,25,0.4), rgba(40,40,50,0.2))",
        }}
        transition={{ duration: 0.5 }}
      />

      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.025, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group w-full text-left overflow-hidden rounded-2xl bg-[#0B0D13]/90 hover:bg-[#12151D] border border-white/15 hover:border-white/50 p-5 md:p-6 shadow-xl transition-all duration-300 backdrop-blur-md"
        style={{
          boxShadow: isHovered
            ? "0 12px 35px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
            : "0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Animated perimeter border gradient in textured white/silver */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "linear-gradient(45deg, #ffffff, #71717a, #ffffff, #a1a1aa)",
            backgroundSize: "300% 300%",
            padding: "1px",
          }}
          animate={{
            backgroundPosition: isHovered ? "0% 0%" : "100% 100%",
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-full h-full bg-[#0B0D13]/90 rounded-2xl" />
        </motion.div>

        {/* Top Header Row with Icon & Badge */}
        <div className="relative z-10 flex items-center justify-between mb-3.5">
          {Icon && (
            <motion.div
              animate={{
                rotateY: isHovered ? 180 : 0,
              }}
              transition={{ duration: 0.55, type: "spring", stiffness: 180 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white shadow-inner group-hover:bg-white/20 transition-colors"
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          )}

          {badge ? (
            <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-white/20 bg-white/5 text-neutral-300">
              {badge}
            </span>
          ) : (
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 group-hover:text-white transition-colors">
              VIEW PAGE &rarr;
            </span>
          )}
        </div>

        {/* Text with Scramble Encryption Effect */}
        <div className="relative z-10">
          <div
            className={`font-mono text-sm md:text-base font-bold tracking-wide transition-all duration-300 ${
              isHovered
                ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                : "text-neutral-100"
            }`}
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {text}
          </div>

          {desc && (
            <p className="mt-1.5 text-xs text-neutral-400 group-hover:text-neutral-300 leading-relaxed font-sans transition-colors line-clamp-2">
              {desc}
            </p>
          )}
        </div>

        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
            animate={{
              y: isHovered ? [0, 110, 0] : 0,
              opacity: isHovered ? [0, 1, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Subtle Starlight Sparks */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-0 pointer-events-none"
            style={{
              left: `${15 + i * 25}%`,
              top: `${20 + (i % 2) * 45}%`,
            }}
            animate={{
              opacity: isHovered ? [0, 1, 0] : 0,
              scale: isHovered ? [0, 1.2, 0] : 0,
              y: isHovered ? [0, -14, 0] : 0,
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.25,
              repeat: Infinity,
            }}
          />
        ))}
      </motion.button>
    </div>
  );
};

const Component = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-8">
      <div className="space-y-8 max-w-sm w-full">
        <EncryptButton />
      </div>
    </div>
  );
};

export default Component;
