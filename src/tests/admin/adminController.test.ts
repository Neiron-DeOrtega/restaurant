import * as request from 'supertest';
import { expect } from 'chai';
import { app } from '../../index'; // Путь к твоему app

describe('PUT /api/admin/restaurant/:id', () => {
  let restaurantId = '70d49c45-d9d3-43ba-8762-f79f5a8314ff'; // ID ресторана для теста

  it('should update restaurant information successfully', async () => {
    const response = await request(app)
      .put(`/api/admin/restaurant/${restaurantId}`)
      .send({
        name: 'Обновлённый ресторан',
        address: 'Новый адрес',
        workHoursInfo: JSON.stringify([
          { weekDay: "Monday", startTime: "09:00", endTime: "18:00" }
        ]),
        breakTimeInfo: JSON.stringify({ startTime: "13:00", endTime: "14:00" }),
        contacts: JSON.stringify([{ key: "Телефон", content: "+7 999 123-45-67" }])
      });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Информация о ресторане успешно обновлена');
    expect(response.body.restaurant.name).to.equal('Обновлённый ресторан');
    expect(response.body.restaurant.address).to.equal('Новый адрес');
    expect(response.body.restaurant.workHours[0].startTime).to.equal("09:00");
    expect(response.body.restaurant.contacts[0].content).to.equal('+7 999 123-45-67');
  });

  it('should return 404 if restaurant not found', async () => {
    const restaurantId = 'non-existing-id';

    const response = await request(app)
      .put(`/api/admin/restaurant/${restaurantId}`)
      .send({
        name: 'Новый ресторан',
        address: 'Новый адрес',
      });

    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal('Ресторан не найден');
  });
});
