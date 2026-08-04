export const QUIZ_KEY="peposhots-booking-quiz";
export function readQuiz<T>(fallback:T):T{try{return JSON.parse(sessionStorage.getItem(QUIZ_KEY)||"") as T}catch{return fallback}}
export function saveQuiz(value:unknown){sessionStorage.setItem(QUIZ_KEY,JSON.stringify(value))}
export function clearQuiz(){sessionStorage.removeItem(QUIZ_KEY)}
