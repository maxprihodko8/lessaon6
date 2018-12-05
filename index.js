require('dotenv').config();
const mysql = require('mysql');
const util = require('util');

const Car = require('./car');
const User = require('./user');

global.db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

global.db.query = util.promisify(global.db.query);

async function check() {
    let carResult = await Car.load(2);

    let user = new User();

    try {
        user.age = 18;
        user.first_name = 'BBB2';
        await user.save();

        let user1 = await User.load(7);

        user1.first_name = 'DDD1';
        await user1.save();

        let users = await User.loadAll();

        await users.pop().delete();

        let car1 = new Car();
        car1.user_id = user1.id;
        car1.model = 'The test';
        car1.year = '1999';

        await car1.save();
    } catch (e) {
        console.log(e);
    }
}

check();

// Открыть с БД и вывести в консоль сузествующего пользователя с машинами

// Создать нового пользователя

// Изменить имя пользователю

// Удалить пользователя

// Добавить пользователю новую машину
