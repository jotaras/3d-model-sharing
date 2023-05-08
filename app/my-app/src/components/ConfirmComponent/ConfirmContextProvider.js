import React, { createContext, useState } from 'react';

export const ConfirmContext = createContext();

export default function ConfirmContextProvider({children}) {
    const [confirm, setConfirm] = useState({
        message: '',
        isOpen: false,
        doConfirm: null,
        cancel: null
    });

    return (
        <ConfirmContext.Provider value={[confirm, setConfirm]}>
            {children}
        </ConfirmContext.Provider>
    );

}
