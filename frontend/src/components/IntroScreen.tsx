import { motion } from "framer-motion";
import { useEffect } from "react";

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  useEffect(() => {
    const autoTimer = setTimeout(() => onComplete(), 5000);
    return () => {
      clearTimeout(autoTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="intro-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 배경 애니메이션 요소들 */}
      <div className="intro-screen__bg">
        <motion.div
          className="intro-screen__bg-circle intro-screen__bg-circle--left"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="intro-screen__bg-circle intro-screen__bg-circle--right"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="intro-screen__content">
        {/* 로고 */}
        <motion.div
          className="intro-screen__logo"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 1.2,
          }}
        >
          <img
            src="images/urban-drop.svg"
            style={{ width: "200px", height: "200px" }}
          />
        </motion.div>

        {/* 텍스트 영역 */}
        <motion.div
          className="intro-screen__text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <motion.h1
            className="intro-screen__title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          >
            물길지킴이
          </motion.h1>
          <motion.p
            className="intro-screen__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.5 }}
          >
            Water Flow Guardian
          </motion.p>

          {/* 로딩 인디케이터 */}
          <motion.div
            className="intro-screen__loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="intro-screen__loading-dot"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
