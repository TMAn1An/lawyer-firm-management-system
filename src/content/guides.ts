import type { Category } from "@/lib/categories";

type Bi = { en: string; bn: string };
type BiList = { en: string[]; bn: string[] };

export type Guide = {
  slug: string;
  category: Category;
  title: Bi;
  summary: Bi;
  /** Steps a person can take, in order. */
  steps: BiList;
  /** Plain-language explanation of the rights involved. */
  rights: BiList;
  sources: Bi[];
  /** Name of the legal professional who reviewed it. null = community draft, a banner is shown. */
  reviewedBy: string | null;
  updated: string;
};

/**
 * Guides are plain data so anyone can improve them with a pull request.
 * Keep language simple (aim for a Class 8 reading level) and avoid giving
 * advice about a specific case. Set `reviewedBy` only after a lawyer has checked the text.
 */
export const GUIDES: Guide[] = [
  {
    slug: "free-legal-aid",
    category: "OTHER",
    title: { en: "How to get free government legal aid", bn: "সরকারি বিনামূল্যে আইনি সহায়তা পাবেন যেভাবে" },
    summary: {
      en: "Every district has a legal-aid committee. Who it helps and how to reach it.",
      bn: "প্রতিটি জেলায় আইনগত সহায়তা কমিটি আছে। কারা সহায়তা পান এবং কীভাবে যোগাযোগ করবেন।",
    },
    rights: {
      en: [
        "Under the Legal Aid Services Act 2000, people who cannot afford a lawyer can get legal help from the state at no cost.",
        "Each district has a District Legal Aid Committee based at the District Judge's court. It can arrange a lawyer and cover some court costs for people who qualify.",
        "A toll-free helpline, 16430, gives information about legal aid.",
      ],
      bn: [
        "আইনগত সহায়তা প্রদান আইন ২০০০ অনুযায়ী যাঁরা আইনজীবীর খরচ বহন করতে পারেন না, তাঁরা রাষ্ট্রের কাছ থেকে বিনামূল্যে আইনি সহায়তা পেতে পারেন।",
        "প্রতিটি জেলায় জেলা জজ আদালতে জেলা লিগ্যাল এইড কমিটি আছে। যাঁরা যোগ্য, তাঁদের জন্য কমিটি আইনজীবীর ব্যবস্থা করতে এবং আদালতের কিছু খরচ বহন করতে পারে।",
        "১৬৪৩০ নম্বরের টোল-ফ্রি হেল্পলাইনে আইনগত সহায়তা সম্পর্কে তথ্য পাওয়া যায়।",
      ],
    },
    steps: {
      en: [
        "Call 16430, or visit the District Legal Aid Committee office at your district court.",
        "Explain your problem briefly and ask whether you qualify.",
        "Bring your national ID (or birth certificate), any court papers, and proof of income if you have it.",
        "If you do not qualify, ask the office or a legal-aid organisation for other free options.",
      ],
      bn: [
        "১৬৪৩০ নম্বরে ফোন করুন, অথবা আপনার জেলা আদালতে জেলা লিগ্যাল এইড কমিটির কার্যালয়ে যান।",
        "সমস্যাটি সংক্ষেপে বলুন এবং আপনি যোগ্য কি না জিজ্ঞাসা করুন।",
        "জাতীয় পরিচয়পত্র (বা জন্মনিবন্ধন), আদালতের কাগজপত্র এবং আয়ের প্রমাণ থাকলে সাথে নিন।",
        "যোগ্য না হলে কার্যালয় বা কোনো আইনি সহায়তা সংস্থার কাছে অন্য বিনামূল্যে উপায় জানতে চান।",
      ],
    },
    sources: [{ en: "Legal Aid Services Act, 2000", bn: "আইনগত সহায়তা প্রদান আইন, ২০০০" }],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "arrest-rights",
    category: "CRIMINAL",
    title: { en: "Your rights if you or someone you know is arrested", bn: "নিজে বা কেউ গ্রেপ্তার হলে আপনার অধিকার" },
    summary: {
      en: "What the Constitution says about arrest, a lawyer and the 24-hour rule.",
      bn: "গ্রেপ্তার, আইনজীবী এবং ২৪ ঘণ্টার নিয়ম সম্পর্কে সংবিধান যা বলে।",
    },
    rights: {
      en: [
        "Article 33 of the Constitution says an arrested person must be told the reasons for the arrest as soon as possible.",
        "They have the right to consult a lawyer of their choice and be defended by that lawyer.",
        "They must be brought before the nearest magistrate within 24 hours of arrest (not counting travel time) and cannot be kept in custody longer without a magistrate's order.",
        "Court directions in the 2003 BLAST case set safeguards for arrest and remand, such as a written memo of arrest and informing a relative.",
      ],
      bn: [
        "সংবিধানের ৩৩ অনুচ্ছেদ অনুযায়ী গ্রেপ্তারকৃত ব্যক্তিকে যথাশীঘ্র গ্রেপ্তারের কারণ জানাতে হবে।",
        "তিনি নিজের পছন্দের আইনজীবীর সাথে পরামর্শ করার এবং তাঁর মাধ্যমে আত্মপক্ষ সমর্থনের অধিকার রাখেন।",
        "গ্রেপ্তারের ২৪ ঘণ্টার মধ্যে (যাতায়াতের সময় বাদে) নিকটতম ম্যাজিস্ট্রেটের সামনে হাজির করতে হবে; ম্যাজিস্ট্রেটের আদেশ ছাড়া এর বেশি সময় আটক রাখা যায় না।",
        "২০০৩ সালের ব্লাস্ট মামলায় হাইকোর্টের নির্দেশনায় গ্রেপ্তার ও রিমান্ডের কিছু সুরক্ষা ঠিক করা হয়েছে, যেমন লিখিত গ্রেপ্তার-স্মারক এবং আত্মীয়কে জানানো।",
      ],
    },
    steps: {
      en: [
        "Stay calm. Ask the officer to state the reason for arrest, and note their name and station.",
        "Ask the police to inform a family member, or call one yourself if you are allowed.",
        "Ask for a lawyer. If you cannot afford one, contact the District Legal Aid Committee (16430).",
        "Say only what you are sure of. You may ask for your lawyer to be present.",
        "Family: ask which station is holding the person, find out the case number, and note the date and time of arrest.",
      ],
      bn: [
        "শান্ত থাকুন। কর্মকর্তাকে গ্রেপ্তারের কারণ বলতে বলুন এবং তাঁর নাম ও থানা লিখে রাখুন।",
        "পুলিশকে পরিবারের কাউকে জানাতে বলুন, অনুমতি পেলে নিজেও ফোন করুন।",
        "আইনজীবী চান। খরচ বহন করতে না পারলে জেলা লিগ্যাল এইড কমিটির (১৬৪৩০) সাথে যোগাযোগ করুন।",
        "যা নিশ্চিত শুধু তা-ই বলুন। আইনজীবীকে উপস্থিত রাখার অনুরোধ করতে পারেন।",
        "পরিবারের সদস্যরা: কোন থানায় আটক আছে জেনে নিন, মামলার নম্বর জানুন এবং গ্রেপ্তারের তারিখ ও সময় লিখে রাখুন।",
      ],
    },
    sources: [
      { en: "Constitution of Bangladesh, Article 33", bn: "বাংলাদেশের সংবিধান, অনুচ্ছেদ ৩৩" },
      { en: "BLAST v. Bangladesh (2003), High Court Division directions on arrest and remand", bn: "ব্লাস্ট বনাম বাংলাদেশ (২০০৩), গ্রেপ্তার ও রিমান্ড বিষয়ে হাইকোর্ট বিভাগের নির্দেশনা" },
    ],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "gd-and-fir",
    category: "CRIMINAL",
    title: { en: "Going to the police: GD or FIR?", bn: "থানায় যাওয়া: জিডি নাকি এফআইআর?" },
    summary: {
      en: "The difference between a General Diary entry and a First Information Report, and what to do if police refuse.",
      bn: "সাধারণ ডায়েরি (জিডি) ও প্রথম তথ্য বিবরণীর (এফআইআর) পার্থক্য এবং পুলিশ নিতে না চাইলে করণীয়।",
    },
    rights: {
      en: [
        "A General Diary (GD) is a record of an incident, a threat, or a lost document. It is not a criminal case by itself.",
        "A First Information Report (FIR) starts a criminal investigation for a serious (cognizable) offence such as theft, assault or rape.",
        "You can ask for a copy of what is recorded. You should never need to pay to file either.",
      ],
      bn: [
        "সাধারণ ডায়েরি (জিডি) হলো কোনো ঘটনা, হুমকি বা হারানো কাগজের লিখিত রেকর্ড। এটি নিজে কোনো ফৌজদারি মামলা নয়।",
        "এজাহার বা এফআইআর চুরি, মারধর, ধর্ষণের মতো গুরুতর (আমলযোগ্য) অপরাধে ফৌজদারি তদন্ত শুরু করে।",
        "যা লেখা হলো তার একটি কপি চাইতে পারেন। কোনোটি করতেই টাকা দিতে হবে না।",
      ],
    },
    steps: {
      en: [
        "Go to the police station for the area where the incident happened. Write down what happened, with dates, places and names.",
        "For a lost document or a threat, ask for a GD. For a serious crime, ask for an FIR.",
        "Keep the receipt or number and ask for a copy.",
        "If the station will not record it, write to the Superintendent of Police, or ask a lawyer or legal-aid office about a complaint petition to a Magistrate's court.",
      ],
      bn: [
        "ঘটনাস্থল যে থানার আওতায়, সেখানে যান। তারিখ, জায়গা ও নামসহ কী ঘটেছে লিখে নিন।",
        "কাগজ হারানো বা হুমকির জন্য জিডি চান। গুরুতর অপরাধের জন্য এজাহার (এফআইআর) চান।",
        "প্রাপ্তিস্বীকার বা নম্বর রাখুন এবং একটি কপি চান।",
        "থানা না নিলে পুলিশ সুপারকে লিখিতভাবে জানান, অথবা আইনজীবী বা আইনি সহায়তা কার্যালয়ের কাছে ম্যাজিস্ট্রেট আদালতে নালিশি দরখাস্তের বিষয়ে জানতে চান।",
      ],
    },
    sources: [{ en: "Code of Criminal Procedure, 1898", bn: "ফৌজদারি কার্যবিধি, ১৮৯৮" }],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "domestic-violence",
    category: "VIOLENCE",
    title: { en: "If you are facing violence at home", bn: "ঘরে সহিংসতার শিকার হলে" },
    summary: {
      en: "Protection orders, emergency numbers and where to get medical and legal help.",
      bn: "সুরক্ষা আদেশ, জরুরি নম্বর এবং চিকিৎসা ও আইনি সহায়তা কোথায় পাবেন।",
    },
    rights: {
      en: [
        "The Domestic Violence (Prevention and Protection) Act 2010 covers physical, mental, sexual and economic abuse in a family setting.",
        "A court can issue a protection order, give you the right to stay in the shared home, and order interim support.",
        "The Prevention of Women and Children Repression Act 2000 covers serious crimes such as rape, acid violence and trafficking. The Dowry Prohibition Act 2018 makes giving or taking dowry an offence.",
        "You can ask for help from police, an NGO, a legal-aid office, or apply to the court directly.",
      ],
      bn: [
        "পারিবারিক সহিংসতা (প্রতিরোধ ও সুরক্ষা) আইন ২০১০ পরিবারের মধ্যে শারীরিক, মানসিক, যৌন ও অর্থনৈতিক নির্যাতন কভার করে।",
        "আদালত সুরক্ষা আদেশ দিতে পারে, যৌথ বাসস্থানে থাকার অধিকার দিতে পারে এবং অন্তর্বর্তী ভরণপোষণের আদেশ দিতে পারে।",
        "নারী ও শিশু নির্যাতন প্রতিরোধ আইন ২০০০ ধর্ষণ, এসিড সন্ত্রাস, পাচারের মতো গুরুতর অপরাধ কভার করে। যৌতুক নিরোধ আইন ২০১৮ অনুযায়ী যৌতুক দেওয়া বা নেওয়া অপরাধ।",
        "পুলিশ, এনজিও বা আইনি সহায়তা কার্যালয়ের সাহায্য চাইতে পারেন, অথবা সরাসরি আদালতে আবেদন করতে পারেন।",
      ],
    },
    steps: {
      en: [
        "If you are in danger now, call 999. For advice, counselling and referral, call 109 (free, 24 hours).",
        "Go to a safe place if you can, such as a relative's home, a neighbour, or a shelter. Take your phone, ID and any medicine.",
        "Get a medical check-up. Some government hospitals have One-Stop Crisis Centres. Keep the medical report.",
        "Keep evidence: photos of injuries, messages, call records, names of witnesses.",
        "Contact a legal-aid organisation or the District Legal Aid Committee (16430) about a protection order or a case.",
      ],
      bn: [
        "এখনই বিপদে থাকলে ৯৯৯ নম্বরে ফোন করুন। পরামর্শ, কাউন্সেলিং ও রেফারেলের জন্য ১০৯ (বিনামূল্যে, ২৪ ঘণ্টা) নম্বরে ফোন করুন।",
        "সম্ভব হলে নিরাপদ জায়গায় যান, যেমন আত্মীয়ের বাড়ি, প্রতিবেশী বা শেল্টার হোম। ফোন, পরিচয়পত্র ও ওষুধ সাথে নিন।",
        "ডাক্তারি পরীক্ষা করান। কিছু সরকারি হাসপাতালে ওয়ান-স্টপ ক্রাইসিস সেন্টার আছে। মেডিকেল রিপোর্ট সংরক্ষণ করুন।",
        "প্রমাণ রাখুন: আঘাতের ছবি, মেসেজ, কল রেকর্ড, সাক্ষীদের নাম।",
        "সুরক্ষা আদেশ বা মামলার বিষয়ে কোনো আইনি সহায়তা সংস্থা বা জেলা লিগ্যাল এইড কমিটির (১৬৪৩০) সাথে যোগাযোগ করুন।",
      ],
    },
    sources: [
      { en: "Domestic Violence (Prevention and Protection) Act, 2010", bn: "পারিবারিক সহিংসতা (প্রতিরোধ ও সুরক্ষা) আইন, ২০১০" },
      { en: "Prevention of Women and Children Repression Act, 2000", bn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০" },
      { en: "Dowry Prohibition Act, 2018", bn: "যৌতুক নিরোধ আইন, ২০১৮" },
    ],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "marriage-divorce-maintenance",
    category: "FAMILY",
    title: { en: "Marriage registration, dower and maintenance", bn: "বিবাহ নিবন্ধন, দেনমোহর ও ভরণপোষণ" },
    summary: {
      en: "Why to register a marriage, what dower is, and where family disputes are decided.",
      bn: "কেন বিয়ে নিবন্ধন করবেন, দেনমোহর কী এবং পারিবারিক বিরোধ কোথায় নিষ্পত্তি হয়।",
    },
    rights: {
      en: [
        "Muslim marriages must be registered with a licensed Nikah Registrar. A registered kabinnama is your main proof of marriage and of the agreed dower (denmohr).",
        "Dower is a right of the wife and is a debt owed by the husband.",
        "For Muslims, a husband who wants to divorce must give written notice to the Union Parishad or City Corporation chairperson and send a copy to the wife. In general the divorce takes effect after 90 days.",
        "Disputes about dower, maintenance and custody of children are heard by the Family Court.",
        "Hindu and Christian families follow their own personal laws and registration rules. Ask a legal-aid office about your situation.",
      ],
      bn: [
        "মুসলিম বিয়ে লাইসেন্সপ্রাপ্ত নিকাহ রেজিস্ট্রারের কাছে নিবন্ধন করতে হয়। নিবন্ধিত কাবিননামাই বিয়ের এবং নির্ধারিত দেনমোহরের প্রধান প্রমাণ।",
        "দেনমোহর স্ত্রীর অধিকার এবং স্বামীর কাছে এটি একটি ঋণ।",
        "মুসলিমদের ক্ষেত্রে স্বামী তালাক দিতে চাইলে ইউনিয়ন পরিষদ বা সিটি কর্পোরেশনের চেয়ারম্যানকে লিখিত নোটিশ দিতে হয় এবং স্ত্রীকে একটি কপি পাঠাতে হয়। সাধারণত ৯০ দিন পর তালাক কার্যকর হয়।",
        "দেনমোহর, ভরণপোষণ ও সন্তানের অভিভাবকত্ব নিয়ে বিরোধ পারিবারিক আদালতে নিষ্পত্তি হয়।",
        "হিন্দু ও খ্রিষ্টান পরিবারের জন্য নিজস্ব ব্যক্তিগত আইন ও নিবন্ধন নিয়ম প্রযোজ্য। নিজের পরিস্থিতি সম্পর্কে আইনি সহায়তা কার্যালয়ে জানতে চান।",
      ],
    },
    steps: {
      en: [
        "Make sure the marriage is registered and keep the kabinnama safe. Take a photo copy.",
        "If you are owed dower or maintenance, gather the kabinnama, ID, and any messages or records of non-payment.",
        "Ask a legal-aid office to help you file in the Family Court. Many offer help at no cost.",
        "If you receive a divorce notice, do not ignore it: seek advice within the notice period.",
      ],
      bn: [
        "বিয়ে নিবন্ধিত কি না নিশ্চিত করুন এবং কাবিননামা নিরাপদে রাখুন। একটি ফটোকপি রাখুন।",
        "দেনমোহর বা ভরণপোষণ পাওনা থাকলে কাবিননামা, পরিচয়পত্র এবং অনাদায়ের কোনো মেসেজ বা রেকর্ড জোগাড় করুন।",
        "পারিবারিক আদালতে মামলা করতে আইনি সহায়তা কার্যালয়ের সাহায্য চান। অনেক কার্যালয় বিনামূল্যে সহায়তা দেয়।",
        "তালাকের নোটিশ পেলে অবহেলা করবেন না: নোটিশের সময়সীমার মধ্যেই পরামর্শ নিন।",
      ],
    },
    sources: [
      { en: "Muslim Family Laws Ordinance, 1961", bn: "মুসলিম পারিবারিক আইন অধ্যাদেশ, ১৯৬১" },
      { en: "Muslim Marriages and Divorces (Registration) Act, 1974", bn: "মুসলিম বিবাহ ও তালাক (নিবন্ধন) আইন, ১৯৭৪" },
      { en: "Family Courts Ordinance, 1985", bn: "পারিবারিক আদালত অধ্যাদেশ, ১৯৮৫" },
    ],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "land-records-and-mutation",
    category: "LAND",
    title: { en: "Land records, mutation (namjari) and buying property safely", bn: "ভূমি রেকর্ড, নামজারি ও নিরাপদে সম্পত্তি কেনা" },
    summary: {
      en: "Check ownership papers, get your name recorded, and avoid common land fraud.",
      bn: "মালিকানার কাগজ যাচাই, নিজের নাম রেকর্ড করা এবং জমি-জালিয়াতি এড়ানো।",
    },
    rights: {
      en: [
        "A registered deed (dolil) shows a transfer, but your name must also be recorded in the land records through mutation (namjari) at the Assistant Commissioner (Land) office.",
        "Once mutation is done you can pay land development tax (khajna) in your own name and get a record-of-rights copy (khatian).",
        "Government online services such as e-Porcha (eporcha.gov.bd) and e-Mutation let you request records and apply for mutation from home.",
        "Inheritance shares are set by your religion's personal law. A succession certificate or a heirs list can be needed to mutate inherited land.",
      ],
      bn: [
        "রেজিস্ট্রিকৃত দলিল হস্তান্তর প্রমাণ করে, কিন্তু সহকারী কমিশনার (ভূমি) কার্যালয়ে নামজারির মাধ্যমে ভূমি রেকর্ডেও আপনার নাম উঠতে হয়।",
        "নামজারি হলে নিজের নামে ভূমি উন্নয়ন কর (খাজনা) দিতে এবং খতিয়ানের কপি পেতে পারবেন।",
        "ই-পর্চা (eporcha.gov.bd) ও ই-মিউটেশনের মতো সরকারি অনলাইন সেবায় ঘরে বসেই রেকর্ডের কপি ও নামজারির আবেদন করা যায়।",
        "উত্তরাধিকারের অংশ নিজ ধর্মের ব্যক্তিগত আইনে নির্ধারিত হয়। উত্তরাধিকারসূত্রে পাওয়া জমি নামজারিতে ওয়ারিশ সনদ লাগতে পারে।",
      ],
    },
    steps: {
      en: [
        "Before buying, collect and compare the deed, the latest khatian, mutation records and tax receipts. Check the seller's chain of ownership.",
        "Never hand over large cash payments without a registered deed and a receipt.",
        "After buying, apply for mutation promptly and keep every receipt.",
        "For a boundary or ownership dispute, get certified copies of the records and speak to a legal-aid office before signing anything.",
      ],
      bn: [
        "কেনার আগে দলিল, সর্বশেষ খতিয়ান, নামজারির রেকর্ড ও খাজনার রসিদ সংগ্রহ করে মিলিয়ে দেখুন। বিক্রেতার মালিকানার ধারাবাহিকতা যাচাই করুন।",
        "রেজিস্ট্রিকৃত দলিল ও রসিদ ছাড়া বড় অঙ্কের নগদ টাকা দেবেন না।",
        "কেনার পর দ্রুত নামজারির আবেদন করুন এবং সব রসিদ সংরক্ষণ করুন।",
        "সীমানা বা মালিকানা বিরোধে রেকর্ডের সত্যায়িত কপি সংগ্রহ করুন এবং কিছুতে সই করার আগে আইনি সহায়তা কার্যালয়ের সাথে কথা বলুন।",
      ],
    },
    sources: [
      { en: "Land services portal, Ministry of Land (land.gov.bd)", bn: "ভূমি মন্ত্রণালয়ের ভূমি সেবা পোর্টাল (land.gov.bd)" },
      { en: "State Acquisition and Tenancy Act, 1950; Registration Act, 1908", bn: "রাষ্ট্রীয় অধিগ্রহণ ও প্রজাস্বত্ব আইন, ১৯৫০; রেজিস্ট্রেশন আইন, ১৯০৮" },
    ],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "workplace-rights",
    category: "LABOUR",
    title: { en: "Wages, contracts and dismissal at work", bn: "কর্মক্ষেত্রে মজুরি, নিয়োগ ও চাকরিচ্যুতি" },
    summary: {
      en: "What the Labour Act says about appointment letters, wages, maternity leave and complaints.",
      bn: "নিয়োগপত্র, মজুরি, মাতৃত্বকালীন ছুটি ও অভিযোগ সম্পর্কে শ্রম আইন যা বলে।",
    },
    rights: {
      en: [
        "Under the Bangladesh Labour Act 2006, an employer must give a written appointment letter and an identity card.",
        "Wages must be paid within seven working days after the end of the wage period.",
        "Women workers are entitled to maternity leave of 16 weeks in total, with benefits as set out in the Act.",
        "A worker cannot be dismissed without following the procedure in the Act, including notice and a chance to respond to allegations.",
      ],
      bn: [
        "বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী মালিককে লিখিত নিয়োগপত্র ও পরিচয়পত্র দিতে হয়।",
        "মজুরি-কাল শেষ হওয়ার পর সাত কর্মদিবসের মধ্যে মজুরি পরিশোধ করতে হয়।",
        "নারী শ্রমিক মোট ১৬ সপ্তাহের মাতৃত্বকালীন ছুটি এবং আইনে নির্ধারিত সুবিধা পাওয়ার অধিকারী।",
        "আইনের নির্ধারিত পদ্ধতি, যেমন নোটিশ ও অভিযোগের জবাব দেওয়ার সুযোগ ছাড়া শ্রমিককে ছাঁটাই করা যায় না।",
      ],
    },
    steps: {
      en: [
        "Keep copies of your appointment letter, pay slips, attendance records and any messages about wages or dismissal.",
        "First ask your employer or HR in writing. Keep a copy of your letter.",
        "If that does not work, complain to the Department of Inspection for Factories and Establishments (DIFE) or the labour office in your district.",
        "For unpaid wages or wrongful dismissal, a legal-aid office can help you apply to the Labour Court.",
      ],
      bn: [
        "নিয়োগপত্র, বেতনের স্লিপ, হাজিরার রেকর্ড এবং মজুরি বা ছাঁটাই সংক্রান্ত মেসেজের কপি রাখুন।",
        "প্রথমে মালিক বা এইচআরকে লিখিতভাবে জানান। চিঠির একটি কপি রাখুন।",
        "তাতে কাজ না হলে কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তর (ডিআইএফই) বা আপনার জেলার শ্রম দপ্তরে অভিযোগ করুন।",
        "বকেয়া মজুরি বা অন্যায় ছাঁটাইয়ের ক্ষেত্রে শ্রম আদালতে আবেদন করতে আইনি সহায়তা কার্যালয় সাহায্য করতে পারে।",
      ],
    },
    sources: [{ en: "Bangladesh Labour Act, 2006", bn: "বাংলাদেশ শ্রম আইন, ২০০৬" }],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "consumer-complaints",
    category: "CONSUMER",
    title: { en: "Defective goods, overcharging and false claims", bn: "ত্রুটিপূর্ণ পণ্য, অতিরিক্ত দাম ও ভুয়া দাবি" },
    summary: {
      en: "How to complain to the consumer rights authority and what evidence to keep.",
      bn: "ভোক্তা অধিকার কর্তৃপক্ষের কাছে কীভাবে অভিযোগ করবেন এবং কী প্রমাণ রাখবেন।",
    },
    rights: {
      en: [
        "The Consumer Rights Protection Act 2009 protects people from selling above the marked price, selling adulterated or expired goods, and false advertising.",
        "The Directorate of National Consumer Rights Protection (DNCRP) takes complaints and can fine offenders.",
      ],
      bn: [
        "ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ নির্ধারিত দামের বেশি নেওয়া, ভেজাল বা মেয়াদোত্তীর্ণ পণ্য বিক্রি এবং ভুয়া বিজ্ঞাপন থেকে মানুষকে সুরক্ষা দেয়।",
        "জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (ডিএনসিআরপি) অভিযোগ নেয় এবং দোষীকে জরিমানা করতে পারে।",
      ],
    },
    steps: {
      en: [
        "Keep the receipt, packaging and photos of the product and the price tag.",
        "Complain first to the seller in writing.",
        "If unresolved, file a complaint with DNCRP through its official website or district office. Check the website for the current hotline and form.",
      ],
      bn: [
        "রসিদ, মোড়ক এবং পণ্য ও দামের ট্যাগের ছবি রাখুন।",
        "প্রথমে বিক্রেতাকে লিখিতভাবে অভিযোগ জানান।",
        "সমাধান না হলে ডিএনসিআরপির অফিসিয়াল ওয়েবসাইট বা জেলা কার্যালয়ের মাধ্যমে অভিযোগ করুন। বর্তমান হটলাইন ও ফর্ম ওয়েবসাইটে দেখে নিন।",
      ],
    },
    sources: [{ en: "Consumer Rights Protection Act, 2009", bn: "ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯" }],
    reviewedBy: null,
    updated: "2026-11-01",
  },
  {
    slug: "right-to-information",
    category: "RTI",
    title: { en: "Asking a government office for information (RTI)", bn: "সরকারি দপ্তরের কাছে তথ্য চাওয়া (তথ্য অধিকার)" },
    summary: {
      en: "You have a legal right to information held by public offices. Here is how to ask.",
      bn: "সরকারি দপ্তরের কাছে থাকা তথ্য পাওয়া আপনার আইনি অধিকার। কীভাবে চাইবেন তা জানুন।",
    },
    rights: {
      en: [
        "The Right to Information Act 2009 lets any citizen request information from public authorities.",
        "Each authority has a Designated Officer. They must reply within 20 working days (up to 30 if several units are involved).",
        "You pay only a reasonable cost for copies. If you are refused or ignored, you can appeal to the appellate authority and then complain to the Information Commission.",
      ],
      bn: [
        "তথ্য অধিকার আইন ২০০৯ অনুযায়ী যেকোনো নাগরিক সরকারি কর্তৃপক্ষের কাছে তথ্য চাইতে পারেন।",
        "প্রতিটি কর্তৃপক্ষের একজন দায়িত্বপ্রাপ্ত কর্মকর্তা থাকেন। তাঁকে ২০ কর্মদিবসের মধ্যে (একাধিক ইউনিট জড়িত থাকলে সর্বোচ্চ ৩০) উত্তর দিতে হয়।",
        "শুধু কপির যুক্তিসংগত খরচ দিতে হয়। প্রত্যাখ্যাত বা উপেক্ষিত হলে আপিল কর্তৃপক্ষের কাছে আপিল এবং পরে তথ্য কমিশনে অভিযোগ করতে পারেন।",
      ],
    },
    steps: {
      en: [
        "Find the office's Designated Officer (DO). Its website or notice board should list them.",
        "Write the application in the prescribed form, stating exactly what information you want.",
        "Keep a stamped copy or proof of sending. Note the date.",
        "If there is no reply in time, appeal to the appellate authority named by the office.",
      ],
      bn: [
        "দপ্তরের দায়িত্বপ্রাপ্ত কর্মকর্তাকে (ডিও) খুঁজে নিন। ওয়েবসাইট বা নোটিশ বোর্ডে তাঁর তথ্য থাকার কথা।",
        "নির্ধারিত ফর্মে আবেদন লিখুন এবং ঠিক কোন তথ্য চান তা স্পষ্ট করুন।",
        "সিলযুক্ত কপি বা পাঠানোর প্রমাণ রাখুন। তারিখ লিখে রাখুন।",
        "সময়মতো উত্তর না এলে দপ্তরের নির্ধারিত আপিল কর্তৃপক্ষের কাছে আপিল করুন।",
      ],
    },
    sources: [{ en: "Right to Information Act, 2009", bn: "তথ্য অধিকার আইন, ২০০৯" }],
    reviewedBy: null,
    updated: "2026-11-01",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function guidesFor(category: Category): Guide[] {
  return GUIDES.filter((g) => g.category === category);
}

/** Documents people commonly need to bring, by topic. */
export const DOCUMENTS: Record<Category, BiList> = {
  FAMILY: {
    en: ["Your NID or birth certificate", "Kabinnama / marriage certificate", "Any divorce notice received", "Children's birth certificates", "Proof of income, if maintenance is involved"],
    bn: ["জাতীয় পরিচয়পত্র বা জন্মনিবন্ধন", "কাবিননামা বা বিবাহের সনদ", "তালাকের নোটিশ পেয়ে থাকলে তার কপি", "সন্তানদের জন্মনিবন্ধন", "ভরণপোষণ জড়িত থাকলে আয়ের প্রমাণ"],
  },
  VIOLENCE: {
    en: ["Your NID or any ID", "Medical report and photos of injuries", "Messages, call records, other evidence", "Names and contact details of witnesses", "Any previous GD or complaint copy"],
    bn: ["জাতীয় পরিচয়পত্র বা যেকোনো পরিচয়পত্র", "মেডিকেল রিপোর্ট ও আঘাতের ছবি", "মেসেজ, কল রেকর্ড ও অন্যান্য প্রমাণ", "সাক্ষীদের নাম ও যোগাযোগের তথ্য", "আগের কোনো জিডি বা অভিযোগের কপি"],
  },
  LAND: {
    en: ["Deed (dolil) copies", "Latest khatian and mutation (namjari) records", "Land development tax (khajna) receipts", "Heirs list or succession certificate, if inherited", "Your NID"],
    bn: ["দলিলের কপি", "সর্বশেষ খতিয়ান ও নামজারির রেকর্ড", "ভূমি উন্নয়ন কর (খাজনা) রসিদ", "উত্তরাধিকারসূত্রে পেলে ওয়ারিশ তালিকা বা সনদ", "জাতীয় পরিচয়পত্র"],
  },
  LABOUR: {
    en: ["Appointment letter and ID card", "Pay slips or bank statements", "Attendance records", "Termination letter or messages", "Your NID"],
    bn: ["নিয়োগপত্র ও পরিচয়পত্র", "বেতনের স্লিপ বা ব্যাংক স্টেটমেন্ট", "হাজিরার রেকর্ড", "ছাঁটাইয়ের চিঠি বা মেসেজ", "জাতীয় পরিচয়পত্র"],
  },
  CRIMINAL: {
    en: ["Your NID", "Case number or FIR / GD copy", "Any court papers or summons", "Arrest memo, if one was given", "Names of witnesses"],
    bn: ["জাতীয় পরিচয়পত্র", "মামলা নম্বর বা এজাহার/জিডির কপি", "আদালতের কাগজপত্র বা সমন", "গ্রেপ্তার-স্মারক, দেওয়া হয়ে থাকলে", "সাক্ষীদের নাম"],
  },
  CONSUMER: {
    en: ["Receipt or invoice", "Product, packaging or photos", "Messages with the seller", "Advertisement screenshot, if relevant"],
    bn: ["রসিদ বা ইনভয়েস", "পণ্য, মোড়ক বা ছবি", "বিক্রেতার সাথে মেসেজ", "প্রাসঙ্গিক হলে বিজ্ঞাপনের স্ক্রিনশট"],
  },
  RTI: {
    en: ["Name of the office and the exact information you want", "Previous applications and replies", "Your NID"],
    bn: ["দপ্তরের নাম এবং ঠিক কোন তথ্য চান", "আগের আবেদন ও উত্তর", "জাতীয় পরিচয়পত্র"],
  },
  OTHER: {
    en: ["Your NID", "Any papers related to the problem", "A short timeline of what happened"],
    bn: ["জাতীয় পরিচয়পত্র", "সমস্যার সাথে সম্পর্কিত যেকোনো কাগজ", "কী কী ঘটেছে তার সংক্ষিপ্ত সময়রেখা"],
  },
};
