I've been spending a lot of 2015 spending a lot of time working with and writing about React, the library from Facebook for building web apps that needs no introduction. One thing I've yet to touch upon is testing, and today I'll share how I test React applications. There's lots of different approaches here, and there's no one right way to do it, but in this article I'll talk about my approach and preferred toolsets.

As an application to work with, I've picked a unique idea and built...a todo app! 

![](todo-screen.png).

[I've also recorded a video](http://quick.as/om8s6xg7) that demonstrates the functionality of our app. It lets you toggle todos being done, add new todos and delete todos too. There's nothing revolutionary in the app but it will provide a nice base to test from. [You can grab all the code on GitHub](https://github.com/jackfranklin/todo-react-testing) too if you'd like to run it locally.

## Babel and ECMAScript 2015

I've written the entire application in ES2015 using [Babel](http://babeljs.io). I've installed all our dependencies through npm as Node modules and webpack converts those into client side compatible files that combine to run our app in the browser. The nice thing about installing all our dependencies in Node is we can then use all those dependencies again in our tests. Additionally, running our tests in NodeJS rather than in the browser means we can avoid the complexities of running in a browser and run them entirely in the terminal.

## Testing Libraries

My testing library of choice for NodeJS is [Tape](https://github.com/substack/tape). Tape has a minimal API that I find helps to keep tests clear and leads to better assertions. [Eric Elliott's post on Tape](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4) does a great job of summarising the reasons why Tape is a good choice, and hopefully I'll demonstrate them as we move through the article. It's worth noting that we're using Tape as a test runner here; if you have another preferred choce you could easily swap it out at this point.

I'll also use [Babel Tape Runner](https://github.com/wavded/babel-tape-runner), a small module that configures Tape and Babel nicely. Finally, we'll be using [jsdom](https://github.com/tmpvar/jsdom) because in some of our tests React will expect to be within a browser, and we can use jsdom to fake out a browser in NodeJS.

Let's get started by installing all those as developer dependencies. If you want to follow along you can [checkout the first commit on the demo repo](https://github.com/jackfranklin/todo-react-testing/commit/408de34721a9cbfe36c7d880897c792d1739b46b) which doesn't have any of the testing libraries installed.

```
npm install --save-dev tape babel-tape-runner jsdom
```

I've already got Babel and its presets configured but let's quickly cover it. We need Babel and two of its presets, es2015 and react, to ensure everything is transpiled as we need.

```
npm install --save-dev babel-preset-es2015 babel-preset-react babel-core
```

Then we'll create `.babelrc` and tell Babel that we want to use those presets:

```
{
  "presets": ["es2015", "react"]
}
```

Finally, let's set up npm so we can run `npm test` to execute our tests. Edit the `scripts` part of the `package.json` file:

```js
"scripts": {
  "test": "babel-tape-runner test/**/*-test.js"
},
```

This will get tape to run any files in the `test` directory that are suffixed with `-test`.

## The First Component Test

The first component we will be testing is the `Todo` component:

```js
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
```

This component is given a `todo` as a prop, and renders it. It also takes two callbacks through props which it calls when the user toggles a todo or deletes it. This pattern is fairly common; the `Todo` component doesn't directly manipulate the state of the world but instead calls up to a higher level component to do it. We'll see how this is done and how to test that later in this article. For now though, there's a few bits of functionality we need to test:

1. It renders the Todo correctly - we'll test this by checking the todo `name` property is rendered.
2. When a todo is done it gives it an extra class of `done-todo`, which causes the strike through.
2. When a todo is clicked on it is toggled.
3. When the delete link is clicked it deletes the todo.

We can test 1 by rendering the component and looking for the text we want. 2 and 3 are tested by triggering clicks on the HTML and checking the right callback is called.

Before we start testing there's one more component we need. React's test utilities used to ship as part of React but they are now separate, so we need to install them:

```
npm install --save-dev react-addons-test-utils
```

The TestUtils are [fully documented](https://facebook.github.io/react/docs/test-utils.html) on the React docs, and I recommend getting familiar with them. We'll use a few methods in this tutorial.

### Shallow Rendering

To test that the rendered component contains text we could use the React test utils to render the component to the DOM. However, the test utils also provide a method for shallow rendering. In shallow rendering you "render" the component, but only one level deep. This means no children are ever rendered, but also means that no DOM is required. React fakes the rendering, and returns you an object representing what would have been rendered. If you can write your tests like this it's encouraged, no DOM (or fake DOM) means that the tests will be a little more performant and this can add up if you have a huge number of them. First, let's create `test/todo-test.js` and do some set up:

```js
import React from 'react';
import Todo from '../app/todo';

import TestUtils from 'react-addons-test-utils';

import test from 'tape';

function shallowRenderTodo(todo) {
  const renderer = TestUtils.createRenderer();
  renderer.render(<Todo todo={todo} />);
  return renderer.getRenderOutput();
}
```

We import some required dependencies and then create the function `shallowRenderTodo`, which takes a todo object and returns a shallow rendered version of the `Todo` component that we can assert on. Now let's start with the tests:

```
test('Todo component', (t) => {
  t.test('rendering a not-done tweet', (t) => {
    const todo = { id: 1, name: 'Buy Milk', done: false };
    const result = shallowRenderTodo(todo);

    t.test('It renders the text of the todo', (t) => {
      t.plan(1);
      t.equal(result.props.children[0].props.children, 'Buy Milk');
    });
  });
});
```

Tape works by providing a `test` function that you call with a description and a callback, which Tape will call with an argument, which is commonly referred to as `t`. This is the object that you assert on or call `test` on to nest tests. In this test we first create a new todo and pass it to `shallowRenderTodo` to get a fake object that mirrors what would be rendered to a real DOM. Note the call to `t.plan`, Tape requires you to tell it how many assertions you're going to make. I've actually found this a really nice way to self document, and it also means Tape works with async tests out of the box - it will simply wait to allow async tests to execute.

Finally, we make an assertion on the shallow rendered content that `result.props.children[0].props.children` is set to `Buy Milk`. This structure might seem a bit alien, but once you get used to working with React components that have been shallow rendered you'll be more familiar with it. Any child elements are always contained within `props.children`, so all we're doing above is going through the tree of the React component to find the text that was rendered.

Additionally, we'll make another assertion that when we render an incomplete todo it does not get given the class of `done-todo`. To do this we can access the `className` property of the shallow rendered component, and check if it contains `done-todo`:

```js
t.test('The todo does not have the done class', (t) => {
  t.plan(1);
  t.equal(result.props.className.indexOf('done-todo'), -1);
});
```

Now, let's render a todo that is completed and check that it does have the correct class applied.

```js
t.test('rendering a done tweet', (t) => {
  const todo = { id: 1, name: 'Buy Milk', done: true };
  const result = shallowRenderTodo(todo);
  
  t.test('The todo does have the done class', (t) => {
    t.plan(1);
    t.ok(result.props.className.indexOf('done-todo') > -1);
  });
});
```

Finally, we're ready to run the tests! You should be able to run `npm test` to see the results of our work.

```
> testing-react@1.0.0 test /Users/jackfranklin/git/testing-react
> babel-tape-runner test/**/*-test.js

TAP version 13
# Todo component
# rendering a not-done tweet
# It renders the text of the todo
ok 1 should be equal
# The todo does not have the done class
ok 2 should be equal
# rendering a done tweet
# The todo does have the done class
ok 3 (unnamed assert)

1..3
# tests 3
# pass  3

# ok
```

Whilst the output from Tape isn't the most beautifully formatted, it follows the TAP protocol. This means that there's lots of formatters available to take the above results and turn them into something that looks much nicer. Some of my favourites are [Faucet](https://github.com/substack/faucet) and [Tap Prettify](https://github.com/toolness/tap-prettify) but you can find a comprehensive list [on the Tape GitHub page](https://github.com/substack/tape#pretty-reporters). The good news is that all of our tests are passing!

### Rendering to the DOM

Sometimes though we need to be able to have a DOM to fully render components and simulate user interactions on those components. Given that we're running our tests in NodeJS we need to do some work to set everything up correctly. Thankfully the module we installed earlier, jsdom, does a great job of sorting all this out for us. Create the file `tests/setup.js`:

```js
import jsdom from 'jsdom';

function setupDom() {
  if (typeof document !== 'undefined') {
    return;
  }

  global.document = jsdom.jsdom('<html><body></body></html>');
  global.window = document.defaultView;
  global.navigator = window.navigator;
};

setupDom();
```

This file will check to see if `document` is defined, and set it up if it isn't. Note that you'll need to import this file __before__ you import React, because React does some checks when it loads to see if a DOM is present. Update the top of `test/todo-test.js` to import this file:

```js
import './setup';

import React from 'react';
// rest of imports and tests below
```

Next, we can write a test that ensures when we click on a Todo to toggle it between done and incomplete the right callback is called. If you recall from looking at the implementation of the `Todo` component we give it a property that it should call when a user toggles a todo. We'll test that when we click on a todo the component does call that function. This time though we'll be rendering into the DOM and simulating user interaction.


t.test('toggling a TODO calls the given prop', (t) => {
  t.plan(1);
  
  const doneCallback = (id) => t.equal(id, 1);
  const todo = { id: 1, name: 'Buy Milk', done: false };
  
  const result = TestUtils.renderIntoDocument(
    <Todo todo={todo} doneChange={doneCallback} />
  );

  // assertion will go here
});

Using `TestUtils.renderIntoDocument` we can take the component and render it into the DOM. Note that each `renderIntoDocument` renders into a _detached_ DOM node, which means no one test and interfere with another. I pass the component `doneCallback`, which is a function that takes in the ID of the todo and makes an assertion that it will be equal to `1`, which is the ID of the given todo in the test. If this callback never gets called then Tape will detect that we haven't made all the assertions we planned and the test will fail.

Finally, we can use `findRenderedDOMComponentWithTag` to search for the paragraph element in our rendered todo component:

```js
const todoText = TestUtils.findRenderedDOMComponentWithTag(result, 'p');
```

And then use `TestUtils.Simulate` to simulate a user interaction:

```js
TestUtils.Simulate.click(todoText);
```

This click should cause our callback to be executed and therefore our assertion to run. Here's the full test:

```js
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
```

We can write another test that looks very similar. This one tests that when we click the Delete link the correct callback is called:

```js
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
```

And with that all our `Todo` component tests are complete, and passing!

```
 TAP version 13
# Todo component
# rendering a not-done tweet
# It renders the text of the todo
ok 1 should be equal
# The todo does not have the done class
ok 2 should be equal
# rendering a done tweet
# The todo does have the done class
ok 3 (unnamed assert)
# toggling a TODO calls the given prop
ok 4 should be equal
# deleting a TODO calls the given prop
ok 5 should be equal

1..5
# tests 5
# pass  5

# ok
```

This might seem like a lot of effort, and a lot of new functionality to learn, but the good news is that most React component tests will follow roughly this structure. Once you gain familiarity with the React test utils they will have you covered. Now we've covered a lot of the basics we'll move at a little more speed through the rest of the tests.

## Adding a Todo

The `AddTodo` component renders an input and a button which can be clicked to add a new todo to the page. Here's the source for it:

```js
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
```

Following the same pattern as the `Todo` component, this component is given a callback to call with the name of the latest todo. Create `test/add-todo-test.js` and add the following:

```js
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
```

As you can see this structure matches the other tests pretty nicely. The only change is we now reach itno the DOM twice to manipulate different elements. In the first case we grab the input and update its value to `Buy Milk`, as if the user had typed it in. Then we find the `button` element and simulate a click on it. This causes `todoCallback` to be called, which asserts that the object it was given has a `name` property of `Buy Milk`.

## Testing the Todos component

We've tested our two smaller components, `Todo` and `AddTodo`, and now it's time to move onto `Todos`, which is the largest component that contains our entire app. Its source is below:

```js
import React from 'react';
import Todo from './todo';
import AddTodo from './add-todo';

export default class Todos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [
        { id: 1, name: 'Write the blog post', done: false },
        { id: 2, name: 'Buy Christmas presents', done: false },
        { id: 3, name: 'Leave Santa his mince pies', done: false },
      ]
    }
  }

  toggleDone(id) {
    const todos = this.state.todos.map((todo) => {
      if (todo.id === id) {
        todo.done = !todo.done;
      }

      return todo;
    });

    this.setState({ todos });
  }

  addTodo(todo) {
    const lastTodo = this.state.todos[this.state.todos.length - 1];
    todo.id = lastTodo.id + 1;
    todo.done = false;
    this.setState({
      todos: this.state.todos.concat([todo])
    });
  }

  deleteTodo(id) {
    this.setState({
      todos: this.state.todos.filter((todo) => todo.id !== id)
    })
  }

  renderTodos() {
    return this.state.todos.map((todo) => {
      return (
        <li key={todo.id}>
          <Todo
            todo={todo}
            doneChange={(id) => this.toggleDone(id)}
            deleteTodo={(id) => this.deleteTodo(id)} />
        </li>
      );
    });
  }

  render() {
    return (
      <div>
        <p>The <em>best</em> todo app out there.</p>
        <h1>Things to get done:</h1>
        <ul className="todos-list">{ this.renderTodos() }</ul>
        <AddTodo onNewTodo={(todo) => this.addTodo(todo)} />
      </div>
    )
  }
}
```

In this case I've hard coded our state with three items, but you can imagine that this might instead come from a database or API request. The `Todos` component is the only component that knows how to update the state, so it has methods called `toggleDone`, `addTodo` and `deleteTodo` that do just that. When it renders the `Todo` and `AddTodo` components it passes them a callback function (the ones we tested earlier) that trigger the methods that cause changes to the state.

The tests we'll write for the `Todos` component will be a little more overarching - we'll test that when you add a new todo item, it is indeed rendered and the length of the `ul` containing the items changes from 3 to 4. Rather than just testing a callback we'll actually assert on changes to the DOM output.

The first test will test how many todo items it renders. We're expecting there to be three, to match the initial three we have in the state. Once again we can do this using shallow rendering - avoiding a "real" DOM render whenever possible is encouraged.

```js
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

  // more tests to come!
});
```

### Marking a todo as done

Next, let's write a complete test for testing that we can mark a todo item as done. To do this we'll simulate a user clicking on a todo item and then find that todo item in the DOM, asserting that it's been given the class `done-todo`.
 

```js
t.test('Marking a todo as done', (t) => {
  t.plan(1);

  const result = TestUtils.renderIntoDocument(<Todos />);
  const firstToggle = TestUtils.scryRenderedDOMComponentsWithClass(result, 'toggle-todo')[0];
  TestUtils.Simulate.click(firstToggle);

  const firstTodo = TestUtils.findRenderedDOMComponentWithClass(result, 'todo-1');
  t.ok(firstTodo.classList.contains('done-todo'));
});
```

Here we render `Todos` into the DOM. We then need to find the first paragraph with the `toggle-todo` class. To do this we use `scryRenderedDOMComponentsWithClass`, a rather oddly named method that searches for all items with a given class. The name `scry` here comes from ["Scrying"](https://en.m.wikipedia.org/wiki/Scrying):

> Scrying (also called seeing or peeping) is the practice of looking into a translucent ball

So you can think of it as looking into the DOM to see what we might find. Thanks to [@darkliquid](https://twitter.com/darkliquid) on Twitter for clarifying that to me!

In our case we only need the first toggle button (there's no reason you couldn't use the second or third if you wanted), so we just grab the first item returned before simulating a `click` event on it.

Finally I then use `findRenderedDOMComponentWithClass` to pull out the todo with a class of `todo-1` (each todo gets a class based on its id), and then assert that it has the `done-todo` class using the [classList API](https://developer.mozilla.org/en/docs/Web/API/Element/classList).

An important note here is that `findRenderedDOMComponentWithClass` expects there to be __just done__ element found, and will error if there's 0 or >1 items found. If you need to find an element where you're expecting multiple instances, use the `scryRenderedDOMComponentsWithClass` alternative.

### Deleting a Todo

Next up we'll test deleting a todo. This follows a very similar pattern to the previous test, with the only difference being the assertion. In this case we assert that the number of todo items found in the DOM after deleting one will be two, rather than three:

```js
t.test('Deleting a todo', (t) => {
  t.plan(1);
  const result = TestUtils.renderIntoDocument(<Todos />);
  const firstDelete = TestUtils.scryRenderedDOMComponentsWithClass(result, 'delete-todo')[0];
  TestUtils.Simulate.click(firstDelete);

  const todos = TestUtils.scryRenderedDOMComponentsWithClass(result, 'todo');
  t.equal(todos.length, 2);
});
```

### Adding a Todo

The final key piece of functionality to cover is adding a todo. Once again this test simply reuses the approaches we've used througout the article. First we pull out the form input and update its value before clicking the button on the page. The assertion here ensures that when we do add a new todo we end up with four of them in the DOM:

```js
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
```

With that we can now run all our tests and make sure we're green:
 

 
 
 

 
 
 
 

