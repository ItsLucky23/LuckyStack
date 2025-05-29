import { toast } from "sonner";
import { apiRequest } from "src/_functions/serverRequest";
// import config, { sessionLayout } from "src/loginConfig";
import config, { sessionLayout } from "../../config"
import nlJson from "src/locales/nl.json";
import enJson from "src/locales/en.json";

interface LanguageStrings {
  [key: string]: string | Record<string, any>;
}

const languages: Record<string, LanguageStrings> = {
  nl: nlJson as LanguageStrings,
  en: enJson as LanguageStrings,
};

// const getTranslation = (obj: any, key: string): string => {
//   return key.split('.').reduce((acc, part) => acc?.[part], obj) || key;
// }
const getTranslation = (obj: any, key: string, vars?: Record<string, string>): string => {
  const value = key.split(".").reduce((acc, part) => acc?.[part], obj);
  if (typeof value !== "string") return key;
  if (!vars) return value;

  return value.replace(/\{\{(.*?)\}\}/g, (_, varKey) => vars[varKey.trim()] ?? "");
};

const handleNotify = async (key: string, vars?: Record<string, any>) => {
  const session = await apiRequest({ name: 'session' }) as sessionLayout;
  const languageCode = session?.language || config.defaultLanguage || 'en';
  const translation = languages[languageCode];
  return getTranslation(translation, key, vars);
};

const notify = {
  success: async (key: string, vars?: Record<string, string>) => {
    const message = await handleNotify(key, vars);
    toast.success(message);
  },
  error: async (key: string, vars?: Record<string, string>) => {
    const message = await handleNotify(key, vars);
    toast.error(message);
  },
  info: async (key: string, vars?: Record<string, string>) => {
    const message = await handleNotify(key, vars);
    toast.info(message);
  },
  warning: async (key: string, vars?: Record<string, string>) => {
    const message = await handleNotify(key, vars);
    toast.warning(message);
  }
};

export default notify;