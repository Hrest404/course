// Общие данные для serverless-функций Vercel: база знаний читается из rag/ в репозитории
// (файлы подключены через vercel.json) и кэшируется, пока функция «тёплая».
import path from 'node:path';
import { buildIndex } from '../server/rag.mjs';
import { buildCourses } from '../server/courses.mjs';

export const RAG_DIR = path.join(process.cwd(), 'rag');

let indexPromise;
let coursesPromise;

export const getIndex = () => (indexPromise ??= buildIndex(RAG_DIR));
export const getCourses = () => (coursesPromise ??= buildCourses(RAG_DIR));
