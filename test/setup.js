import jsdom from 'jsdom';

const FAKE_DOM_HTML = `<html><body></body></html>`;

const setupDom = () => {
  if (typeof document !== 'undefined') {
    return;
  }

  global.document = jsdom.jsdom(FAKE_DOM_HTML);
  global.window = document.defaultView;
  global.navigator = window.navigator;
};

setupDom();
