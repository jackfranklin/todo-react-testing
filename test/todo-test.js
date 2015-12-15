import './setup';

import React from 'react';
import Todo from '../app/todo';

import TestUtils from 'react-addons-test-utils';

import test from 'tape';

function shallowRenderTodo(todo) {
  const renderer = TestUtils.createRenderer();
  renderer.render(<Todo todo={todo} />);
  return renderer.getRenderOutput();
}

test('Todo component', (t) => {
  t.test('rendering a not-done tweet', (t) => {
    const todo = { id: 1, name: 'Buy Milk', done: false };
    const result = shallowRenderTodo(todo);

    t.test('It renders the text of the todo', (t) => {
      t.plan(1);
      t.equal(result.props.children[0].props.children, 'Buy Milk');
    });

    t.test('The todo does not have the done class', (t) => {
      t.plan(1);
      t.equal(result.props.className.indexOf('done-todo'), -1);
    });
  });

  t.test('rendering a done tweet', (t) => {
    const todo = { id: 1, name: 'Buy Milk', done: true };
    const result = shallowRenderTodo(todo);

    t.test('The todo does have the done class', (t) => {
      t.plan(1);
      t.ok(result.props.className.indexOf('done-todo') > -1);
    });
  });

  t.test('toggling a TODO calls the given prop', (t) => {
    t.plan(1);

    const doneCallback = (id) => t.equal(id, 1);
    const todo = { id: 1, name: 'Buy Milk', done: false };

    const result = TestUtils.renderIntoDocument(
      <Todo todo={todo} doneChange={doneCallback} />
    );

    const todoText = TestUtils.findRenderedDOMComponentWithTag(result, 'p');
    TestUtils.Simulate.click(todoText);
  });

  t.test('deleting a TODO calls the given prop', (t) => {
    t.plan(1);
    const deleteCallback = (id) => t.equal(id, 1);
    const todo = { id: 1, name: 'Buy Milk', done: false };

    const result = TestUtils.renderIntoDocument(
      <Todo todo={todo} deleteTodo={deleteCallback} />
    );

    const todoLink = TestUtils.findRenderedDOMComponentWithTag(result, 'a');
    TestUtils.Simulate.click(todoLink);
  });
});
