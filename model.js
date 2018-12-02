class Model {
    constructor() {

    }

    async findOne(id) {
        let sql = 'SELECT * from ' + this.table() + ' WHERE ' + this.pk + ' = ' + id;

        let results = await global.db.query(sql);

        return this._deserialize(results);
    }

    async findAll() {
        let sql = 'SELECT * from ' + this.table();

        let results = await global.db.query(sql);

        return this._deserializeMultiple(results);
    }

    save() {

    }

    delete() {

    }

    _deserialize(modelData) {
        let data = {};

        if (modelData instanceof Array) {
            data = modelData.pop();
        } else {
            data = modelData;
        }

        let filtered = Object.keys(data).filter((value => this.fields.includes(value)));

        for(let key in data) {
            if (data.hasOwnProperty(key) && filtered.includes(key)) {
                this[key] = data[key];
            }
        }

/*
        if (this.hasMany) {
            this.hasMany.forEach((config) => {
                let model = config.model;
                let pk = config.primaryKey;
                let fk = config.foreignKey;
            });
        }
*/

        return this;
    }

    _deserializeMultiple(modelDataList) {
        return modelDataList.map(modelData => this._deserialize(value));
    }
}

module.exports = Model;
