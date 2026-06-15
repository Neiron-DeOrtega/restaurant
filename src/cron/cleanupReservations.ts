import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { Reservation } from '../entities/Reservation';

export const startCleanupCron = () => {
  // Запуск каждый день в 03:00 (время сервера)
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Запуск очистки старых резервов...');
    
    try {
      const repository = AppDataSource.getRepository(Reservation);
      
      // Рассчитываем дату: 1 месяц назад
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      // Soft delete (рекомендуется) или hard delete
      const result = await repository
        .createQueryBuilder()
        .delete()
        .from(Reservation)
        .where('reservationDate < :date', { date: oneMonthAgo })
        .execute();
      
      console.log(`✅ Удалено резервов: ${result.affected}`);
    } catch (error) {
      console.error('❌ Ошибка при очистке резервов:', error);
    }
  });
  
  console.log('🗓 Cron cleanupReservations запущен');
};