import { useContext } from 'react';
import { ConfirmContext } from './ConfirmContextProvider';

const useConfirmHook = () => {
    const [confirm, setConfirm] = useContext(ConfirmContext);

    const confirmDialog  = (message) => {
        const promise = new Promise((resolve, reject) => {
            setConfirm({ message, isOpen: true, doConfirm: resolve, cancel: reject });
        });

        return promise.then(
            () => {
                setConfirm({ message: '', isOpen: false, doConfirm: null, cancel: null });
                return true;
            },
            () => {
                setConfirm({ message: '', isOpen: false, doConfirm: null, cancel: null });
                return false;
            }
        );
    };
    return {...confirm, confirmDialog};
};

export default useConfirmHook;
