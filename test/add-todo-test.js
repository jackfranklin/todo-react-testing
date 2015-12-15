import './setup';

import React from 'react';
import AddTodo from '../app/add-todo';

import TestUtils from 'react-addons-test-utils';
import test from 'tape';

test('Add Todo component', (t) => {
  t.test('it calls the given callback prop with the new text', (t) => {
    t.plan(1);

    const todoCallback = ({ name }) => {
      t.equal(name, 'Buy Milk');
    }

    const form = TestUtils.renderIntoDocument(
      <AddTodo onNewTodo={todoCallback} />
    );

    const input = TestUtils.findRenderedDOMComponentWithTag(form, 'input');
    input.value = 'Buy Milk';

    const button = TestUtils.findRenderedDOMComponentWithTag(form, 'button');
    TestUtils.Simulate.click(button);
  });
});
