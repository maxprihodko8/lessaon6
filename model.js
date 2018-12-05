class Model {
    constructor() {

    }

    static async load(id) {
        let sql = `SELECT * FROM ${this.table()} WHERE ${this.pk} = ${id}`;

        let results = await global.db.query(sql);

        return this._deserialize(results);
    }

    static async loadAll() {
        let sql = 'SELECT * FROM ' + this.table();

        let results = await global.db.query(sql);

        return this._deserializeMultiple(results);
    }

    async findByParams(params) {
        let paramsToSql = '';

        for (let key in params) {
            paramsToSql += ` ${key} = ${params[key]} `;
        }

        let sql = `SELECT * FROM ${this.table()} WHERE ${paramsToSql}`;

        let results = await global.db.query(sql);

        return this._deserializeMultiple(results);
    }

    async save() {
        if (!this[this.constructor.pk]) {
            return await this.add();
        } else {
            return await this.update();
        }
    }

    async update() {
        let filtered = this.constructor.fields.filter(value => value !== 'id');

        let values = filtered.map((value, index, array) => {
            return this[value] != null ? `${array[index]} = "${this[value]}"` : 0;
        });

        let sql = `UPDATE ${this.constructor.table()} SET ${values} WHERE ${this.constructor.pk} = ${this[this.constructor.pk]}`;

        await global.db.query(sql);
    }

    async add() {
        let filtered = this.constructor.fields.filter(value => value !== 'id');

        let values = filtered.map((value, index) => {
           return this[value] !== undefined ? `"${this[value]}"` : 0;
        });

        let sql = `INSERT INTO ${this.constructor.table()} (${filtered}) VALUES (${values})`;

        let result = await global.db.query(sql);

        this[this.constructor.pk] = result.insertId;
    }

    async delete() {
        if (this[this.constructor.pk] == null) {
            throw new Error('User was not loaded');
        }

        let sql = `DELETE FROM ${this.constructor.table()} WHERE ${this.constructor.pk} = ${this[this.constructor.pk]}`;

        await global.db.query(sql);
    }

    async _extractSubModels() {
        if (this.hasMany) {
            for (let key in this.hasMany) {
                let config = this.hasMany[key];

                let model = config.model;
                let pk = config.primaryKey;
                let fk = config.foreignKey;

                let modelObject = new model;
                this[model] = await modelObject.findByParams({[fk]: this[this.constructor.pk]});
            }
        }
    }

    static async _deserialize(modelData) {
        if (modelData.length === 0) {
            throw new Error('Model was not found');
        }

        let resultObject = new this();
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

    static async _deserializeMultiple(modelDataList) {
        let result = [];

        for (let item in modelDataList) {
            result.push(await this._deserialize(modelDataList[item]));
        }

        return result;
    }
}

Model.pk = 'id';
Model.fields = [];

module.exports = Model;
