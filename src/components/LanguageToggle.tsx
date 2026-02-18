import { useLanguage } from "@/context/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-xl p-0.5 text-xs font-bold">
      <button
        onClick={() => setLang("th")}
        className={`px-2.5 py-1.5 rounded-lg transition-colors ${
          lang === "th"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🇹🇭 TH
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 rounded-lg transition-colors ${
          lang === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
};

export default LanguageToggle;
