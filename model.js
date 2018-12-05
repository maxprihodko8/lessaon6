class Model {
    constructor() {

    }

    static async load(id) {
        const sql = `SELECT * FROM ${this.table()} WHERE ${this.pk} = ${id}`;

        let results = await global.db.query(sql);

        if (!results) {
            throw new Error('Model was not found');
        }

        return this._deserialize(results);
    }

    static async loadAll() {
        const sql = 'SELECT * FROM ' + this.table();

        let results = await global.db.query(sql);

        if (!results) {
            throw new Error('Models were not found');
        }

        return this._deserializeMultiple(results);
    }

    static async findByParams(params) {
        let paramsToSql = '';

        for (let key in params) {
            paramsToSql += ` ${key} = ${params[key]} `;
        }

        const sql = `SELECT * FROM ${this.table()} WHERE ${paramsToSql}`;

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
        const filtered = this.constructor.fields.filter(value => value !== this.constructor.pk);

        const values = filtered.map((value, index, array) => {
            return `${array[index]} = "${this[value]}"`;
        });

        const sql = `UPDATE ${this.constructor.table()} SET ${values} WHERE ${this.constructor.pk} = ${this[this.constructor.pk]}`;

        await global.db.query(sql);
    }

    async add() {
        const filtered = this.constructor.fields.filter(value => value !== this.constructor.pk);

        let values = filtered.map((value, index) => {
           return this[value] != null ? `"${this[value]}"` : '""';
        });

        const sql = `INSERT INTO ${this.constructor.table()} (${filtered}) VALUES (${values})`;

        let result = await global.db.query(sql);

        this[this.constructor.pk] = result.insertId;
    }

    async delete() {
        if (this[this.constructor.pk] == null) {
            throw new Error('User was not loaded');
        }

        const sql = `DELETE FROM ${this.constructor.table()} WHERE ${this.constructor.pk} = ${this[this.constructor.pk]}`;

        await global.db.query(sql);
    }

    async _extractSubModels() {
        if (this.constructor.hasMany) {
            for (let key in this.constructor.hasMany) {
                let {model, primaryKey, foreignKey} = this.constructor.hasMany[key];

                let modelObject = new model;
                this[model] = await modelObject.constructor.findByParams({[foreignKey]: this[primaryKey]});
            }
        }
    }

    static async _deserialize(modelData) {
        if (!modelData.length) {
            if (typeof modelData !== 'object') {
                throw new Error('Model was not found');
            }
        }

        let resultObject = new this();
        let data = {};

        if (modelData instanceof Array) {
            data = modelData.pop();
        } else {
            data = modelData;
        }

        let filtered = Object.keys(data).filter((value => this.fields.includes(value)));

        for(let key in filtered) {
            if (data.hasOwnProperty(filtered[key])) {
                resultObject[filtered[key]] = data[filtered[key]];
            }
        }

        await resultObject._extractSubModels();

        return resultObject;
    }

    static async _deserializeMultiple(modelDataList) {
        return await Promise.all(modelDataList.map(async (value) => await this._deserialize(value)));
    }
}

Model.pk = 'id';
Model.fields = [];

module.exports = Model;
