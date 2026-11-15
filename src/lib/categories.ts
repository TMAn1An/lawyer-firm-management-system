export const CATEGORIES = [
  "FAMILY",
  "VIOLENCE",
  "LAND",
  "LABOUR",
  "CRIMINAL",
  "CONSUMER",
  "RTI",
  "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, { en: string; bn: string; hintEn: string; hintBn: string }> = {
  FAMILY: {
    en: "Family & marriage",
    bn: "পারিবারিক ও বিবাহ",
    hintEn: "Marriage registration, dower, maintenance, divorce, custody",
    hintBn: "বিবাহ নিবন্ধন, দেনমোহর, ভরণপোষণ, তালাক, সন্তানের অভিভাবকত্ব",
  },
  VIOLENCE: {
    en: "Violence & abuse",
    bn: "নির্যাতন ও সহিংসতা",
    hintEn: "Domestic violence, harassment, abuse of women and children",
    hintBn: "পারিবারিক সহিংসতা, হয়রানি, নারী ও শিশু নির্যাতন",
  },
  LAND: {
    en: "Land & property",
    bn: "ভূমি ও সম্পত্তি",
    hintEn: "Inheritance, mutation (namjari), land records, boundary disputes",
    hintBn: "উত্তরাধিকার, নামজারি, ভূমি রেকর্ড, সীমানা বিরোধ",
  },
  LABOUR: {
    en: "Work & wages",
    bn: "কর্মক্ষেত্র ও মজুরি",
    hintEn: "Unpaid wages, wrongful dismissal, workplace safety, appointment letters",
    hintBn: "বকেয়া মজুরি, অন্যায় ছাঁটাই, কর্মক্ষেত্রের নিরাপত্তা, নিয়োগপত্র",
  },
  CRIMINAL: {
    en: "Police, arrest & courts",
    bn: "পুলিশ, গ্রেপ্তার ও আদালত",
    hintEn: "Filing a GD/FIR, arrest, bail, being falsely accused",
    hintBn: "জিডি/এফআইআর, গ্রেপ্তার, জামিন, মিথ্যা মামলা",
  },
  CONSUMER: {
    en: "Consumer rights",
    bn: "ভোক্তা অধিকার",
    hintEn: "Defective goods, overcharging, false advertising",
    hintBn: "ত্রুটিপূর্ণ পণ্য, অতিরিক্ত মূল্য, ভুয়া বিজ্ঞাপন",
  },
  RTI: {
    en: "Government services & information",
    bn: "সরকারি সেবা ও তথ্য",
    hintEn: "Right to information, delayed services, complaints against offices",
    hintBn: "তথ্য অধিকার, সেবায় দীর্ঘসূত্রতা, দপ্তরের বিরুদ্ধে অভিযোগ",
  },
  OTHER: {
    en: "Something else",
    bn: "অন্য কিছু",
    hintEn: "Not sure which category fits? Choose this and describe it.",
    hintBn: "কোনটি প্রযোজ্য বুঝতে পারছেন না? এটি বেছে বিবরণ লিখুন।",
  },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function splitCategories(csv: string): Category[] {
  return csv.split(",").map((s) => s.trim()).filter(isCategory);
}
