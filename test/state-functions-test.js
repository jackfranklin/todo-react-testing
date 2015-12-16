import {
  addTodo,
  toggleDone,
  deleteTodo
} from '../app/state-functions';

import test from 'tape';

test('toggleDone', (t) => {
  t.test('with an incomplete todo it updates done to true', (t) => {
    t.plan(1);

    const initialState = {
      todos: [{ id: 1, name: 'Buy Milk', done: false }]
    };

    const newState = toggleDone(initialState, 1);

    t.ok(newState.todos[0].done);
  });

  t.test('with a complete todo it updates done to false', (t) => {
    t.plan(1);

    const initialState = {
      todos: [{ id: 1, name: 'Buy Milk', done: true }]
    };

    const newState = toggleDone(initialState, 1);

    t.equal(newState.todos[0].done, false);
  });
});

test('addTodo', (t) => {
  t.test('it can add a new todo and set the right id', (t) => {
    t.plan(1);

    const initialState = {
      todos: [{ id: 1, name: 'Buy Milk', done: true }]
    };

    const newState = addTodo(initialState, { name: 'Get bread' });

    t.deepEqual(newState.todos[1], {
      name: 'Get bread',
      id: 2,
      done: false
    });
  });
});

test('deleteTodo', (t) => {
  t.test('it deletes the todo matching the given ID', (t) => {
    t.plan(1);

    const initialState = {
      todos: [
        { id: 1, name: 'Buy Milk', done: true },
        { id: 2, name: 'Get bread', done: true },
      ]
    };

    const newState = deleteTodo(initialState, 1);

    t.deepEqual(newState.todos, [{
      name: 'Get bread',
      id: 2,
      done: true
    }]);
  });
});
