import React from 'react';

export default class Todo extends React.Component {
  toggleDone() {
    this.props.doneChange(this.props.todo.id);
  }

  deleteTodo(e) {
    e.preventDefault();
    this.props.deleteTodo(this.props.todo.id);
  }

  render() {
    const { todo } = this.props;

    const className = todo.done ? 'done-todo' : '';

    return (
      <div className={`todo ${className} todo-${todo.id}`}>
        <p className="toggle-todo" onClick={() => this.toggleDone() }>{ todo.name }</p>
        <a className="delete-todo" href="#" onClick={(e) => this.deleteTodo(e) }>Delete</a>
      </div>
    )
  }
}
