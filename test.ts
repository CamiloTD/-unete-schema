import { log, highlight, cold, danger } from "termx";
import { TypeMap, getPayloadType } from ".";
import { writeFileSync, readFileSync } from "fs";

(async () => {
    {//? @note Test Primitives
        log(cold("Testing Primitives\n"));

        await testPrimitive(1);
        await testPrimitive(true);
        await testPrimitive(null)
        await testPrimitive(undefined)
        await testPrimitive(function () {})
        await testPrimitive({})
        await testPrimitive([])

        console.log();
    }
    {//? @note Test Basic Object
        await testBasicObject({
            identity: {
                name: "Camilo",
                lastName: "Torres"
            },
            age: 21
        });

        await testBasicArray([{
            identity: {
                name: "Camilo",
                lastName: "Torres"
            },
            age: 21
        }]);
    }

    {//? @note Mixed
        const props = new TypeMap();

        await props.register({ name: "Camilo" });
        await props.register({ name: "Camilo", age: 22 });
        for(let i=0;i<5;i++)
            await props.register({ name: "Camilo", age: 22, married: false });
        await props.register({ name: "Camilo", age: 22, married: 2 });
    }
})().catch(log);

async function testBasicObject (obj: any) {
    const props = new TypeMap;
    await props.register(obj);

    if(JSON.stringify(props, null, 2) !== readFileSync(__dirname + "/test/testBasicObject.json", "utf-8")) {
        writeFileSync("./test/testBasicObjectError.json", JSON.stringify(props, null, 2));
        log(danger("(FAIL)") + "Test Basic Object does not match ./test/testBasicObject.json, actual value stored at: ./test/testBasicObjectError.json");
    } else
        log(highlight("(OK)"), "Test Basic Object");
}

async function testBasicArray (arr: any[]) {
    const props = new TypeMap;
    await props.register(arr);

    if(JSON.stringify(props, null, 2) !== readFileSync(__dirname + "/test/testBasicArray.json", "utf-8")) {
        writeFileSync("./test/testBasicArrayError.json", JSON.stringify(props, null, 2));

        log(danger("(FAIL)") + "Test Basic Array does not match ./test/testBasicArray.json, actual value stored at: ./test/testBasicArrayError.json");
    } else
        log(highlight("(OK)"), "Test Basic Array");
}

async function testPrimitive (value: any) {
    const props = new TypeMap();
    const type = getPayloadType(value);

    await props.register(value);

    const schema = props.getSchema(type);

    if(schema.frequency !== 1)
        log(danger(`(FAIL) ${type}: Frequency (${schema.frequency} !== 1)`));
    else
        log(highlight("(OK)"), type[0].toUpperCase() + type.substring(1));
};

function saveTest (name: string, props: TypeMap) {
    writeFileSync("./test/" + name + ".json", JSON.stringify(props, null, 2));

}