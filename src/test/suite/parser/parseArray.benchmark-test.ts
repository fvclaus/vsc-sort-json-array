import * as Benchmark from 'benchmark';
import parseArray from '../../../parser/parseArray';


function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0; const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function generateObject(numberOfProperties = 20): object {
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

function generateObjectArray(numberOfObjects: number, numberOfProperties = 20): object[] {
  return Array.from(new Array(numberOfObjects).keys())
      .map(() => generateObject(numberOfProperties));
}

suite('parseJsonBenchmark', function() {
  ([
    [() => [1, '4', false, null, {bar: 'foo'}, [1]], 'small', 0.001],
    [() => generateObjectArray(50), 'medium', 0.1],
    [() => generateObjectArray(500), 'large', 0.5],
  ] as [() => unknown[], string, number][]).forEach(([arrayFn, name, expectedMaxMeanExecutionTime]) => {
    test(`should run below expected time for ${name} dataset`, function(done) {
      const arrayString = JSON.stringify(arrayFn(), null, 2);
      new Benchmark.Suite(name)
          .add(`antlr4#${name}`, () => {
            parseArray(arrayString);
          }, {
            maxTime: 1,
            async: true,
            minSamples: 2,
            initCount: 1,
          })
          .on('cycle', function(event: Benchmark.Event) {
            const stats = event.target.stats;
            if (stats == null) {
              throw new Error(`Expected stats to be defined`);
            }
            if (stats.mean > expectedMaxMeanExecutionTime) {
              done(new Error(`stats.mean ${stats.mean} greater than ${expectedMaxMeanExecutionTime}`));
            } else {
              done();
            }
          })
          .run();
    });
  });
});

