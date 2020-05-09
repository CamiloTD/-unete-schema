const tick = () => new Promise(done => process.nextTick(done));

declare type Primitive = "string" | "number" | "boolean" | "function" | "null" | "object" | "array" | "bigint" | "symbol" | "undefined" | "stream";

//? @note TypeMap
export class TypeMap {
    types: { [type: string]: Schema };

    constructor () {
        this.types = {};
    }

    async register (payload: any) {
        const type = getPayloadType(payload);
        await this.getSchema(type).register(payload);
    }
    
    getSchema (type: Primitive) {
        return this.types[type] || (this.types[type] = new Schema(type));
    }
}

//? @note PropertyMap
export class PropertyMap {
    properties: { [prop: string]: TypeMap };

    constructor () {
        this.properties = {};
    }

    getProp (prop: string) {
        return this.properties[prop] || (this.properties[prop] = new TypeMap());
    }
}

//? @note Schema
export class Schema {

    type: Primitive;
    frequency: number;
    properties: PropertyMap | null;

    constructor (type: Primitive){
        this.type = type;
        this.frequency = 0;
        this.properties = type === "object" || type === "array"? new PropertyMap() : null;
    }

    async register (payload: any) {
        this.frequency++;

        if(!this.properties) return;

        if(this.type === "array") payload = payload[0];
            
        for (const i in payload)
            await this.properties.getProp(i).register(payload[i]);

        await tick();
    }

}

export function getPayloadType (payload: any) {
    var nativeType = typeof payload;
    var type: Primitive = payload === null? "null" : Array.isArray(payload)? "array" : nativeType;

    return type;
}