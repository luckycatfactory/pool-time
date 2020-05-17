import React from 'react';

const RegistrationContext = React.createContext<
  (timeKey: string) => { unregister: () => void }
>(() => ({
  unregister: (): void => undefined,
}));

export default RegistrationContext;
