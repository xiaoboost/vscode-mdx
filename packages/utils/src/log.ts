const prefix = '⚡ [language server]';

export const printer = {
  log(...messages: string[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(prefix, ...messages);
    }
  },
};
