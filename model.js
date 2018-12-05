class Model {
    constructor() {

    }

    async load(id) {
        let sql = `SELECT * FROM ${this.constructor.table()} WHERE ${this.pk} = ${id}`;

        let results = await global.db.query(sql);

        return this._deserialize(results);
    }

    async loadAll() {
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

    async save() {
        if (!this[this.pk]) {
            return await this.add();
        } else {
            return await this.update();
        }
    }

    async update() {
        let filtered = this.fields.filter(value => value !== 'id');

        let values = filtered.map((value, index, array) => {
            return this[value] != null ? `${array[index]} = "${this[value]}"` : 0;
        });

        let sql = `UPDATE ${this.constructor.table()} SET ${values} WHERE ${this.pk} = ${this[this.pk]}`;

        await global.db.query(sql);
    }

    async add() {
        let filtered = this.fields.filter(value => value !== 'id');

        let values = filtered.map((value, index) => {
           return this[value] !== undefined ? `"${this[value]}"` : 0;
        });

        let sql = `INSERT INTO ${this.constructor.table()} (${filtered}) VALUES (${values})`;

        let result = await global.db.query(sql);

        this[this.pk] = result.insertId;
    }

    async delete() {
        if (this[this.pk] == null) {
            throw new Error('User was not loaded');
        }

        let sql = `DELETE FROM ${this.constructor.table()} WHERE ${this.pk} = ${this[this.pk]}`;

        await global.db.query(sql);
    }

    async _deserialize(modelData) {
        if (modelData.length === 0) {
            throw new Error('Model was not found');
        }

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
                this[model] = await modelObject.findByParams({[fk]: this[this.pk]});
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
