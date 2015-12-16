import './setup';

import { shallow, mount } from 'enzyme';

import React from 'react';
import ReactDOM from 'react-dom';
import Todos from '../app/todos';
import Todo from '../app/todo';

import test from 'tape';


test('Todos component', (t) => {
  t.test('it renders a list of todos', (t) => {
    t.plan(1);
    const result = shallow(<Todos />);
    t.equal(result.find(Todo).length, 3);
  });

  t.test('Marking a todo as done', (t) => {
    t.plan(1);

    const result = mount(<Todos />);
    const firstToggle = result.find('.toggle-todo').at(0);
    firstToggle.simulate('click');

    const firstTodo = result.find('.todo-1').at(0);
    t.ok(firstTodo.hasClass('done-todo'));
  });

  t.test('Deleting a todo', (t) => {
    t.plan(1);
    const result = mount(<Todos />);
    const firstDelete = result.find('.delete-todo').at(0);
    firstDelete.simulate('click');

    t.equal(result.find('.todo').length, 2);
  });

  t.test('Adding a todo', (t) => {
    t.plan(1);
    const result = mount(<Todos />);
    const formInput = result.find('input').get(0);
    formInput.value = 'Buy Milk';
    result.find('button').simulate('click');
    t.equal(result.find('.todo').length, 4);
  });
});
