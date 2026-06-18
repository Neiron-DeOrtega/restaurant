import {
  Html, Head, Body, Container, Section, Text, Heading, Button, Hr, Tailwind
} from '@react-email/components';

interface Props {
  guestName: string;
  date: string;
  time: string;
  endTime: string;
  tableNumber: string | number;
  guestsNumber: number;
  restaurantName: string;
  confirmationUrl: string;
}

export const ReservationConfirmationEmail = ({
  guestName, date, time, endTime, tableNumber, guestsNumber, restaurantName, confirmationUrl
}: Props) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="bg-gray-50 my-auto mx-auto font-sans">
        <Container className="border border-gray-200 rounded bg-white my-[40px] mx-auto p-[20px] max-w-[465px]">
          <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            Подтвердите бронь 🍽
          </Heading>
          <Text className="text-black text-[14px] leading-[24px]">
            Здравствуйте, <strong>{guestName}</strong>!
          </Text>
          <Text className="text-black text-[14px] leading-[24px]">
            Вы создали бронь в ресторане <strong>{restaurantName}</strong>. Чтобы завершить оформление, пожалуйста, подтвердите её, нажав на кнопку ниже.
          </Text>
          <Section className="bg-gray-100 rounded p-[20px] my-[20px] text-center">
            <Text className="text-black text-[14px] leading-[24px] m-0">
              📅 {date}<br/>
              🕐 {time} – {endTime}<br/>
              🪑 Стол: {tableNumber}<br/>
              👥 Гостей: {guestsNumber}
            </Text>
          </Section>
          <Button
            href={confirmationUrl}
            className="bg-black text-white text-[14px] font-semibold rounded px-[20px] py-[12px] text-center no-underline inline-block"
          >
            Подтвердить бронь
          </Button>
          <Hr className="border-gray-200 my-[26px] mx-0 w-full" />
          <Text className="text-gray-500 text-[12px] leading-[24px]">
            Ссылка действительна 24 часа. Если вы не создавали эту бронь, просто проигнорируйте письмо.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);