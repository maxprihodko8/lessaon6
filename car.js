const Model = require('./model');

class Car extends Model {
    table() {
        return 'cars';
    }

    constructor() {
        super();

        this.pk = 'id';
        this.fields = ['id', 'user_id', 'model', 'year'];
    }
}

module.exports = Car;
