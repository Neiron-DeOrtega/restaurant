import { WorkHours } from "../entities/WorkHours";

export function getRestaurantStatus(workHours: WorkHours[]): boolean {
  const nowUTC = new Date();
  const mskOffset = 3 * 60; // 3 часа в минутах
  const nowMSK = new Date(nowUTC.getTime() + mskOffset * 60 * 1000);
  
  const jsDay = nowMSK.getDay(); 
  const targetDay = jsDay;

  const today = workHours.find(w => w.weekDay === targetDay);

  if (!today || !today.startTime || !today.endTime) {
    return false;
  }

  const nowMin = nowMSK.getHours() * 60 + nowMSK.getMinutes();

  const [sh, sm] = today.startTime.split(":").map(Number);
  const [eh, em] = today.endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  // Ночной режим (например 23:00 - 02:00)
  if (endMin <= startMin) {
    return (nowMin >= startMin || nowMin < endMin) ? true : false;
  }

  // Обычный день
  return (nowMin >= startMin && nowMin < endMin) ? true : false;
}