const Model = require('./model');

class Car extends Model {
    static table() {
        return 'cars';
    }
}

Car.pk = 'id';
Car.fields = ['id', 'user_id', 'model', 'year'];

module.exports = Car;
