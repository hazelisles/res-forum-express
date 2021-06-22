'use strict';
const faker = require('faker')
const hours = ['08:00', '11:00', '11:30', '12:00', '17:00']
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Restaurants', Array.from({ length: 50 }).map((data, i) => ({
      name: faker.name.findName(),
      tel: faker.phone.phoneNumber(),
      address: faker.address.streetAddress(),
      opening_hours: hours[Math.floor(Math.random() * 5)],
      image: `https://loremflickr.com/320/240/restaurant,food/?random=${i}`,
      description: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date(),
      CategoryId: Math.floor(Math.random() * 13) * 10 + 1
    })), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Restaurants', null, {})
  }
};
