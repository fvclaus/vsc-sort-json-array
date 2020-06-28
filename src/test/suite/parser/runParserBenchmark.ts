import * as Benchmark from 'benchmark';
import parseLooseJson from '../../../parser/parseLooseJson';
import fakeParseJSON from '../../../parser/fakeParser';


function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0; const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function generateObject(numberOfProperties = 20) {
  return Array.from(new Array(numberOfProperties).keys())
      .reduce((obj, i) => {
        const randomProperty = getRandomInt(0, 1);
        const key = `key${i}`;
        let value: unknown;
        if (randomProperty < 0.5) {
          value = generateUuidV4();
        } else if (randomProperty < 0.7) {
          value = randomProperty <= 0.5;
        } else if (randomProperty < 0.9) {
          value = getRandomInt(-1000, 1000);
        } else {
          value = getRandomArbitrary(-1000, 1000);
        }
        obj[key] = value;
        return obj;
      }, {} as {[key: string]: unknown});
}

function generateObjectArray(numberOfObjects: number, numberOfProperties = 20) {
  return Array.from(new Array(numberOfObjects).keys())
      .map(() => generateObject(numberOfProperties));
}

([
  [() => [1, '4', false, null, {bar: 'foo'}, [1]], 'small'],
  [() => generateObjectArray(50), 'medium'],
  [() => generateObjectArray(2000), 'large'],
] as [() => unknown[], string][]).forEach(([arrayFn, name]) => {
  const arrayString = JSON.stringify(arrayFn(), null, 2);
  // add tests
  const suite = new Benchmark.Suite(name);
  suite
      .add(`parseJson#${name}`, () => {
        JSON.parse(arrayString);
      })
      .add(`antlr4#${name}`, () => {
        parseLooseJson(arrayString);
      })
      .add(`fakeParseJson#${name}`, () => {
        fakeParseJSON(arrayString);
      })
      // TODO Test stripped down version of fakeParseJson
  // add listeners
      .on('cycle', function(event: any) {
        console.log(String(event.target));
      })
      .on('complete', function(this: any) {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
      })
  // run async
      .run({'async': false});
});
