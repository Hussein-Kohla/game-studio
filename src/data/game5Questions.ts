import { pkgHistoryGeo } from "./packages/pkg_history_geo";
import { pkgScience } from "./packages/pkg_science";
import { culturePkg } from "./packages/pkg_culture";
import { pkg_islam } from "./packages/pkg_islam";
import { pkgPopCulture } from "./packages/pkg_pop_culture";

export type QuestionCategory = 
  | "جغرافيا" 
  | "تاريخ" 
  | "مسلسلات مصرية" 
  | "افلام مصرية" 
  | "فيزياء" 
  | "كيمياء" 
  | "احياء" 
  | "امثال شعبية" 
  | "دين" 
  | "اسئلة مالية"
  | "معلومات عامة"
  | "السيرة النبوية"
  | "الصحابة الكرام"
  | "القرآن الكريم"
  | "العقيدة والفقه"
  | "التاريخ الإسلامي"
  | "قصص الأنبياء"
  | "علوم";

export interface Game5Question {
  id: string;
  category: QuestionCategory | string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Game5Package {
  id: string;
  name: string;
  questions: Game5Question[];
}

const basePackages: Game5Package[] = [
  pkgPopCulture,
  pkgHistoryGeo,
  pkgScience,
  culturePkg,
  pkg_islam
];

// إنشاء البكج العشوائي الذي يسحب من كل البكجات
function createRandomPackage(packages: Game5Package[]): Game5Package {
  let allQuestions: Game5Question[] = [];
  
  packages.forEach(pkg => {
    // نتأكد إن الأسئلة موجودة لتجنب أي أخطاء
    if (pkg.questions && Array.isArray(pkg.questions)) {
      allQuestions = allQuestions.concat(pkg.questions);
    }
  });

  // خلط الأسئلة بشكل عشوائي (Fisher-Yates Shuffle)
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }
  
  return {
    id: "pkg_random",
    name: "🎲 بكج الحظ (أسئلة عشوائية من كل البكجات)",
    questions: allQuestions
  };
}

export const pkgRandom = createRandomPackage(basePackages);

export const game5Packages: Game5Package[] = [
  ...basePackages,
  pkgRandom
];
