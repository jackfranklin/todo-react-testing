import './setup';

import React from 'react';
import AddTodo from '../app/add-todo';

import { mount } from 'enzyme';

import test from 'tape';

test('Add Todo component', (t) => {
  t.test('it calls the given callback prop with the new text', (t) => {
    t.plan(1);

    const todoCallback = ({ name }) => {
      console.log('i was called');
      t.equal(name, 'Buy Milk');
    }

    const form = mount(<AddTodo onNewTodo={todoCallback} />);

    const input = form.find('input').get(0);
    input.value = 'Buy Milk';

    form.find('button').simulate('click');
  });
});
