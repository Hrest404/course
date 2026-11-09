// Курс из базы знаний (rag/*.xlsx + программа из rag/*.docx), отдаётся сервисом: GET /api/courses.
export interface Course {
  id: string;
  title: string;
  direction: string;
  age: number | null;
  months: number | null;
  lessons: number | null;
  format: string;
  price: number | null;
  pricePremium: number | null;
  installment: string | null;
  salary: number | null;
  teachers: string[];
  url: string | null;
  program: string[];
}
