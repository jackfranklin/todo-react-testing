import './setup';

import React from 'react';
import AddTodo from '../app/add-todo';

import { mount } from 'enzyme';
import { Double } from 'doubler';

import test from 'tape';

test('Add Todo component', (t) => {
  t.test('it calls the given callback prop with the new text', (t) => {
    t.plan(2);

    const todoCallback = Double.function();

    const form = mount(<AddTodo onNewTodo={todoCallback} />);

    const input = form.find('input').get(0);
    input.value = 'Buy Milk';

    form.find('button').simulate('click');
    t.equal(todoCallback.callCount, 1);
    t.deepEqual(todoCallback.args[0][0], { name: 'Buy Milk' });
  });
});
