import React from 'react';

export default class AddTodo extends React.Component {
  addTodo(e) {
    e.preventDefault();
    const newTodoName = this.refs.todoTitle.value;
    if (newTodoName) {
      this.props.onNewTodo({
        name: newTodoName
      });

      this.refs.todoTitle.value = '';
    }
  }
  render() {
    return (
      <div className="add-todo">
        <input type="text" placeholder="Walk the dog" ref="todoTitle" />
        <button onClick={(e) => this.addTodo(e) }>
          Add Todo
        </button>
      </div>
    )
  }
}
