export default {
  multipass: false, // boolean
  js2svg:    {
    indent: 4, // number
    pretty: false, // boolean
  },
  plugins: [
    'preset-default', // built-in plugins enabled by default
    {
      name:   'cleanupIds',
      params: {
        remove: true,
      },
    },
  ],
};
