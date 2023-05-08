import React, { createContext, useState } from 'react';

export const AlertsContext = createContext();

export default function AlertsContextProvider({children}) {
    const [alerts, setAlerts] = useState([]);

    return (
        <AlertsContext.Provider value={{alerts, setAlerts}}>
            {children}
        </AlertsContext.Provider>
    );

}
