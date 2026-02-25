import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-xl p-0.5 text-xs font-extrabold">
      <motion.button
        onClick={() => setLang("th")}
        className={`px-2.5 py-1.5 rounded-lg transition-all ${
          lang === "th"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        🇹🇭 TH
      </motion.button>
      <motion.button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 rounded-lg transition-all ${
          lang === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        🇬🇧 EN
      </motion.button>
    </div>
  );
};

export default LanguageToggle;
