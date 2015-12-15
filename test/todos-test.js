import './setup';

import React from 'react';
import ReactDOM from 'react-dom';
import Todos from '../app/todos';

import TestUtils from 'react-addons-test-utils';

import test from 'tape';

function shallowRender() {
  const renderer = TestUtils.createRenderer();
  renderer.render(<Todos />);
  return renderer.getRenderOutput();
}

test('Todos component', (t) => {
  t.test('it renders a list of todos', (t) => {
    t.plan(1);
    const result = shallowRender();
    const todoChildren = result.props.children[2].props.children;
    t.equal(todoChildren.length, 3);
  });

  t.test('Marking a todo as done', (t) => {
    t.plan(1);

    const result = TestUtils.renderIntoDocument(<Todos />);
    const firstToggle = TestUtils.scryRenderedDOMComponentsWithClass(result, 'toggle-todo')[0];
    TestUtils.Simulate.click(firstToggle);

    const firstTodo = TestUtils.findRenderedDOMComponentWithClass(result, 'todo-1');
    t.ok(firstTodo.classList.contains('done-todo'));
  });

  t.test('Deleting a todo', (t) => {
    t.plan(1);
    const result = TestUtils.renderIntoDocument(<Todos />);
    const firstDelete = TestUtils.scryRenderedDOMComponentsWithClass(result, 'delete-todo')[0];
    TestUtils.Simulate.click(firstDelete);

    const todos = TestUtils.scryRenderedDOMComponentsWithClass(result, 'todo');
    t.equal(todos.length, 2);
  });

  t.test('Adding a todo', (t) => {
    t.plan(1);
    const result = TestUtils.renderIntoDocument(<Todos />);
    const formInput = TestUtils.findRenderedDOMComponentWithTag(result, 'input');
    formInput.value = 'Buy Milk';

    const button = TestUtils.findRenderedDOMComponentWithTag(result, 'button');
    TestUtils.Simulate.click(button);

    const todos = TestUtils.scryRenderedDOMComponentsWithClass(result, 'todo');
    t.equal(todos.length, 4);
  });
});
