class Model {
    constructor() {

    }

    async findOne(id) {
        let sql = `SELECT * FROM ${this.constructor.table()} WHERE ${this.pk} = id`;

        let results = await global.db.query(sql);

        return this._deserialize(results);
    }

    async findAll() {
        let sql = 'SELECT * FROM ' + this.constructor.table();

        let results = await global.db.query(sql);

        return this._deserializeMultiple(results);
    }

    async findByParams(params) {
        let paramsToSql = '';

        for (let key in params) {
            paramsToSql += ` ${key} = ${params[key]} `;
        }

        let sql = `SELECT * FROM ${this.constructor.table()} WHERE ${paramsToSql}`;

        let results = await global.db.query(sql);

        return this._deserializeMultiple(results);
    }

    save() {

    }

    delete() {

    }

    async _deserialize(modelData) {
        let resultObject = new this.constructor();
        let data = {};

        if (modelData instanceof Array) {
            data = modelData.pop();
        } else {
            data = modelData;
        }

        let filtered = Object.keys(data).filter((value => this.fields.includes(value)));

        for(let key in data) {
            if (data.hasOwnProperty(key) && filtered.includes(key)) {
                resultObject[key] = data[key];
            }
        }

        await resultObject._extractSubModels();

        return resultObject;
    }

    async _extractSubModels() {
        if (this.hasMany) {
            for (let key in this.hasMany) {
                let config = this.hasMany[key];

                let model = config.model;
                let pk = config.primaryKey;
                let fk = config.foreignKey;

                let modelObject = new model;
                this[model] = await modelObject.findByParams({[fk]: this.id});
            }
        }
    }

    async _deserializeMultiple(modelDataList) {
        let result = [];

        for (let item in modelDataList) {
            result.push(await this._deserialize(modelDataList[item]));
        }

        return result;
    }
}

module.exports = Model;
