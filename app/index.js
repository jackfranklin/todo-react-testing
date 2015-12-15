import React from 'react';
import { render } from 'react-dom';

import Todos from './todos';

class AppComponent extends React.Component {
  render() {
    return (
      <div>
        <Todos />
      </div>
    );
  }
}

render(
  <AppComponent />,
  document.getElementById('app')
);
