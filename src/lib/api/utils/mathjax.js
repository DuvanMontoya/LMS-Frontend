import pkg from 'mathjax';
const { Loader, Typed } = pkg;

export const loader = new Loader({
  loader: {
    load: ['input/tex', 'output/chtml'],
  },
});

export const tex = new Typed(loader, {
  output: 'chtml',
});