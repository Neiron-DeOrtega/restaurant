import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import jwt from 'jsonwebtoken';
import { ReservationConfirmationEmail } from '../emails/ReservationConfirmationEmail';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err) console.error('SMTP connection failed:', err);
  else console.log('SMTP ready');
});

export const emailService = {
  sendReservationConfirmation: async (
    to: string,
    data: {
      guestName: string;
      date: string;
      time: string;
      endTime: string;
      tableNumber: string | number;
      guestsNumber: number;
      restaurantName: string;
      reservationId: string;
    }
  ) => {
    const token = jwt.sign(
      { reservationId: data.reservationId },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const confirmationUrl = `${process.env.API_URL || 'http://localhost:5000'}/api/confirm?token=${token}`;

    try {
      const html = await render(ReservationConfirmationEmail({ ...data, confirmationUrl }));    
          
      await transporter.sendMail({
        from: `"${data.restaurantName}" <${process.env.SMTP_FROM}>`,
        to,
        subject: `Подтверждение брони на ${data.date}`,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }
};