const Model = require('./model');
const Car = require('./car');

class User extends Model {
    static table() {
        return 'users';
    }
}

User.pk = 'id';
User.fields = ['id', 'first_name', 'last_name', 'age', 'gender'];
User.hasMany = [
    {
        model: Car,
        primaryKey: 'id',
        foreignKey: 'user_id'
    }
];

module.exports = User;
