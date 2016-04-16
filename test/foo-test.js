import test from 'tape';

test.only('Adding numbers', (t) => {
  t.test('2 + 2 is 4', (t) => {
    t.plan(1);
    t.equal(2 + 2, 4);
  });

  t.test('some objects are equal', (t) => {
    t.plan(1);
    const obj = { a: 1 };
    t.deepEqual(obj, { a: 1 });
  });
});
